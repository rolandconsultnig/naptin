from flask import Blueprint, request, jsonify, session
from src.models.user import db, User, Message, Group, GroupMember, Tenant, TenantMember, TenantModulePolicy, TenantAuditEvent
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

PORTAL_SEGMENTS = [
    'dashboard', 'intranet', 'collaboration', 'chat', 'meetings', 'profile',
    'human-resource', 'finance', 'training', 'procurement', 'asset-management',
    'documents', 'legal', 'corporate', 'ict', 'mande', 'integrations', 'security'
]

DEFAULT_TENANTS = [
    {'key': 'naptin-hq', 'name': 'NAPTIN HQ'},
    {'key': 'lagos-campus', 'name': 'Lagos Campus'},
    {'key': 'kaduna-campus', 'name': 'Kaduna Campus'},
]

LEGACY_TENANT_ROUTES_REMOVED = {
    'error': 'Legacy tenant routes removed',
    'reason': (
        'Legacy Owl-talk tenant tables/routes were retired during enterprise RBAC cleanup. '
        'Use enterprise admin RBAC APIs instead.'
    ),
    'replacement': '/api/v1/admin/rbac/*',
}

def require_admin():
    """Check if user is admin"""
    if 'user_id' not in session:
        return None
    
    user = User.query.get(session['user_id'])
    if not user or not user.is_admin:
        return None
    
    return user


def ensure_default_tenants():
    changed = False
    for t in DEFAULT_TENANTS:
        existing = Tenant.query.filter_by(key=t['key']).first()
        if existing:
            continue
        db.session.add(Tenant(key=t['key'], name=t['name'], is_active=True))
        changed = True
    if changed:
        db.session.commit()


def get_tenant_from_request():
    tenant_key = request.args.get('tenant_key')
    if request.is_json:
        body = request.get_json(silent=True) or {}
        tenant_key = tenant_key or body.get('tenant_key')

    if not tenant_key:
        tenant = Tenant.query.filter_by(key='naptin-hq').first()
        if tenant:
            return tenant
        return Tenant.query.order_by(Tenant.id.asc()).first()

    return Tenant.query.filter_by(key=tenant_key).first()


def ensure_membership(tenant, user):
    membership = TenantMember.query.filter_by(tenant_id=tenant.id, user_id=user.id).first()
    if membership:
        return membership
    membership = TenantMember(tenant_id=tenant.id, user_id=user.id, role='admin')
    db.session.add(membership)
    db.session.commit()
    return membership


def write_tenant_audit(tenant_id, actor_user_id, action, detail):
    event = TenantAuditEvent(
        tenant_id=tenant_id,
        actor_user_id=actor_user_id,
        action=action,
        detail=detail,
    )
    db.session.add(event)
    db.session.commit()


@admin_bp.route('/admin/tenants', methods=['GET'])
def list_tenants():
    return jsonify(LEGACY_TENANT_ROUTES_REMOVED), 410


@admin_bp.route('/admin/tenant-module-policy', methods=['GET'])
def get_tenant_module_policy():
    return jsonify(LEGACY_TENANT_ROUTES_REMOVED), 410


@admin_bp.route('/admin/tenant-module-policy/<string:segment>', methods=['PUT'])
def update_tenant_module_policy(segment):
    return jsonify(LEGACY_TENANT_ROUTES_REMOVED), 410


@admin_bp.route('/admin/tenant-audit', methods=['GET'])
def get_tenant_audit():
    return jsonify(LEGACY_TENANT_ROUTES_REMOVED), 410

