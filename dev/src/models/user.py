from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='offline', index=True)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_admin = db.Column(db.Boolean, default=False, index=True)
    is_banned = db.Column(db.Boolean, default=False, index=True)
    profile_picture = db.Column(db.String(200), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    
    # Privacy settings
    show_online_status = db.Column(db.Boolean, default=True)
    show_last_seen = db.Column(db.Boolean, default=True)
    allow_group_invites = db.Column(db.Boolean, default=True)
    allow_direct_messages = db.Column(db.Boolean, default=True)
    notifications_enabled = db.Column(db.Boolean, default=True)
    sound_notifications = db.Column(db.Boolean, default=True)
    
    __table_args__ = {'extend_existing': True}

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'status': self.status,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_admin': self.is_admin,
            'is_banned': self.is_banned,
            'profile_picture': self.profile_picture,
            'bio': self.bio,
            'show_online_status': self.show_online_status,
            'show_last_seen': self.show_last_seen,
            'allow_group_invites': self.allow_group_invites,
            'allow_direct_messages': self.allow_direct_messages,
            'notifications_enabled': self.notifications_enabled,
            'sound_notifications': self.sound_notifications
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=True)
    message_type = db.Column(db.String(20), default='text')  # text, image, file, voice
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_read = db.Column(db.Boolean, default=False, index=True)
    is_deleted = db.Column(db.Boolean, default=False, index=True)
    reply_to_id = db.Column(db.Integer, db.ForeignKey('message.id'), nullable=True)
    file_path = db.Column(db.String(500), nullable=True)
    file_name = db.Column(db.String(200), nullable=True)
    file_size = db.Column(db.Integer, nullable=True)
    
    __table_args__ = {'extend_existing': True}

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_messages')
    reply_to = db.relationship('Message', remote_side=[id], backref='replies')

    def __repr__(self):
        return f'<Message {self.id}>'

    def to_reply_preview(self):
        """Snapshot for quoted-reply UI (photo, voice, file, text)."""
        return {
            'message_id': self.id,
            'sender_id': self.sender_id,
            'sender_username': self.sender.username if self.sender else None,
            'message_type': self.message_type or 'text',
            'content': self.content,
            'file_name': self.file_name,
        }

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'content': self.content,
            'message_type': self.message_type,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'is_read': self.is_read,
            'is_deleted': self.is_deleted,
            'reply_to_id': self.reply_to_id,
            'file_path': self.file_path,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'sender_username': self.sender.username if self.sender else None,
            'receiver_username': self.receiver.username if self.receiver else None
        }

class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    profile_picture = db.Column(db.String(200), nullable=True)
    is_active = db.Column(db.Boolean, default=True, index=True)
    # Admin management fields
    is_suspended = db.Column(db.Boolean, default=False, index=True)
    suspended_at = db.Column(db.DateTime, nullable=True)
    suspended_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    suspension_reason = db.Column(db.Text, nullable=True)
    auth_code = db.Column(db.String(50), unique=True, nullable=True, index=True)
    auth_code_generated_at = db.Column(db.DateTime, nullable=True)
    is_authorized = db.Column(db.Boolean, default=True, index=True)
    
    __table_args__ = {'extend_existing': True}

    creator = db.relationship('User', foreign_keys=[created_by], backref='created_groups')
    suspender = db.relationship('User', foreign_keys=[suspended_by])
    members = db.relationship('GroupMember', backref='group', cascade='all, delete-orphan')
    logs = db.relationship('GroupLog', backref='group', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Group {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'profile_picture': self.profile_picture,
            'is_active': self.is_active,
            'member_count': len(self.members),
            'creator_username': self.creator.username if self.creator else None,
            'is_suspended': self.is_suspended,
            'suspended_at': self.suspended_at.isoformat() if self.suspended_at else None,
            'suspension_reason': self.suspension_reason,
            'auth_code': self.auth_code,
            'auth_code_generated_at': self.auth_code_generated_at.isoformat() if self.auth_code_generated_at else None,
            'is_authorized': self.is_authorized
        }

class GroupMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    role = db.Column(db.String(20), default='member')  # admin, member
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_muted = db.Column(db.Boolean, default=False)
    
    __table_args__ = {'extend_existing': True}

    user = db.relationship('User', backref='group_memberships')

    def __repr__(self):
        return f'<GroupMember {self.user.username} in {self.group.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'group_id': self.group_id,
            'user_id': self.user_id,
            'role': self.role,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'is_muted': self.is_muted,
            'username': self.user.username if self.user else None
        }

class GroupLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True, index=True)
    action = db.Column(db.String(50), nullable=False)  # created, joined, left, removed, suspended, authorized, etc.
    details = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = {'extend_existing': True}
    
    user = db.relationship('User', backref='group_logs')
    
    def __repr__(self):
        return f'<GroupLog {self.action} for group {self.group_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'group_id': self.group_id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else 'System',
            'action': self.action,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Call(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    caller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    call_type = db.Column(db.String(20), default='audio')  # audio, video
    status = db.Column(db.String(20), default='initiated')  # initiated, ringing, active, ended, missed, rejected
    started_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    ended_at = db.Column(db.DateTime, nullable=True)
    duration = db.Column(db.Integer, default=0)  # Duration in seconds
    
    caller = db.relationship('User', foreign_keys=[caller_id], backref='outgoing_calls')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='incoming_calls')
    
    __table_args__ = {'extend_existing': True}
    
    def __repr__(self):
        return f'<Call {self.caller.username} → {self.receiver.username}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'caller_id': self.caller_id,
            'receiver_id': self.receiver_id,
            'call_type': self.call_type,
            'status': self.status,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'duration': self.duration,
            'caller_username': self.caller.username if self.caller else None,
            'receiver_username': self.receiver.username if self.receiver else None
        }

class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    host_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    meeting_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    meeting_type = db.Column(db.String(20), default='meeting')  # meeting, presentation
    status = db.Column(db.String(20), default='scheduled')  # scheduled, active, ended, cancelled
    started_at = db.Column(db.DateTime, nullable=True)
    ended_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    # Settings
    allow_screen_sharing = db.Column(db.Boolean, default=True)
    allow_presentation = db.Column(db.Boolean, default=True)
    # Zoom-like security settings
    is_locked = db.Column(db.Boolean, default=False)  # Meeting lock
    requires_password = db.Column(db.Boolean, default=False)
    meeting_password = db.Column(db.String(50), nullable=True)
    has_waiting_room = db.Column(db.Boolean, default=False)  # Waiting room enabled
    allow_chat = db.Column(db.Boolean, default=True)  # Chat during meeting
    allow_participants_to_share = db.Column(db.Boolean, default=True)
    allow_participants_to_unmute = db.Column(db.Boolean, default=True)
    max_participants = db.Column(db.Integer, default=100)
    # Scheduling
    scheduled_at = db.Column(db.DateTime, nullable=True)
    duration = db.Column(db.Integer, nullable=True)  # Duration in minutes
    timezone = db.Column(db.String(50), nullable=True)
    
    __table_args__ = {'extend_existing': True}
    
    host = db.relationship('User', backref='hosted_meetings')
    participants = db.relationship('MeetingParticipant', backref='meeting', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Meeting {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'host_id': self.host_id,
            'meeting_code': self.meeting_code,
            'meeting_type': self.meeting_type,
            'status': self.status,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'allow_screen_sharing': self.allow_screen_sharing,
            'allow_presentation': self.allow_presentation,
            'host_username': self.host.username if self.host else None,
            'participant_count': len(self.participants),
            # Zoom-like settings
            'is_locked': self.is_locked,
            'requires_password': self.requires_password,
            'has_waiting_room': self.has_waiting_room,
            'allow_chat': self.allow_chat,
            'allow_participants_to_share': self.allow_participants_to_share,
            'allow_participants_to_unmute': self.allow_participants_to_unmute,
            'max_participants': self.max_participants,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'duration': self.duration
        }

class MeetingParticipant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey('meeting.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    role = db.Column(db.String(20), default='participant')  # host, presenter, participant
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    left_at = db.Column(db.DateTime, nullable=True)
    is_sharing_screen = db.Column(db.Boolean, default=False)
    is_presenting = db.Column(db.Boolean, default=False)
    # Zoom-like features
    is_muted = db.Column(db.Boolean, default=False)
    has_video_enabled = db.Column(db.Boolean, default=True)
    has_raised_hand = db.Column(db.Boolean, default=False)
    is_in_waiting_room = db.Column(db.Boolean, default=False)
    virtual_background = db.Column(db.String(200), nullable=True)  # URL to virtual bg
    
    __table_args__ = {'extend_existing': True}
    
    user = db.relationship('User', backref='meeting_participations')
    
    def __repr__(self):
        return f'<MeetingParticipant {self.user.username} in meeting {self.meeting_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'meeting_id': self.meeting_id,
            'user_id': self.user_id,
            'role': self.role,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'left_at': self.left_at.isoformat() if self.left_at else None,
            'is_sharing_screen': self.is_sharing_screen,
            'is_presenting': self.is_presenting,
            'is_muted': self.is_muted,
            'has_video_enabled': self.has_video_enabled,
            'has_raised_hand': self.has_raised_hand,
            'is_in_waiting_room': self.is_in_waiting_room,
            'virtual_background': self.virtual_background,
            'username': self.user.username if self.user else None
        }

class MeetingSlide(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey('meeting.id'), nullable=False, index=True)
    slide_number = db.Column(db.Integer, default=1)
    file_path = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(200), nullable=False)
    file_type = db.Column(db.String(50), default='image')  # image, pdf
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    __table_args__ = {'extend_existing': True}
    
    uploader = db.relationship('User', foreign_keys=[uploaded_by], backref='uploaded_slides')
    meeting = db.relationship('Meeting', backref='slides')
    
    def __repr__(self):
        return f'<MeetingSlide {self.file_name} for meeting {self.meeting_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'meeting_id': self.meeting_id,
            'slide_number': self.slide_number,
            'file_path': self.file_path,
            'file_name': self.file_name,
            'file_type': self.file_type,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'uploaded_by': self.uploaded_by,
            'uploader_username': self.uploader.username if self.uploader else None
        }

