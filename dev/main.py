import os
import re
import sys

# Windows consoles often use cp1252; emoji in prints can raise UnicodeEncodeError before the server binds.
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, _REPO_ROOT)

try:
    from dotenv import load_dotenv

    load_dotenv(os.path.join(_REPO_ROOT, '.env'))
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))
except ImportError:
    pass

from flask import Flask, send_from_directory, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from flask_session import Session
from src.models.user import db, User, Message, Call, Group, GroupMember, GroupLog, Meeting, MeetingParticipant, MeetingSlide, PresentationRecording, MeetingMessage, Media, OfficeIntegration, Tenant, TenantMember, TenantModulePolicy, TenantAuditEvent, EmployeeRecord, JobPosting, Candidate, CandidateInterview, OnboardingTask, AttendanceRecord, LeaveRequest, PayrollRun
from src.routes.user import user_bp
from src.routes.admin import admin_bp
from src.routes.settings import settings_bp
from src.routes.groups import groups_bp
from src.routes.meetings import meetings_bp
from src.routes.media import media_bp
from src.routes.office import office_bp
from src.routes.hrms import hrms_bp
from datetime import datetime

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'owl-talk-secret-key-2024'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours
app.config['SESSION_COOKIE_SAMESITE'] = None
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = False
app.config['SESSION_COOKIE_NAME'] = 'owltalk_session'
app.config['SESSION_COOKIE_PATH'] = '/'

# CORS: browsers reject Access-Control-Allow-Origin: * when credentials are used.
# Allow portal UI on :4001 (vite preview / prod), Vite dev ports, localhost, plus OWL_TALK_CORS_ORIGINS.
_CORS_REGEXES = tuple(
    re.compile(p)
    for p in (
        r'^https?://localhost(?::\d+)?$',
        r'^https?://127\.0\.0\.1(?::\d+)?$',
        r'^https?://\[::1\](?::\d+)?$',
        r'^https?://[a-zA-Z0-9.-]+:4001$',   # NAPTIN SPA (vite preview) on LAN / public IP
        r'^https?://[a-zA-Z0-9.-]+:5173$',
        r'^https?://[a-zA-Z0-9.-]+:5174$',
        r'^https?://[a-zA-Z0-9.-]+:6677$',
    )
)


def _parse_extra_cors_origins():
    raw = os.environ.get('OWL_TALK_CORS_ORIGINS', '').strip()
    if not raw:
        return []
    return [o.strip() for o in raw.split(',') if o.strip()]


_EXTRA_CORS_ORIGINS = set(_parse_extra_cors_origins())

# Static + legacy LAN entries (still need exact match for those hosts)
_CORS_STRING_ORIGINS = [
    'http://localhost:4001', 'http://127.0.0.1:4001',
    'https://localhost:4001', 'https://127.0.0.1:4001',
    'https://localhost:6677', 'https://127.0.0.1:6677',
    'http://localhost:6677', 'http://127.0.0.1:6677',
    'http://localhost:5173', 'http://127.0.0.1:5173',
    'http://localhost:5174', 'http://127.0.0.1:5174',
    'https://localhost:5173', 'https://127.0.0.1:5173',
    'https://localhost:5174', 'https://127.0.0.1:5174',
    'https://192.168.37.11:6677', 'http://192.168.37.11:6677',
] + list(_EXTRA_CORS_ORIGINS)

