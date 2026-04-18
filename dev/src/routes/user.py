from flask import Blueprint, request, jsonify, session, current_app
from src.models.user import db, User, Message, Group, GroupMember
from datetime import datetime
import os
import time
from werkzeug.utils import secure_filename
from src.utils.tenant_access import resolve_user_tenant, get_tenant_policy_items

user_bp = Blueprint('user', __name__)

def require_auth():
    """Check if user is authenticated"""
    if 'user_id' not in session:
        return None
    return User.query.get(session['user_id'])

@user_bp.route('/register', methods=['POST'])
def register():
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
        email=data['email']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Set session
    session['user_id'] = user.id
    
    return jsonify({
        'message': 'User created successfully',
        'user': user.to_dict()
    }), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    # Portal chat uses display name vs DB username — allow lookup by email when provided
    if user is None and data.get('email'):
        user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']) and not user.is_banned:
        # Update last seen
        user.last_seen = datetime.utcnow()
        db.session.commit()
        
        # Set session
        session.clear()
        session['user_id'] = user.id
        session.modified = True
        
        print(f'✅ Login successful for user: {user.username} (ID: {user.id})')
        print(f'   Session ID: {session.get("_id", "No session ID")}')
        print(f'   User ID in session: {session.get("user_id")}')
        
        response = jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        })
        
        return response
    else:
        return jsonify({'error': 'Invalid credentials or account banned'}), 401


@user_bp.route('/portal-sync', methods=['POST'])
def portal_sync():
    """Set password to portal-derived secret and create session when user exists but password differs (seed vs SPA).

    Only accepts passwords produced by the SPA (`naptin-` prefix). Enable with OWL_PORTAL_SYNC=1.
    """
    if os.environ.get('OWL_PORTAL_SYNC', '').lower() not in ('1', 'true', 'yes'):
        return jsonify({'error': 'Portal sync disabled'}), 403
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'email and password required'}), 400
    pwd = str(data['password'])
    if not pwd.startswith('naptin-'):
        return jsonify({'error': 'Invalid sync password format'}), 400
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'error': 'No user for email'}), 404
    user.set_password(pwd)
    db.session.commit()
    session.clear()
    session['user_id'] = user.id
    session.modified = True
    return jsonify({'message': 'Synced', 'user': user.to_dict()})


@user_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'})

@user_bp.route('/me', methods=['GET'])
def get_me():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    return jsonify({'user': user.to_dict()})


@user_bp.route('/tenant-policy', methods=['GET'])
def get_current_user_tenant_policy():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    tenant = resolve_user_tenant(user.id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    return jsonify({
        'tenant': tenant.to_dict(),
        'items': get_tenant_policy_items(tenant.id),
    })

@user_bp.route('/users', methods=['GET'])
def get_users():
    """List users for chat sidebar.

    Authenticated Owl Talk session: exclude self.
    Unauthenticated (e.g. NAPTIN portal only logs in via React): in **debug** mode return full roster
    so the portal can load contacts without a separate Flask login. Production (debug=False) still 401.
    """
    user = require_auth()
    if user:
        users = User.query.filter(User.id != user.id).all()
        return jsonify([u.to_dict() for u in users])
    if current_app.debug:
        users = User.query.all()
        return jsonify([u.to_dict() for u in users])
    return jsonify({'error': 'Not authenticated'}), 401

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(target_user.to_dict())

@user_bp.route('/messages/<int:user_id>', methods=['GET'])
def get_messages(user_id):
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Get messages between current user and selected user
    # Exclude soft-deleted messages for better user experience
    # Include ALL messages with file attachments, voice notes, videos, etc.
    messages = Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id)),
        Message.is_deleted == False  # Exclude soft-deleted messages
    ).order_by(Message.timestamp).all()
    
    # Return ALL messages including file paths for media (voice notes, videos, images, files)
    message_data = []
    for message in messages:
        msg_dict = message.to_dict()
        # Ensure file paths are included for attachments
        if message.file_path:
            msg_dict['file_url'] = f'/api/uploads/{message.file_path}'
        if message.reply_to_id:
            parent = Message.query.get(message.reply_to_id)
            if parent and not parent.is_deleted:
                msg_dict['reply_preview'] = parent.to_reply_preview()
        message_data.append(msg_dict)
    
    return jsonify(message_data)

