from flask import Blueprint, request, jsonify, session
from src.models.user import User, db
from src.utils.tenant_access import is_segment_enabled_for_user

settings_bp = Blueprint('settings', __name__)

def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)


def require_security_enabled(user):
    if not is_segment_enabled_for_user(user.id, 'security'):
        return jsonify({'error': 'Module disabled for tenant', 'segment': 'security'}), 403
    return None

@settings_bp.route('/settings', methods=['GET'])
def get_settings():
    """Get user privacy settings"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_security_enabled(current_user)
    if blocked:
        return blocked
    
    return jsonify({
        'show_online_status': current_user.show_online_status,
        'show_last_seen': current_user.show_last_seen,
        'allow_group_invites': current_user.allow_group_invites,
        'allow_direct_messages': current_user.allow_direct_messages,
        'notifications_enabled': current_user.notifications_enabled,
        'sound_notifications': current_user.sound_notifications
    })

@settings_bp.route('/settings', methods=['PUT'])
def update_settings():
    """Update user privacy settings"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_security_enabled(current_user)
    if blocked:
        return blocked
    
    data = request.get_json()
    
    # Update settings
    if 'show_online_status' in data:
        current_user.show_online_status = data['show_online_status']
    if 'show_last_seen' in data:
        current_user.show_last_seen = data['show_last_seen']
    if 'allow_group_invites' in data:
        current_user.allow_group_invites = data['allow_group_invites']
    if 'allow_direct_messages' in data:
        current_user.allow_direct_messages = data['allow_direct_messages']
    if 'notifications_enabled' in data:
        current_user.notifications_enabled = data['notifications_enabled']
    if 'sound_notifications' in data:
        current_user.sound_notifications = data['sound_notifications']
    
    try:
        db.session.commit()
        return jsonify({'message': 'Settings updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

