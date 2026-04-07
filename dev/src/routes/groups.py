from flask import Blueprint, request, jsonify, session
from src.models.user import User, Group, GroupMember, db

groups_bp = Blueprint('groups', __name__)

def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@groups_bp.route('/groups', methods=['GET'])
def get_groups():
    """Get all groups for current user"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    groups = Group.query.filter(
        Group.id.in_(db.session.query(GroupMember.group_id).filter_by(user_id=current_user.id))
    ).all()
    
    return jsonify({
        'groups': [group.to_dict() for group in groups]
    })

@groups_bp.route('/groups', methods=['POST'])
def create_group():
    """Create a new group"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Group name required'}), 400
    
    try:
        group = Group(
            name=data['name'],
            description=data.get('description'),
            created_by=current_user.id,
            profile_picture=data.get('profile_picture')
        )
        db.session.add(group)
        db.session.commit()
        
        # Add creator as admin member
        member = GroupMember(
            group_id=group.id,
            user_id=current_user.id,
            role='admin'
        )
        db.session.add(member)
        db.session.commit()
        
        return jsonify({
            'message': 'Group created successfully',
            'group': group.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/groups/<int:group_id>/members', methods=['POST'])
def add_member(group_id):
    """Add a member to a group"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    # Check if user is admin
    membership = GroupMember.query.filter_by(group_id=group_id, user_id=current_user.id).first()
    if not membership or membership.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    
    # Check if user is already a member
    existing = GroupMember.query.filter_by(group_id=group_id, user_id=user_id).first()
    if existing:
        return jsonify({'error': 'User is already a member'}), 400
    
    try:
        member = GroupMember(
            group_id=group_id,
            user_id=user_id,
            role='member'
        )
        db.session.add(member)
        db.session.commit()
        
        return jsonify({
            'message': 'Member added successfully',
            'member': member.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/groups/<int:group_id>/members', methods=['GET'])
def get_members(group_id):
    """Get all members of a group"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Check if user is a member
    membership = GroupMember.query.filter_by(group_id=group_id, user_id=current_user.id).first()
    if not membership:
        return jsonify({'error': 'Not a member of this group'}), 403
    
    members = GroupMember.query.filter_by(group_id=group_id).all()
    
    return jsonify({
        'members': [member.to_dict() for member in members]
    })