@user_bp.route('/profile', methods=['GET'])
def get_profile():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    return jsonify(user.to_dict())

@user_bp.route('/profile', methods=['PUT'])
def update_profile():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    
    if 'bio' in data:
        user.bio = data['bio']
    
    if 'username' in data and data['username']:
        # Check if username is already taken by another user
        existing_user = User.query.filter(
            User.username == data['username'],
            User.id != user.id
        ).first()
        if existing_user:
            return jsonify({'error': 'Username already taken'}), 400
        user.username = data['username']
    
    if 'email' in data and data['email']:
        # Check if email is already taken by another user
        existing_user = User.query.filter(
            User.email == data['email'],
            User.id != user.id
        ).first()
        if existing_user:
            return jsonify({'error': 'Email already taken'}), 400
        user.email = data['email']
    
    if 'profile_picture' in data:
        user.profile_picture = data['profile_picture']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    })

@user_bp.route('/profile/upload', methods=['POST'])
def upload_profile_picture():
    """Upload profile picture"""
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if file is an image
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
        return jsonify({'error': 'File must be an image'}), 400
    
    try:
        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(os.getcwd(), 'uploads', 'profiles')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        filename = f"{user.id}_{int(time.time())}.{file.filename.rsplit('.', 1)[1].lower()}"
        filepath = os.path.join(upload_dir, filename)
        
        # Save file
        file.save(filepath)
        
        # Update user's profile picture
        user.profile_picture = f'/uploads/profiles/{filename}'
        db.session.commit()
        
        return jsonify({
            'message': 'Profile picture updated successfully',
            'profile_picture': user.profile_picture,
            'user': user.to_dict()
        })
    except Exception as e:
        print(f"Error uploading profile picture: {e}")
        return jsonify({'error': 'Failed to upload profile picture'}), 500

@user_bp.route('/change-password', methods=['POST'])
def change_password():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current and new password required'}), 400
    
    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 400
    
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'})

@user_bp.route('/block/<int:user_id>', methods=['POST'])
def block_user(user_id):
    """Block a user"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        user_to_block = User.query.get(user_id)
        if not user_to_block:
            return jsonify({'error': 'User not found'}), 404
        
        # Add to blocked users (we'll need to add a BlockedUser model)
        # For now, just return success
        return jsonify({'message': f'User {user_to_block.username} blocked'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/unblock/<int:user_id>', methods=['POST'])
def unblock_user(user_id):
    """Unblock a user"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        user_to_unblock = User.query.get(user_id)
        if not user_to_unblock:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'message': f'User {user_to_unblock.username} unblocked'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/messages/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    """Delete a message"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        message = Message.query.get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Only allow deleting own messages
        if message.sender_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        message.is_deleted = True
        db.session.commit()
        
        return jsonify({'message': 'Message deleted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/messages/<int:message_id>', methods=['PUT'])
def edit_message(message_id):
    """Edit a message"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        message = Message.query.get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Only allow editing own messages
        if message.sender_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        if 'content' in data:
            message.content = data['content']
            db.session.commit()
        
        return jsonify({'message': 'Message updated', 'message': message.to_dict()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/messages/<int:message_id>/read', methods=['POST'])
def mark_as_read(message_id):
    """Mark a message as read"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        message = Message.query.get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Only mark as read if user is the receiver
        if message.receiver_id == current_user.id:
            message.is_read = True
            db.session.commit()
            return jsonify({'message': 'Message marked as read'})
        else:
            return jsonify({'error': 'Not the receiver'}), 403
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/calls', methods=['GET'])
def get_call_history():
    """Get call history for current user"""
    current_user = require_auth()
    if not current_user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        from src.models.user import Call
        calls = Call.query.filter(
            (Call.caller_id == current_user.id) | (Call.receiver_id == current_user.id)
        ).order_by(Call.started_at.desc()).limit(50).all()
        
        return jsonify([call.to_dict() for call in calls])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/upload', methods=['POST'])
def upload_file():
    """Upload a file/image"""
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'static', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)

        # Save file
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)

        # Generate URL for the file
        file_url = f"/static/uploads/{filename}"

        return jsonify({
            'message': 'File uploaded successfully',
            'file_path': file_url,
            'file_name': filename,
            'file_size': os.path.getsize(file_path)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