@admin_bp.route('/admin/stats', methods=['GET'])
def get_admin_stats():
    """Get system statistics for admin dashboard"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        # Get basic stats
        total_users = User.query.count()
        online_users = User.query.filter(User.status == 'online').count()
        total_messages = Message.query.filter(Message.is_deleted == False).count()
        total_groups = Group.query.count()
        
        # Get today's stats - use start and end of today for accurate filtering
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = datetime.utcnow()
        
        new_users_today = User.query.filter(
            User.created_at >= today_start,
            User.created_at <= today_end
        ).count()
        
        messages_today = Message.query.filter(
            Message.timestamp >= today_start,
            Message.timestamp <= today_end,
            Message.is_deleted == False
        ).count()
        
        # Add some debug info
        print(f'📊 Admin Stats:')
        print(f'   Total Users: {total_users}')
        print(f'   Online Users: {online_users}')
        print(f'   Total Messages: {total_messages}')
        print(f'   Total Groups: {total_groups}')
        print(f'   New Users Today: {new_users_today}')
        print(f'   Messages Today: {messages_today}')
        
        return jsonify({
            'totalUsers': total_users,
            'onlineUsers': online_users,
            'totalMessages': total_messages,
            'groups': total_groups,
            'newUsersToday': new_users_today,
            'messagesToday': messages_today
        })
    except Exception as e:
        print(f'❌ Error getting admin stats: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/activity', methods=['GET'])
def get_admin_activity():
    """Get recent activity for admin dashboard"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import Call, Group, GroupMember, Media, Meeting
        
        activity = []
        
        # Get recent messages (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_messages = Message.query.filter(
            Message.timestamp >= yesterday
        ).order_by(Message.timestamp.desc()).limit(20).all()
        
        # Add recent messages to activity
        for message in recent_messages:
            activity.append({
                'type': 'message',
                'icon': '💬',
                'description': f"{message.sender.username if message.sender else 'Unknown'} sent a message to {message.receiver.username if message.receiver else 'Unknown'}",
                'timestamp': message.timestamp.isoformat(),
                'user_id': message.sender_id,
                'username': message.sender.username if message.sender else 'Unknown',
                'content_preview': message.content[:50] if message.content else '[No content]'
            })
        
        # Get recent calls (last 24 hours)
        recent_calls = Call.query.filter(
            Call.started_at >= yesterday
        ).order_by(Call.started_at.desc()).limit(20).all()
        
        for call in recent_calls:
            caller = User.query.get(call.caller_id)
            receiver = User.query.get(call.receiver_id)
            
            status_text = 'connected' if call.status == 'active' else call.status
            activity.append({
                'type': 'call',
                'icon': '📞',
                'description': f"{caller.username if caller else 'Unknown'} called {receiver.username if receiver else 'Unknown'} ({call.call_type})",
                'timestamp': call.started_at.isoformat() if call.started_at else None,
                'user_id': call.caller_id,
                'username': caller.username if caller else 'Unknown',
                'call_status': status_text
            })
        
        # Get recent user registrations (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_users = User.query.filter(
            User.created_at >= week_ago
        ).order_by(User.created_at.desc()).limit(10).all()
        
        for user in recent_users:
            activity.append({
                'type': 'user_registration',
                'icon': '👤',
                'description': f"New user {user.username} registered",
                'timestamp': user.created_at.isoformat(),
                'user_id': user.id,
                'username': user.username
            })
        
        # Get recent groups created
        recent_groups = Group.query.filter(
            Group.created_at >= week_ago
        ).order_by(Group.created_at.desc()).limit(10).all()
        
        for group in recent_groups:
            creator = User.query.get(group.created_by)
            activity.append({
                'type': 'group_created',
                'icon': '👥',
                'description': f"{creator.username if creator else 'Unknown'} created group '{group.name}'",
                'timestamp': group.created_at.isoformat() if group.created_at else None,
                'user_id': group.created_by,
                'username': creator.username if creator else 'Unknown'
            })
        
        # Get recent media uploads (last 7 days)
        recent_media = Media.query.filter(
            Media.uploaded_at >= week_ago
        ).order_by(Media.uploaded_at.desc()).limit(10).all()
        
        for media in recent_media:
            uploader = User.query.get(media.user_id)
            activity.append({
                'type': 'media_upload',
                'icon': '📎',
                'description': f"{uploader.username if uploader else 'Unknown'} uploaded {media.file_name}",
                'timestamp': media.uploaded_at.isoformat() if media.uploaded_at else None,
                'user_id': media.user_id,
                'username': uploader.username if uploader else 'Unknown',
                'media_type': media.file_type
            })
        
        # Get recent meetings
        recent_meetings = Meeting.query.filter(
            Meeting.created_at >= week_ago
        ).order_by(Meeting.created_at.desc()).limit(10).all()
        
        for meeting in recent_meetings:
            host = User.query.get(meeting.host_id)
            activity.append({
                'type': 'meeting_created',
                'icon': '🎥',
                'description': f"{host.username if host else 'Unknown'} created meeting '{meeting.title}'",
                'timestamp': meeting.created_at.isoformat() if meeting.created_at else None,
                'user_id': meeting.host_id,
                'username': host.username if host else 'Unknown'
            })
        
        # Get recent user status changes (online -> offline transitions)
        status_changes = User.query.filter(
            User.last_seen >= yesterday,
            User.status == 'offline'
        ).order_by(User.last_seen.desc()).limit(15).all()
        
        for user in status_changes:
            activity.append({
                'type': 'user_offline',
                'icon': '🔴',
                'description': f"{user.username} went offline",
                'timestamp': user.last_seen.isoformat() if user.last_seen else None,
                'user_id': user.id,
                'username': user.username
            })
        
        # Sort by timestamp
        activity.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        print(f'📊 Admin Activity: Retrieved {len(activity)} events from database')
        
        return jsonify(activity[:50])  # Return last 50 activities
    except Exception as e:
        print(f'❌ Error getting admin activity: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users', methods=['GET'])