CORS(
    app,
    supports_credentials=True,
    origins=_CORS_STRING_ORIGINS + list(_CORS_REGEXES),
    allow_headers=['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    expose_headers=['Content-Type', 'Set-Cookie'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
)

# Initialize Flask-Session
Session(app)


# Same rules as Flask-CORS (no "*" — credentialed clients require explicit / pattern origins).
_SOCKETIO_CORS_ORIGINS = _CORS_STRING_ORIGINS + list(_CORS_REGEXES)

# Initialize SocketIO with threading mode for better Windows compatibility
socketio = SocketIO(
    app,
    cors_allowed_origins=_SOCKETIO_CORS_ORIGINS,
    supports_credentials=True,
    async_mode='threading',
)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api')
app.register_blueprint(settings_bp, url_prefix='/api')
app.register_blueprint(groups_bp, url_prefix='/api')
app.register_blueprint(meetings_bp, url_prefix='/api')
app.register_blueprint(media_bp, url_prefix='/api')
app.register_blueprint(office_bp, url_prefix='/api')
app.register_blueprint(hrms_bp, url_prefix='/api')

# Serve uploaded files (profile pictures, etc.)
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    """Serve uploaded files"""
    uploads_dir = os.path.join(os.getcwd(), 'uploads')
    return send_from_directory(uploads_dir, filename)

# Database configuration — same PostgreSQL as NAPTIN (naptin_db) unless overridden.
# Priority: OWL_TALK_DATABASE_URL, then DATABASE_URL from repo-root .env (loaded above), then default.
app.config['SQLALCHEMY_DATABASE_URI'] = (
    os.environ.get('OWL_TALK_DATABASE_URL', '').strip()
    or os.environ.get('DATABASE_URL', '').strip()
    or 'postgresql://postgres:Samolan123@127.0.0.1:5432/naptin_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_POOL_SIZE'] = 10
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
}
app.config['SQLALCHEMY_MAX_OVERFLOW'] = 20
db.init_app(app)

# Create database tables in the configured database (typically naptin_db)
with app.app_context():
    db.create_all()
    try:
        from urllib.parse import urlparse

        _u = urlparse(
            app.config['SQLALCHEMY_DATABASE_URI'].replace('postgresql+psycopg2://', 'postgresql://', 1)
        )
        _db = (_u.path or '/').lstrip('/') or '(unknown)'
        print(f"[owl-talk] Connected DB: {_u.scheme}://{_u.hostname}:{_u.port or 5432}/{_db}")
    except Exception:
        print('[owl-talk] Database tables ensured (create_all).')
    print("✅ Database tables created successfully")

# Store active connections
active_users = {}

@socketio.on('connect')
def handle_connect():
    print(f'Client connected from: {request.remote_addr}')
    print(f'Socket ID: {request.sid}')
    print(f'Session data: {dict(session)}')
    print(f'User ID in session: {session.get("user_id", "None")}')
    
    # Try to get user_id from session
    if 'user_id' in session:
        user_id = session['user_id']
        active_users[user_id] = request.sid
        
        print(f'✅ User {user_id} connected with Socket.IO (SID: {request.sid})')
        
        # Update user status to online
        user = User.query.get(user_id)
        if user:
            user.status = 'online'
            user.last_seen = datetime.utcnow()
            db.session.commit()
            
            # Notify all users about status change
            emit('user_status_update', {
                'user_id': user_id,
                'username': user.username,
                'status': 'online'
            }, broadcast=True)
    else:
        print('⚠️ No user_id in session - allowing connection but user not authenticated')
        # Don't reject, just don't update status

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    
    # Find user by session ID
    user_id = None
    for uid, sid in active_users.items():
        if sid == request.sid:
            user_id = uid
            del active_users[user_id]
            break
    
    if user_id:
        print(f'User {user_id} disconnected')
        # Update user status to offline
        user = User.query.get(user_id)
        if user:
            user.status = 'offline'
            user.last_seen = datetime.utcnow()
            db.session.commit()
            
            # Notify all users about status change
            emit('user_status_update', {
                'user_id': user_id,
                'username': user.username,
                'status': 'offline'
            }, broadcast=True)

def _socket_int(val):
    if val is None:
        return None
    try:
        return int(val)
    except (TypeError, ValueError):
        return None