class MeetingMessage(db.Model):
    """Messages sent during a meeting (chat during video calls)"""
    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey('meeting.id'), nullable=False, index=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, image, file
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_pinned = db.Column(db.Boolean, default=False)
    
    __table_args__ = {'extend_existing': True}
    
    sender = db.relationship('User', backref='meeting_messages')
    meeting = db.relationship('Meeting', backref='messages')
    
    def __repr__(self):
        return f'<MeetingMessage {self.id} in meeting {self.meeting_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'meeting_id': self.meeting_id,
            'sender_id': self.sender_id,
            'content': self.content,
            'message_type': self.message_type,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'is_pinned': self.is_pinned,
            'sender_username': self.sender.username if self.sender else None
        }

class Media(db.Model):
    """Media files uploaded by users (images, videos, documents, audio)"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    file_name = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)  # image, video, document, audio
    file_size = db.Column(db.Integer, nullable=False)  # Size in bytes
    mime_type = db.Column(db.String(100), nullable=True)
    thumbnail_path = db.Column(db.String(500), nullable=True)  # Thumbnail for images/videos
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_public = db.Column(db.Boolean, default=False)
    
    __table_args__ = {'extend_existing': True}
    
    user = db.relationship('User', backref='uploaded_media')
    
    def __repr__(self):
        return f'<Media {self.file_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'thumbnail_path': self.thumbnail_path,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'is_public': self.is_public,
            'uploader_username': self.user.username if self.user else None,
            'download_url': f'/api/media/download/{self.id}'
        }

class PresentationRecording(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey('meeting.id'), nullable=False, index=True)
    call_id = db.Column(db.Integer, db.ForeignKey('call.id'), nullable=True)
    recording_path = db.Column(db.String(500), nullable=False)
    recording_type = db.Column(db.String(20), default='screen')  # screen, audio, video
    duration = db.Column(db.Integer, default=0)  # Duration in seconds
    file_size = db.Column(db.Integer, default=0)  # File size in bytes
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime, nullable=True)
    recorded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_complete = db.Column(db.Boolean, default=False)
    
    __table_args__ = {'extend_existing': True}
    
    recording_creator = db.relationship('User', foreign_keys=[recorded_by], backref='recordings')
    meeting = db.relationship('Meeting', backref='recordings')
    call = db.relationship('Call', backref='recording')
    
    def __repr__(self):
        return f'<PresentationRecording {self.recording_path}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'meeting_id': self.meeting_id,
            'call_id': self.call_id,
            'recording_path': self.recording_path,
            'recording_type': self.recording_type,
            'duration': self.duration,
            'file_size': self.file_size,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'recorded_by': self.recorded_by,
            'recorder_username': self.recording_creator.username if self.recording_creator else None,
            'is_complete': self.is_complete
        }


class OfficeIntegration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True, index=True)
    tenant_id = db.Column(db.String(120), nullable=False, default='common')
    graph_user_id = db.Column(db.String(120), nullable=True)
    drive_id = db.Column(db.String(160), nullable=True)
    access_token = db.Column(db.Text, nullable=False)
    refresh_token = db.Column(db.Text, nullable=True)
    token_type = db.Column(db.String(40), nullable=False, default='Bearer')
    scope = db.Column(db.Text, nullable=True)
    token_expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    __table_args__ = {'extend_existing': True}

    user = db.relationship('User', backref='office_integration', uselist=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'tenant_id': self.tenant_id,
            'graph_user_id': self.graph_user_id,
            'drive_id': self.drive_id,
            'token_type': self.token_type,
            'scope': self.scope,
            'token_expires_at': self.token_expires_at.isoformat() if self.token_expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Tenant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(80), unique=True, nullable=False, index=True)
    name = db.Column(db.String(160), nullable=False)
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    __table_args__ = {'extend_existing': True}

    members = db.relationship('TenantMember', backref='tenant', cascade='all, delete-orphan')
    module_policies = db.relationship('TenantModulePolicy', backref='tenant', cascade='all, delete-orphan')
    audit_events = db.relationship('TenantAuditEvent', backref='tenant', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'name': self.name,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class TenantMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenant.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    role = db.Column(db.String(40), nullable=False, default='member')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        db.UniqueConstraint('tenant_id', 'user_id', name='uq_tenant_member_tenant_user'),
        {'extend_existing': True},
    )

    user = db.relationship('User', backref='tenant_memberships')

    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'user_id': self.user_id,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'username': self.user.username if self.user else None,
            'email': self.user.email if self.user else None,
        }


class TenantModulePolicy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenant.id'), nullable=False, index=True)
    segment = db.Column(db.String(80), nullable=False, index=True)
    is_enabled = db.Column(db.Boolean, nullable=False, default=True, index=True)
    updated_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    __table_args__ = (
        db.UniqueConstraint('tenant_id', 'segment', name='uq_tenant_segment_policy'),
        {'extend_existing': True},
    )

    updater = db.relationship('User', foreign_keys=[updated_by])

    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'segment': self.segment,
            'is_enabled': self.is_enabled,
            'updated_by': self.updated_by,
            'updated_by_username': self.updater.username if self.updater else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class TenantAuditEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenant.id'), nullable=False, index=True)
    actor_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True, index=True)
    action = db.Column(db.String(80), nullable=False, index=True)
    detail = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    __table_args__ = {'extend_existing': True}

    actor = db.relationship('User', foreign_keys=[actor_user_id])

    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'actor_user_id': self.actor_user_id,
            'actor_email': self.actor.email if self.actor else None,
            'actor_username': self.actor.username if self.actor else None,
            'action': self.action,
            'detail': self.detail,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class EmployeeRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenant.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True, index=True)
    employee_number = db.Column(db.String(80), nullable=False, index=True)
    full_name = db.Column(db.String(160), nullable=False)
    email = db.Column(db.String(160), nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    department = db.Column(db.String(120), nullable=True)
    job_title = db.Column(db.String(120), nullable=True)
    employment_status = db.Column(db.String(40), nullable=False, default='active')
    manager_name = db.Column(db.String(160), nullable=True)
    hire_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    __table_args__ = (
        db.UniqueConstraint('tenant_id', 'employee_number', name='uq_employee_record_tenant_number'),
        {'extend_existing': True},
    )

    tenant = db.relationship('Tenant', backref='employee_records')
    user = db.relationship('User', backref='employee_record', uselist=False)

    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'user_id': self.user_id,
            'employee_number': self.employee_number,
            'full_name': self.full_name,
            'email': self.email,
            'gender': self.gender,
            'department': self.department,
            'job_title': self.job_title,
            'employment_status': self.employment_status,
            'manager_name': self.manager_name,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class JobPosting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenant.id'), nullable=False, index=True)
    title = db.Column(db.String(160), nullable=False)
    department = db.Column(db.String(120), nullable=True)
    location = db.Column(db.String(120), nullable=True)
    employment_type = db.Column(db.String(40), nullable=True)
    status = db.Column(db.String(40), nullable=False, default='open', index=True)
    description = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    __table_args__ = {'extend_existing': True}

    tenant = db.relationship('Tenant', backref='job_postings')
    creator = db.relationship('User', foreign_keys=[created_by])

    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'title': self.title,
            'department': self.department,
            'location': self.location,
            'employment_type': self.employment_type,
            'status': self.status,
            'description': self.description,
            'created_by': self.created_by,
            'created_by_username': self.creator.username if self.creator else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenant.id'), nullable=False, index=True)
    job_posting_id = db.Column(db.Integer, db.ForeignKey('job_posting.id'), nullable=False, index=True)
    full_name = db.Column(db.String(160), nullable=False)
    email = db.Column(db.String(160), nullable=True)
    phone = db.Column(db.String(40), nullable=True)
    status = db.Column(db.String(40), nullable=False, default='applied', index=True)
    score = db.Column(db.Float, nullable=True)
    resume_url = db.Column(db.String(500), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    __table_args__ = {'extend_existing': True}

    tenant = db.relationship('Tenant', backref='candidates')
    job_posting = db.relationship('JobPosting', backref='candidates')

    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'job_posting_id': self.job_posting_id,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'status': self.status,
            'score': self.score,
            'resume_url': self.resume_url,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class CandidateInterview(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenant.id'), nullable=False, index=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False, index=True)
    interviewer_name = db.Column(db.String(160), nullable=False)
    scheduled_at = db.Column(db.DateTime, nullable=False, index=True)
    feedback = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    __table_args__ = {'extend_existing': True}

    tenant = db.relationship('Tenant', backref='candidate_interviews')
    candidate = db.relationship('Candidate', backref='interviews')

    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'candidate_id': self.candidate_id,
            'interviewer_name': self.interviewer_name,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'feedback': self.feedback,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class OnboardingTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenant.id'), nullable=False, index=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    owner = db.Column(db.String(160), nullable=True)
    status = db.Column(db.String(40), nullable=False, default='pending', index=True)
    due_date = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    __table_args__ = {'extend_existing': True}

    tenant = db.relationship('Tenant', backref='onboarding_tasks')
    candidate = db.relationship('Candidate', backref='onboarding_tasks')

    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'candidate_id': self.candidate_id,
            'title': self.title,
            'owner': self.owner,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class AttendanceRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenant.id'), nullable=False, index=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee_record.id'), nullable=True, index=True)
    employee_name = db.Column(db.String(160), nullable=False)
    department = db.Column(db.String(120), nullable=True)
    work_date = db.Column(db.Date, nullable=False, index=True)
    clock_in_at = db.Column(db.DateTime, nullable=True)
    clock_out_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(40), nullable=False, default='present', index=True)
    source = db.Column(db.String(40), nullable=True)
    hours_worked = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    __table_args__ = {'extend_existing': True}

    tenant = db.relationship('Tenant', backref='attendance_records')
    employee = db.relationship('EmployeeRecord', backref='attendance_records')

    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'employee_id': self.employee_id,
            'employee_name': self.employee_name,
            'department': self.department,
            'work_date': self.work_date.isoformat() if self.work_date else None,
            'clock_in_at': self.clock_in_at.isoformat() if self.clock_in_at else None,
            'clock_out_at': self.clock_out_at.isoformat() if self.clock_out_at else None,
            'status': self.status,
            'source': self.source,
            'hours_worked': self.hours_worked,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class LeaveRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenant.id'), nullable=False, index=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee_record.id'), nullable=True, index=True)
    leave_type = db.Column(db.String(80), nullable=False)
    start_date = db.Column(db.Date, nullable=False, index=True)
    end_date = db.Column(db.Date, nullable=False, index=True)
    duration_days = db.Column(db.Integer, nullable=False, default=1)
    reason = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(40), nullable=False, default='pending', index=True)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    __table_args__ = {'extend_existing': True}

    tenant = db.relationship('Tenant', backref='leave_requests')
    employee = db.relationship('EmployeeRecord', backref='leave_requests')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by])

    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'employee_id': self.employee_id,
            'leave_type': self.leave_type,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'duration_days': self.duration_days,
            'reason': self.reason,
            'status': self.status,
            'reviewed_by': self.reviewed_by,
            'reviewed_by_username': self.reviewer.username if self.reviewer else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class PayrollRun(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenant.id'), nullable=False, index=True)
    period_label = db.Column(db.String(80), nullable=False)
    period_start = db.Column(db.Date, nullable=False)
    period_end = db.Column(db.Date, nullable=False)
    pay_date = db.Column(db.Date, nullable=False, index=True)
    status = db.Column(db.String(40), nullable=False, default='draft', index=True)
    staff_paid = db.Column(db.Integer, nullable=False, default=0)
    gross_total = db.Column(db.Float, nullable=False, default=0)
    deductions_total = db.Column(db.Float, nullable=False, default=0)
    net_total = db.Column(db.Float, nullable=False, default=0)
    notes = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)

    __table_args__ = {'extend_existing': True}

    tenant = db.relationship('Tenant', backref='payroll_runs')
    creator = db.relationship('User', foreign_keys=[created_by])

    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'period_label': self.period_label,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'pay_date': self.pay_date.isoformat() if self.pay_date else None,
            'status': self.status,
            'staff_paid': self.staff_paid,
            'gross_total': self.gross_total,
            'deductions_total': self.deductions_total,
            'net_total': self.net_total,
            'notes': self.notes,
            'created_by': self.created_by,
            'created_by_username': self.creator.username if self.creator else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
