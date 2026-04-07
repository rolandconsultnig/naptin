from flask import Blueprint, request, jsonify, session
from src.models.user import User, Meeting, MeetingParticipant, db
from datetime import datetime
import secrets

meetings_bp = Blueprint('meetings', __name__)

def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

def generate_meeting_code():
    """Generate a unique meeting code"""
    return secrets.token_urlsafe(8).upper()[:8]

@meetings_bp.route('/meetings', methods=['POST'])
def create_meeting():
    """Create a new meeting"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': 'Meeting title required'}), 400
    
    try:
        meeting_code = generate_meeting_code()
        # Ensure uniqueness
        while Meeting.query.filter_by(meeting_code=meeting_code).first():
            meeting_code = generate_meeting_code()
        
        meeting = Meeting(
            title=data['title'],
            description=data.get('description'),
            host_id=current_user.id,
            meeting_code=meeting_code,
            meeting_type=data.get('meeting_type', 'meeting'),
            allow_screen_sharing=data.get('allow_screen_sharing', True),
            allow_presentation=data.get('allow_presentation', True),
            scheduled_at=data.get('scheduled_at') if data.get('scheduled_at') else None,
            duration=data.get('duration', 60) if data.get('meeting_type') == 'scheduled' else None
        )
        db.session.add(meeting)
        db.session.commit()
        
        # Add host as participant
        participant = MeetingParticipant(
            meeting_id=meeting.id,
            user_id=current_user.id,
            role='host'
        )
        db.session.add(participant)
        db.session.commit()
        
        return jsonify({
            'message': 'Meeting created successfully',
            'meeting': meeting.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@meetings_bp.route('/meetings/<meeting_code>', methods=['GET'])
def get_meeting_by_code(meeting_code):
    """Get meeting by code"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    meeting = Meeting.query.filter_by(meeting_code=meeting_code).first()
    if not meeting:
        return jsonify({'error': 'Meeting not found'}), 404
    
    return jsonify({
        'meeting': meeting.to_dict()
    })

@meetings_bp.route('/meetings/<int:meeting_id>/join', methods=['POST'])
def join_meeting(meeting_id):
    """Join a meeting"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return jsonify({'error': 'Meeting not found'}), 404
    
    # Check if already a participant
    existing = MeetingParticipant.query.filter_by(meeting_id=meeting_id, user_id=current_user.id).first()
    if existing:
        return jsonify({
            'message': 'Already a participant',
            'participant': existing.to_dict()
        }), 200
    
    try:
        participant = MeetingParticipant(
            meeting_id=meeting_id,
            user_id=current_user.id,
            role='participant'
        )
        db.session.add(participant)
        db.session.commit()
        
        return jsonify({
            'message': 'Joined meeting successfully',
            'participant': participant.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@meetings_bp.route('/meetings/<int:meeting_id>/participants', methods=['GET'])
def get_participants(meeting_id):
    """Get meeting participants"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return jsonify({'error': 'Meeting not found'}), 404
    
    participants = MeetingParticipant.query.filter_by(meeting_id=meeting_id).all()
    
    return jsonify({
        'participants': [p.to_dict() for p in participants]
    })

@meetings_bp.route('/meetings/<int:meeting_id>/start', methods=['POST'])
def start_meeting(meeting_id):
    """Start a meeting"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return jsonify({'error': 'Meeting not found'}), 404
    
    if meeting.host_id != current_user.id:
        return jsonify({'error': 'Only host can start meeting'}), 403
    
    try:
        meeting.status = 'active'
        meeting.started_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Meeting started',
            'meeting': meeting.to_dict()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@meetings_bp.route('/meetings/<int:meeting_id>/end', methods=['POST'])
def end_meeting(meeting_id):
    """End a meeting"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return jsonify({'error': 'Meeting not found'}), 404
    
    if meeting.host_id != current_user.id:
        return jsonify({'error': 'Only host can end meeting'}), 403
    
    try:
        meeting.status = 'ended'
        meeting.ended_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Meeting ended',
            'meeting': meeting.to_dict()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