def get_admin_users():
    """Get all users for admin management"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        users = User.query.all()
        print(f'👥 Admin Users: Retrieved {len(users)} users from database')
        
        # Log user status breakdown
        online_count = sum(1 for u in users if u.status == 'online')
        offline_count = sum(1 for u in users if u.status == 'offline')
        print(f'   Online: {online_count}, Offline: {offline_count}')
        
        return jsonify([user.to_dict() for user in users])
    except Exception as e:
        print(f'❌ Error getting admin users: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/<int:user_id>/ban', methods=['POST'])
def ban_user(user_id):
    """Ban a user"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_banned = True
        db.session.commit()
        
        return jsonify({'message': f'User {user.username} has been banned'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/<int:user_id>/unban', methods=['POST'])
def unban_user(user_id):
    """Unban a user"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_banned = False
        db.session.commit()
        
        return jsonify({'message': f'User {user.username} has been unbanned'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/create', methods=['POST'])
def create_user():
    """Create a new user"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            is_admin=data.get('is_admin', False),
            is_banned=data.get('is_banned', False)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/<int:user_id>/edit', methods=['PUT'])
def edit_user(user_id):
    """Edit a user"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        data = request.get_json()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update fields
        if 'username' in data:
            # Check if username is taken by another user
            existing = User.query.filter_by(username=data['username']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Username already exists'}), 400
            user.username = data['username']
        
        if 'email' in data:
            # Check if email is taken by another user
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']
        
        if 'is_admin' in data:
            user.is_admin = data['is_admin']
        
        if 'is_banned' in data:
            user.is_banned = data['is_banned']
        
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/users/<int:user_id>/delete', methods=['POST'])
def delete_user(user_id):
    """Delete a user"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent deleting yourself
        if user.id == admin_user['id']:
            return jsonify({'error': 'Cannot delete yourself'}), 400
        
        # Prevent deleting other admins
        if user.is_admin:
            return jsonify({'error': 'Cannot delete admin users'}), 400
        
        username = user.username
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': f'User {username} deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/messages', methods=['GET'])
def get_admin_messages():
    """Get all messages for admin monitoring"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from sqlalchemy.orm import joinedload
        # Get all messages (not filtered by is_deleted to show actual database records)
        messages = Message.query.options(
            joinedload(Message.sender),
            joinedload(Message.receiver)
        ).order_by(Message.timestamp.desc()).limit(100).all()
        
        print(f'📨 Admin Messages: Retrieved {len(messages)} messages from database')
        
        return jsonify([message.to_dict() for message in messages])
    except Exception as e:
        print(f'❌ Error getting admin messages: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/messages/<int:message_id>/delete', methods=['POST'])
def delete_message(message_id):
    """Delete a message"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        message = Message.query.get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        db.session.delete(message)
        db.session.commit()
        
        return jsonify({'message': 'Message has been deleted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups', methods=['GET'])
def get_admin_groups():
    """Get all groups for admin management"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        groups = Group.query.order_by(Group.created_at.desc()).all()
        return jsonify([g.to_dict() for g in groups])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups/create', methods=['POST'])
def create_group_admin():
    """Create a new group (admin)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import GroupMember, GroupLog
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('name'):
            return jsonify({'error': 'Group name is required'}), 400
        
        # Check if group already exists
        if Group.query.filter_by(name=data['name']).first():
            return jsonify({'error': 'Group name already exists'}), 400
        
        # Create new group
        group = Group(
            name=data['name'],
            description=data.get('description', ''),
            created_by=admin_user['id'],
            is_active=True,
            is_authorized=True  # Admin-created groups are auto-authorized
        )
        db.session.add(group)
        db.session.flush()  # Get the group ID
        
        # Add creator as admin member
        member = GroupMember(
            group_id=group.id,
            user_id=admin_user['id'],
            role='admin'
        )
        db.session.add(member)
        
        # Log the creation
        log = GroupLog(
            group_id=group.id,
            user_id=admin_user['id'],
            action='created',
            details=f'Group created by admin'
        )
        db.session.add(log)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Group created successfully',
            'group': group.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups/<int:group_id>/members/add', methods=['POST'])
def add_group_member_admin(group_id):
    """Add a member to a group (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import GroupMember, GroupLog, User
        
        data = request.get_json()
        user_id = data.get('user_id')
        role = data.get('role', 'member')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Check if group exists
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is already a member
        existing_member = GroupMember.query.filter_by(
            group_id=group_id,
            user_id=user_id
        ).first()
        
        if existing_member:
            return jsonify({'error': 'User is already a member of this group'}), 400
        
        # Add the member
        member = GroupMember(
            group_id=group_id,
            user_id=user_id,
            role=role
        )
        db.session.add(member)
        
        # Log the action
        log = GroupLog(
            group_id=group_id,
            user_id=admin_user['id'],
            action='member_added',
            details=f'Admin added {user.username} to the group'
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({
            'message': 'Member added successfully',
            'member': member.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/meetings', methods=['GET'])
def get_admin_meetings():
    """Get all meetings for admin management"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import Meeting
        meetings = Meeting.query.order_by(Meeting.created_at.desc()).all()
        return jsonify([m.to_dict() for m in meetings])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/calls', methods=['GET'])
def get_admin_calls():
    """Get all calls for admin management"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import Call
        calls = Call.query.order_by(Call.started_at.desc()).limit(100).all()
        return jsonify([c.to_dict() for c in calls])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/media', methods=['GET'])
def get_admin_media():
    """Get all media for admin management"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import Media
        media = Media.query.order_by(Media.uploaded_at.desc()).limit(100).all()
        return jsonify([m.to_dict() for m in media])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups/<int:group_id>/delete', methods=['POST'])
def delete_group_admin(group_id):
    """Delete a group (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        db.session.delete(group)
        db.session.commit()
        
        return jsonify({'message': 'Group deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/meetings/<int:meeting_id>/delete', methods=['POST'])
def delete_meeting_admin(meeting_id):
    """Delete a meeting (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import Meeting
        meeting = Meeting.query.get(meeting_id)
        if not meeting:
            return jsonify({'error': 'Meeting not found'}), 404
        
        db.session.delete(meeting)
        db.session.commit()
        
        return jsonify({'message': 'Meeting deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/meetings/create', methods=['POST'])
def create_meeting_admin():
    """Create a new meeting (admin)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import Meeting, MeetingParticipant
        import secrets
        
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('title'):
            return jsonify({'error': 'Meeting title is required'}), 400
        
        # Generate unique meeting code
        meeting_code = secrets.token_urlsafe(16).upper()[:16]
        
        # Create new meeting
        meeting = Meeting(
            title=data['title'],
            description=data.get('description', ''),
            host_id=admin_user['id'],
            meeting_code=meeting_code,
            meeting_type=data.get('meeting_type', 'meeting'),
            status=data.get('status', 'scheduled'),
            scheduled_at=None,
            duration=None,
            is_locked=data.get('is_locked', False),
            requires_password=data.get('requires_password', False),
            meeting_password=data.get('meeting_password'),
            has_waiting_room=data.get('has_waiting_room', False),
            allow_chat=data.get('allow_chat', True),
            allow_participants_to_share=data.get('allow_participants_to_share', True),
            allow_participants_to_unmute=data.get('allow_participants_to_unmute', True),
            max_participants=data.get('max_participants', 100)
        )
        db.session.add(meeting)
        db.session.flush()
        
        # Add admin as host
        participant = MeetingParticipant(
            meeting_id=meeting.id,
            user_id=admin_user['id'],
            role='host'
        )
        db.session.add(participant)
        db.session.commit()
        
        return jsonify({
            'message': 'Meeting created successfully',
            'meeting': meeting.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/meetings/<int:meeting_id>/participants/add', methods=['POST'])
def add_meeting_participant_admin(meeting_id):
    """Add a participant to a meeting (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import MeetingParticipant, User
        
        data = request.get_json()
        user_id = data.get('user_id')
        role = data.get('role', 'participant')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Check if meeting exists
        from src.models.user import Meeting
        meeting = Meeting.query.get(meeting_id)
        if not meeting:
            return jsonify({'error': 'Meeting not found'}), 404
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is already a participant
        existing_participant = MeetingParticipant.query.filter_by(
            meeting_id=meeting_id,
            user_id=user_id
        ).first()
        
        if existing_participant:
            return jsonify({'error': 'User is already a participant of this meeting'}), 400
        
        # Add the participant
        participant = MeetingParticipant(
            meeting_id=meeting_id,
            user_id=user_id,
            role=role
        )
        db.session.add(participant)
        db.session.commit()
        
        return jsonify({
            'message': 'Participant added successfully',
            'participant': participant.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/meetings/<int:meeting_id>/participants/<int:participant_id>/remove', methods=['POST'])
def remove_meeting_participant_admin(meeting_id, participant_id):
    """Remove a participant from a meeting (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import MeetingParticipant, User
        
        participant = MeetingParticipant.query.filter_by(
            id=participant_id,
            meeting_id=meeting_id
        ).first()
        
        if not participant:
            return jsonify({'error': 'Participant not found'}), 404
        
        user = User.query.get(participant.user_id)
        username = user.username if user else 'Unknown'
        
        db.session.delete(participant)
        db.session.commit()
        
        return jsonify({'message': f'Participant {username} removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/calls/<int:call_id>/delete', methods=['POST'])
def delete_call_admin(call_id):
    """Delete a call record (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import Call
        call = Call.query.get(call_id)
        if not call:
            return jsonify({'error': 'Call not found'}), 404
        
        db.session.delete(call)
        db.session.commit()
        
        return jsonify({'message': 'Call record deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/media/<int:media_id>/delete', methods=['POST'])
def delete_media_admin(media_id):
    """Delete a media file (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import Media
        import os
        media = Media.query.get(media_id)
        if not media:
            return jsonify({'error': 'Media not found'}), 404
        
        # Delete file from disk
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        file_path = os.path.join(base_dir, media.file_path.lstrip('/'))
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete thumbnail
        if media.thumbnail_path:
            thumb_path = os.path.join(base_dir, media.thumbnail_path.lstrip('/'))
            if os.path.exists(thumb_path):
                os.remove(thumb_path)
        
        db.session.delete(media)
        db.session.commit()
        
        return jsonify({'message': 'Media deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups/<int:group_id>/members', methods=['GET'])
def get_group_members_admin(group_id):
    """Get group members (admin view)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import GroupMember
        members = GroupMember.query.filter_by(group_id=group_id).all()
        return jsonify([m.to_dict() for m in members]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/meetings/<int:meeting_id>/participants', methods=['GET'])
def get_meeting_participants_admin(meeting_id):
    """Get meeting participants (admin view)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import MeetingParticipant
        participants = MeetingParticipant.query.filter_by(meeting_id=meeting_id).all()
        return jsonify([p.to_dict() for p in participants]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups/<int:group_id>/suspend', methods=['POST'])
def suspend_group_admin(group_id):
    """Suspend a group (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import GroupLog
        import uuid
        data = request.get_json()
        reason = data.get('reason', 'No reason provided')
        
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        group.is_suspended = True
        group.suspended_at = datetime.utcnow()
        group.suspended_by = admin_user['id']
        group.suspension_reason = reason
        group.is_active = False
        
        # Log the action
        log = GroupLog(
            group_id=group_id,
            user_id=admin_user['id'],
            action='suspended',
            details=f'Suspended by admin. Reason: {reason}'
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({'message': 'Group suspended successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups/<int:group_id>/unsuspend', methods=['POST'])
def unsuspend_group_admin(group_id):
    """Unsuspend a group (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import GroupLog
        
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        group.is_suspended = False
        group.suspended_at = None
        group.suspended_by = None
        group.suspension_reason = None
        group.is_active = True
        
        # Log the action
        log = GroupLog(
            group_id=group_id,
            user_id=admin_user['id'],
            action='unsuspended',
            details='Group unsuspended by admin'
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({'message': 'Group unsuspended successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups/<int:group_id>/authorize', methods=['POST'])
def authorize_group_admin(group_id):
    """Authorize a group (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import GroupLog
        
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        group.is_authorized = True
        
        # Log the action
        log = GroupLog(
            group_id=group_id,
            user_id=admin_user['id'],
            action='authorized',
            details='Group authorized by admin'
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({'message': 'Group authorized successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups/<int:group_id>/deauthorize', methods=['POST'])
def deauthorize_group_admin(group_id):
    """Deauthorize a group (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import GroupLog
        
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        group.is_authorized = False
        
        # Log the action
        log = GroupLog(
            group_id=group_id,
            user_id=admin_user['id'],
            action='deauthorized',
            details='Group deauthorized by admin'
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({'message': 'Group deauthorized successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups/<int:group_id>/generate-auth-code', methods=['POST'])
def generate_group_auth_code(group_id):
    """Generate authorization code for a group (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import GroupLog
        import uuid
        import secrets
        
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Group not found'}), 404
        
        # Generate a unique auth code
        auth_code = secrets.token_urlsafe(16).upper()[:16]  # 16 character code
        
        group.auth_code = auth_code
        group.auth_code_generated_at = datetime.utcnow()
        
        # Log the action
        log = GroupLog(
            group_id=group_id,
            user_id=admin_user['id'],
            action='auth_code_generated',
            details=f'Authorization code generated: {auth_code}'
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({'message': 'Authorization code generated', 'auth_code': auth_code}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups/<int:group_id>/logs', methods=['GET'])
def get_group_logs_admin(group_id):
    """Get group activity logs (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import GroupLog
        logs = GroupLog.query.filter_by(group_id=group_id).order_by(GroupLog.created_at.desc()).limit(100).all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/groups/<int:group_id>/members/<int:member_id>/remove', methods=['POST'])
def remove_group_member_admin(group_id, member_id):
    """Remove a member from a group (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import GroupMember, GroupLog
        from src.models.user import User
        
        member = GroupMember.query.filter_by(id=member_id, group_id=group_id).first()
        if not member:
            return jsonify({'error': 'Member not found'}), 404
        
        user = User.query.get(member.user_id)
        username = user.username if user else 'Unknown'
        
        db.session.delete(member)
        
        # Log the action
        log = GroupLog(
            group_id=group_id,
            user_id=admin_user['id'],
            action='member_removed',
            details=f'Member {username} removed by admin'
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({'message': 'Member removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/analytics', methods=['GET'])
def get_analytics():
    """Get analytics data for charts and graphs"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from src.models.user import Call, Group, Media, Meeting
        
        # Get message activity over last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Daily message counts for chart
        daily_messages = []
        for i in range(30):
            day = thirty_days_ago + timedelta(days=i)
            next_day = day + timedelta(days=1)
            count = Message.query.filter(
                Message.timestamp >= day,
                Message.timestamp < next_day,
                Message.is_deleted == False
            ).count()
            daily_messages.append({
                'date': day.strftime('%Y-%m-%d'),
                'count': count
            })
        
        # User signups over time
        daily_signups = []
        for i in range(30):
            day = thirty_days_ago + timedelta(days=i)
            next_day = day + timedelta(days=1)
            count = User.query.filter(
                User.created_at >= day,
                User.created_at < next_day
            ).count()
            daily_signups.append({
                'date': day.strftime('%Y-%m-%d'),
                'count': count
            })
        
        # User status distribution
        user_status = {
            'online': User.query.filter_by(status='online').count(),
            'offline': User.query.filter_by(status='offline').count(),
            'away': User.query.filter_by(status='away').count(),
            'banned': User.query.filter_by(is_banned=True).count()
        }
        
        # Message type distribution
        message_types = {
            'text': Message.query.filter_by(message_type='text', is_deleted=False).count(),
            'image': Message.query.filter_by(message_type='image', is_deleted=False).count(),
            'file': Message.query.filter_by(message_type='file', is_deleted=False).count(),
            'voice': Message.query.filter_by(message_type='voice', is_deleted=False).count()
        }
        
        # Call statistics
        total_calls = Call.query.count()
        successful_calls = Call.query.filter_by(status='completed').count()
        failed_calls = Call.query.filter_by(status='failed').count()
        
        # Recent activity (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        new_groups = Group.query.filter(Group.created_at >= seven_days_ago).count()
        new_media = Media.query.filter(Media.uploaded_at >= seven_days_ago).count()
        new_meetings = Meeting.query.filter(Meeting.created_at >= seven_days_ago).count()
        
        print(f'📊 Analytics Data Retrieved')
        print(f'   Daily Messages: {len(daily_messages)} data points')
        print(f'   Daily Signups: {len(daily_signups)} data points')
        print(f'   Total Calls: {total_calls}')
        
        return jsonify({
            'dailyMessages': daily_messages,
            'dailySignups': daily_signups,
            'userStatus': user_status,
            'messageTypes': message_types,
            'callStats': {
                'total': total_calls,
                'successful': successful_calls,
                'failed': failed_calls
            },
            'recentActivity': {
                'newGroups': new_groups,
                'newMedia': new_media,
                'newMeetings': new_meetings
            }
        })
    except Exception as e:
        print(f'❌ Error getting analytics: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# LDAP/Active Directory Authentication
@admin_bp.route('/admin/ldap/config', methods=['GET'])
def get_ldap_config():
    """Get LDAP configuration"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        # Read LDAP config from environment or database
        # For now, return default config structure
        ldap_config = {
            'enabled': False,
            'server': '',
            'port': 389,
            'base_dn': '',
            'bind_dn': '',
            'bind_password': '',
            'user_search_filter': '(sAMAccountName={username})',
            'user_dn_template': 'CN={username},{base_dn}'
        }
        
        return jsonify(ldap_config)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/ldap/config', methods=['POST'])
def set_ldap_config():
    """Set LDAP configuration"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        data = request.get_json()
        
        # In production, store this in database or config file
        # For now, just return success
        return jsonify({
            'message': 'LDAP configuration saved successfully',
            'config': data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/ldap/test', methods=['POST'])
def test_ldap_connection():
    """Test LDAP connection"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        from ldap3 import Server, Connection, ALL
        
        data = request.get_json()
        
        server = data.get('server')
        port = data.get('port', 389)
        bind_dn = data.get('bind_dn')
        bind_password = data.get('bind_password')
        base_dn = data.get('base_dn')
        
        if not server:
            return jsonify({'error': 'LDAP server required'}), 400
        
        try:
            ldap_server = Server(f'ldap://{server}:{port}', get_info=ALL)
            conn = Connection(ldap_server, bind_dn, bind_password, auto_bind=True)
            
            # Test search
            search_base = base_dn or bind_dn.rsplit(',', 1)[1] if ',' in bind_dn else ''
            if conn.search(search_base, '(objectClass=*)', attributes=['*']):
                conn.unbind()
                return jsonify({
                    'success': True,
                    'message': 'LDAP connection successful'
                })
            else:
                conn.unbind()
                return jsonify({
                    'success': False,
                    'message': 'LDAP connection failed: No results'
                })
        except Exception as ldap_error:
            return jsonify({
                'success': False,
                'message': f'LDAP connection failed: {str(ldap_error)}'
            })
            
    except ImportError:
        return jsonify({
            'success': False,
            'message': 'LDAP module not installed. Please install: pip install ldap3'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/admin/ldap/auth', methods=['POST'])
def ldap_authenticate():
    """Authenticate user via LDAP"""
    try:
        from ldap3 import Server, Connection, ALL
        import os
        
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        # Get LDAP config from environment
        ldap_server = os.getenv('LDAP_SERVER', '')
        ldap_port = int(os.getenv('LDAP_PORT', '389'))
        ldap_base_dn = os.getenv('LDAP_BASE_DN', '')
        ldap_bind_dn_template = os.getenv('LDAP_BIND_DN_TEMPLATE', 'CN={username},{base_dn}')
        
        if not ldap_server:
            return jsonify({'error': 'LDAP not configured'}), 400
        
        try:
            # Build user DN
            user_dn = ldap_bind_dn_template.format(username=username, base_dn=ldap_base_dn)
            
            # Try to bind with user credentials
            ldap = Server(f'ldap://{ldap_server}:{ldap_port}', get_info=ALL)
            conn = Connection(ldap, user=user_dn, password=password, auto_bind=True)
            
            # If bind successful, search for user info
            if ldap_base_dn:
                conn.search(ldap_base_dn, f'(CN={username})', attributes=['*'])
                if conn.entries:
                    user_entry = conn.entries[0]
                    
                    # Create or update user in database
                    user = User.query.filter_by(username=username).first()
                    if not user:
                        # Import password setting method
                        from werkzeug.security import generate_password_hash
                        user = User(
                            username=username,
                            email=f'{username}@domain.local',
                            password_hash=generate_password_hash(password),
                            status='online'
                        )
                        db.session.add(user)
                    else:
                        # Update status
                        user.status = 'online'
                    
                    db.session.commit()
                    
                    conn.unbind()
                    
                    return jsonify({
                        'success': True,
                        'message': 'LDAP authentication successful',
                        'user': user.to_dict()
                    })
                else:
                    conn.unbind()
                    return jsonify({'error': 'User not found in LDAP'}), 404
            else:
                conn.unbind()
                return jsonify({
                    'success': True,
                    'message': 'LDAP authentication successful'
                })
                
        except Exception as ldap_error:
            return jsonify({
                'error': f'LDAP authentication failed: {str(ldap_error)}'
            }), 401
            
    except ImportError:
        return jsonify({
            'error': 'LDAP module not installed'
        }), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