@socketio.on('send_message')
def handle_send_message(data):
    print(f'📨 Received send_message from {request.sid}')
    
    # Try to get user_id from session or active users tracking
    sender_id = _socket_int(session.get('user_id'))
    
    if not sender_id:
        # Try to find user by socket ID
        for uid, sid in active_users.items():
            if sid == request.sid:
                sender_id = uid
                break
    
    if not sender_id:
        print('⚠️ No sender_id found')
        emit('error', {'message': 'Not authenticated'})
        return
    
    receiver_id = _socket_int(data.get('receiver_id'))
    content = data.get('content')
    message_type = data.get('message_type', 'text')
    reply_to_id = _socket_int(data.get('reply_to_id'))
    
    if receiver_id is None:
        emit('error', {'message': 'Invalid receiver_id'})
        return
    
    # Save message to database
    message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content,
        message_type=message_type,
        reply_to_id=reply_to_id
    )
    db.session.add(message)
    db.session.commit()
    
    # Get sender info
    sender = User.query.get(sender_id)
    
    message_data = {
        'id': message.id,
        'sender_id': sender_id,
        'receiver_id': receiver_id,
        'content': content,
        'message_type': message_type,
        'timestamp': message.timestamp.isoformat(),
        'sender_username': sender.username if sender else None,
        'reply_to_id': message.reply_to_id,
    }
    if message.reply_to_id:
        parent = Message.query.get(message.reply_to_id)
        if parent:
            message_data['reply_preview'] = parent.to_reply_preview()
    
    # Send to receiver if online
    if receiver_id in active_users:
        socketio.emit('receive_message', message_data, room=active_users[receiver_id])
        # Emit delivery confirmation to sender when message is received
        if sender_id in active_users:
            emit('message_delivered', {'message_id': message.id}, room=active_users[sender_id])
    
    # Send confirmation back to sender (always)
    if sender_id in active_users:
        emit('message_sent', message_data, room=active_users[sender_id])

@socketio.on('join_chat')
def handle_join_chat(data):
    print(f'📥 Received join_chat from {request.sid}')
    
    user_id = session.get('user_id')
    if not user_id:
        for uid, sid in active_users.items():
            if sid == request.sid:
                user_id = uid
                break
    
    if not user_id:
        emit('error', {'message': 'Not authenticated'})
        return
    
    other_user_id = data.get('other_user_id')
    room = f"chat_{min(user_id, other_user_id)}_{max(user_id, other_user_id)}"
    join_room(room)
    emit('joined_chat', {'room': room, 'other_user_id': other_user_id})

@socketio.on('typing_start')
def handle_typing_start(data):
    user_id = session.get('user_id')
    if not user_id:
        for uid, sid in active_users.items():
            if sid == request.sid:
                user_id = uid
                break
    
    if not user_id:
        return
    
    target_id = data.get('target_id')
    room = f"chat_{min(user_id, target_id)}_{max(user_id, target_id)}"
    
    user = User.query.get(user_id)
    if user:
        emit('user_typing', {
            'user_id': user_id,
            'username': user.username,
            'is_typing': True
        }, room=room, include_self=False)

@socketio.on('typing_stop')
def handle_typing_stop(data):
    user_id = session.get('user_id')
    if not user_id:
        for uid, sid in active_users.items():
            if sid == request.sid:
                user_id = uid
                break
    
    if not user_id:
        return
    
    target_id = data.get('target_id')
    room = f"chat_{min(user_id, target_id)}_{max(user_id, target_id)}"
    
    user = User.query.get(user_id)
    if user:
        emit('user_typing', {
            'user_id': user_id,
            'username': user.username,
            'is_typing': False
        }, room=room, include_self=False)

@socketio.on('message_read_receipt')
def handle_message_read_receipt(data):
    """Handle message read receipt"""
    user_id = session.get('user_id')
    if not user_id:
        for uid, sid in active_users.items():
            if sid == request.sid:
                user_id = uid
                break
    
    if not user_id:
        return
    
    message_id = data.get('message_id')
    try:
        message = Message.query.get(message_id)
        if message and message.receiver_id == user_id:
            # Mark as read in database
            message.is_read = True
            db.session.commit()
            
            # Notify sender
            if message.sender_id in active_users:
                emit('message_read', {
                    'message_id': message_id,
                    'reader_id': user_id
                }, room=active_users[message.sender_id])
    except Exception as e:
        print(f'Error handling read receipt: {e}')

@socketio.on('call_initiate')
def handle_call_initiate(data):
    """Initialize a call"""
    caller_id = _socket_int(session.get('user_id'))
    if not caller_id:
        for uid, sid in active_users.items():
            if sid == request.sid:
                caller_id = uid
                break
    
    if not caller_id:
        return
    
    receiver_id = _socket_int(data.get('receiver_id'))
    if receiver_id is None:
        return
    call_type = data.get('call_type', 'audio')
    
    # Create call record
    call = Call(
        caller_id=caller_id,
        receiver_id=receiver_id,
        call_type=call_type,
        status='initiated'
    )
    db.session.add(call)
    db.session.commit()
    
    # Send to receiver if online
    if receiver_id in active_users:
        emit('incoming_call', {
            'call_id': call.id,
            'caller_id': caller_id,
            'caller_username': User.query.get(caller_id).username,
            'call_type': call_type
        }, room=active_users[receiver_id])
    
    # Confirm to caller
    emit('call_initiated', {
        'call_id': call.id,
        'receiver_id': receiver_id,
        'call_type': call_type
    })

@socketio.on('call_accept')
def handle_call_accept(data):
    """Accept a call"""
    user_id = _socket_int(session.get('user_id'))
    if not user_id:
        for uid, sid in active_users.items():
            if sid == request.sid:
                user_id = uid
                break
    call_id = _socket_int(data.get('call_id'))
    
    try:
        call = Call.query.get(call_id)
        if call and call.receiver_id == user_id:
            call.status = 'active'
            call.started_at = datetime.utcnow()
            db.session.commit()
            
            # Notify caller
            if call.caller_id in active_users:
                emit('call_accepted', {
                    'call_id': call.id,
                    'receiver_id': user_id
                }, room=active_users[call.caller_id])
    except Exception as e:
        print(f'Error accepting call: {e}')

@socketio.on('call_end')
def handle_call_end(data):
    """End a call"""
    user_id = _socket_int(session.get('user_id'))
    if not user_id:
        for uid, sid in active_users.items():
            if sid == request.sid:
                user_id = uid
                break
    call_id = _socket_int(data.get('call_id'))
    target_id = _socket_int(data.get('target_id'))
    
    try:
        # If we have a call_id, use it
        if call_id:
            call = Call.query.get(call_id)
            if call and (call.caller_id == user_id or call.receiver_id == user_id):
                call.status = 'ended'
                call.ended_at = datetime.utcnow()
                
                if call.started_at:
                    duration = (call.ended_at - call.started_at).total_seconds()
                    call.duration = int(duration)
                
                db.session.commit()
                
                # Notify other party
                other_user_id = call.receiver_id if call.caller_id == user_id else call.caller_id
                if other_user_id in active_users:
                    target_sid = active_users[other_user_id]
                    print(f'📤 Emitting call_ended to user {other_user_id} (SID: {target_sid})')
                    emit('call_ended', {'call_id': call.id}, room=target_sid)
        # If we have a target_id but no call_id, directly notify the other user
        elif target_id and target_id in active_users:
            print(f'📤 Emitting call_ended to user {target_id} (direct)')
            emit('call_ended', {}, room=active_users[target_id])
    except Exception as e:
        print(f'Error ending call: {e}')

@socketio.on('call_reject')
def handle_call_reject(data):
    """Reject a call"""
    user_id = _socket_int(session.get('user_id'))
    if not user_id:
        for uid, sid in active_users.items():
            if sid == request.sid:
                user_id = uid
                break
    call_id = _socket_int(data.get('call_id'))
    
    try:
        call = Call.query.get(call_id)
        if call and call.receiver_id == user_id:
            call.status = 'rejected'
            db.session.commit()
            
            # Notify caller
            if call.caller_id in active_users:
                emit('call_rejected', {'call_id': call.id}, room=active_users[call.caller_id])
    except Exception as e:
        print(f'Error rejecting call: {e}')

@socketio.on('ice_candidate')
def handle_ice_candidate(data):
    """Handle WebRTC ICE candidates"""
    target_id = _socket_int(data.get('target_id'))
    
    if target_id in active_users:
        emit('ice_candidate', {
            'candidate': data.get('candidate'),
            'sdpMLineIndex': data.get('sdpMLineIndex'),
            'sdpMid': data.get('sdpMid')
        }, room=active_users[target_id])

@socketio.on('offer')
def handle_offer(data):
    """Handle WebRTC offer"""
    target_id = _socket_int(data.get('target_id'))
    
    if target_id in active_users:
        emit('offer', {
            'sdp': data.get('sdp'),
            'type': data.get('type')
        }, room=active_users[target_id])

@socketio.on('answer')
def handle_answer(data):
    """Handle WebRTC answer"""
    target_id = _socket_int(data.get('target_id'))
    
    if target_id in active_users:
        emit('answer', {
            'sdp': data.get('sdp'),
            'type': data.get('type')
        }, room=active_users[target_id])

# Zoom-like features

@socketio.on('meeting_chat_message')
def handle_meeting_chat_message(data):
    """Handle chat messages during meetings"""
    user_id = session.get('user_id')
    if not user_id:
        return
    
    meeting_id = data.get('meeting_id')
    content = data.get('content')
    message_type = data.get('message_type', 'text')
    
    try:
        # Save message to database
        msg = MeetingMessage(
            meeting_id=meeting_id,
            sender_id=user_id,
            content=content,
            message_type=message_type
        )
        db.session.add(msg)
        db.session.commit()
        
        # Broadcast to all participants in the meeting
        emit('meeting_chat_message', msg.to_dict(), room=f'meeting_{meeting_id}', skip_sid=request.sid)
    except Exception as e:
        print(f'Error handling meeting chat message: {e}')

@socketio.on('raise_hand')
def handle_raise_hand(data):
    """Handle raise hand action"""
    user_id = session.get('user_id')
    if not user_id:
        return
    
    meeting_id = data.get('meeting_id')
    
    try:
        participant = MeetingParticipant.query.filter_by(meeting_id=meeting_id, user_id=user_id).first()
        if participant:
            participant.has_raised_hand = True
            db.session.commit()
            
            # Notify host
            emit('hand_raised', {
                'user_id': user_id,
                'username': participant.user.username,
                'meeting_id': meeting_id
            }, room=f'meeting_{meeting_id}')
    except Exception as e:
        print(f'Error handling raise hand: {e}')

@socketio.on('lower_hand')
def handle_lower_hand(data):
    """Handle lower hand action"""
    user_id = session.get('user_id')
    if not user_id:
        return
    
    meeting_id = data.get('meeting_id')
    
    try:
        participant = MeetingParticipant.query.filter_by(meeting_id=meeting_id, user_id=user_id).first()
        if participant:
            participant.has_raised_hand = False
            db.session.commit()
            
            # Notify participants
            emit('hand_lowered', {
                'user_id': user_id,
                'meeting_id': meeting_id
            }, room=f'meeting_{meeting_id}')
    except Exception as e:
        print(f'Error handling lower hand: {e}')

@socketio.on('request_to_join')
def handle_request_to_join(data):
    """Handle waiting room join request"""
    user_id = session.get('user_id')
    if not user_id:
        return
    
    meeting_id = data.get('meeting_id')
    
    try:
        meeting = Meeting.query.get(meeting_id)
        if not meeting:
            return
        
        # Check if waiting room is enabled
        if meeting.has_waiting_room:
            participant = MeetingParticipant.query.filter_by(meeting_id=meeting_id, user_id=user_id).first()
            if participant:
                participant.is_in_waiting_room = True
                db.session.commit()
                
                # Notify host
                emit('join_request', {
                    'user_id': user_id,
                    'username': participant.user.username,
                    'meeting_id': meeting_id
                }, room=f'meeting_{meeting_id}')
        else:
            # Auto-admit if waiting room disabled
            participant = MeetingParticipant.query.filter_by(meeting_id=meeting_id, user_id=user_id).first()
            if participant:
                participant.is_in_waiting_room = False
                db.session.commit()
                emit('admitted_to_meeting', {'meeting_id': meeting_id}, room=f'user_{user_id}')
    except Exception as e:
        print(f'Error handling request to join: {e}')

@socketio.on('admit_participant')
def handle_admit_participant(data):
    """Host admits participant from waiting room"""
    user_id = session.get('user_id')
    if not user_id:
        return
    
    meeting_id = data.get('meeting_id')
    participant_id = data.get('participant_id')
    
    try:
        meeting = Meeting.query.get(meeting_id)
        if meeting and meeting.host_id == user_id:  # Only host can admit
            participant = MeetingParticipant.query.get(participant_id)
            if participant:
                participant.is_in_waiting_room = False
                db.session.commit()
                
                # Notify the participant
                emit('admitted_to_meeting', {'meeting_id': meeting_id}, room=f'user_{participant.user_id}')
    except Exception as e:
        print(f'Error admitting participant: {e}')

@socketio.on('lock_meeting')
def handle_lock_meeting(data):
    """Lock/unlock meeting"""
    user_id = session.get('user_id')
    if not user_id:
        return
    
    meeting_id = data.get('meeting_id')
    is_locked = data.get('is_locked')
    
    try:
        meeting = Meeting.query.get(meeting_id)
        if meeting and meeting.host_id == user_id:  # Only host can lock
            meeting.is_locked = is_locked
            db.session.commit()
            
            # Notify all participants
            emit('meeting_locked', {
                'meeting_id': meeting_id,
                'is_locked': is_locked
            }, room=f'meeting_{meeting_id}')
    except Exception as e:
        print(f'Error locking meeting: {e}')

@app.route('/health')
def health_check():
    return {'status': 'healthy', 'message': 'Owl-talk server is running'}

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "Owl-talk - Secure Messaging Application", 200

if __name__ == '__main__':
    import ssl

    backend_port = int(os.environ.get('OWL_TALK_PORT', '4003'))
    flask_env = os.environ.get('FLASK_ENV', 'development').lower()
    debug_mode = flask_env != 'production'

    # Check if SSL certificates exist
    ssl_cert = os.path.join(os.path.dirname(__file__), 'ssl', 'cert.pem')
    ssl_key = os.path.join(os.path.dirname(__file__), 'ssl', 'key.pem')
    
    if os.path.exists(ssl_cert) and os.path.exists(ssl_key):
        print("🦉 Starting Owl-talk Server...")
        print("🔐 HTTPS enabled - Calls will work!")
        print("🌐 Server will be available at: https://localhost:" + str(backend_port))
        print("📡 LAN Access: https://192.168.37.11:" + str(backend_port))
        print("📱 WebSocket connections enabled")
        print("⚠️  Accept the self-signed certificate in your browser")
        
        # Create SSL context for HTTPS with gevent
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(ssl_cert, ssl_key)
        
        # Use gevent async_mode for better SSL support on Windows
        socketio.run(app, host='0.0.0.0', port=backend_port, debug=debug_mode,
                    ssl_context=context, allow_unsafe_werkzeug=True)
    else:
        print("🦉 Starting Owl-talk Server...")
        print("⚠️  HTTPS not configured - Using HTTP")
        print("🌐 Server will be available at: http://localhost:" + str(backend_port))
        print("📱 WebSocket connections enabled")
        
        socketio.run(app, host='0.0.0.0', port=backend_port, debug=debug_mode, allow_unsafe_werkzeug=True)
