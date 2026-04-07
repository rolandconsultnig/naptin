"""
Media Management Routes
Handles upload, download, and gallery for all media types
"""
from flask import Blueprint, request, jsonify, send_file, session, current_app
from src.models.user import User, db, Media, Message
from werkzeug.utils import secure_filename
import os
import mimetypes

# Optional PIL import for thumbnails
try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("⚠️  PIL/Pillow not installed. Thumbnail generation will be disabled.")
    print("   Install with: pip install Pillow")

media_bp = Blueprint('media', __name__)

def require_auth():
    """Helper to get current authenticated user"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    user = User.query.get(user_id)
    if not user:
        session.pop('user_id', None)
        return None
    return user

def generate_thumbnail(image_path, thumbnail_path, size=(300, 300)):
    """Generate thumbnail for image"""
    if not HAS_PIL:
        return False
    try:
        with Image.open(image_path) as img:
            img.thumbnail(size, Image.LANCZOS)
            img.save(thumbnail_path, 'JPEG', quality=85)
        return True
    except Exception as e:
        print(f'Error generating thumbnail: {e}')
        return False

def get_file_type(mime_type, filename):
    """Determine file type from mime type"""
    if mime_type.startswith('image/'):
        return 'image'
    elif mime_type.startswith('video/'):
        return 'video'
    elif mime_type.startswith('audio/'):
        return 'audio'
    else:
        ext = filename.split('.')[-1].lower()
        if ext in ['pdf', 'doc', 'docx', 'txt', 'rtf']:
            return 'document'
        return 'other'

@media_bp.route('/media/upload', methods=['POST'])
def upload_media():
    """Upload media file with automatic thumbnail generation"""
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Create upload directories
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'static', 'uploads')
        thumbnail_dir = os.path.join(upload_dir, 'thumbnails')
        os.makedirs(upload_dir, exist_ok=True)
        os.makedirs(thumbnail_dir, exist_ok=True)

        # Get file info
        filename = secure_filename(file.filename)
        mime_type = file.content_type or mimetypes.guess_type(filename)[0]
        file_type = get_file_type(mime_type or '', filename)

        # Save original file
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        file_size = os.path.getsize(file_path)

        # Generate thumbnail for images
        thumbnail_path = None
        if file_type == 'image':
            thumbnail_filename = f"thumb_{filename}"
            thumbnail_path_full = os.path.join(thumbnail_dir, thumbnail_filename)
            if generate_thumbnail(file_path, thumbnail_path_full):
                thumbnail_path = f"/static/uploads/thumbnails/{thumbnail_filename}"

        # Also generate thumbnail for video (first frame)
        if file_type == 'video':
            # For now, use a placeholder. Full video thumbnail extraction requires ffmpeg
            thumbnail_path = "/static/images/video-placeholder.jpg"

        # Save media record to database
        media = Media(
            user_id=user.id,
            file_name=filename,
            file_path=f"/static/uploads/{filename}",
            file_type=file_type,
            file_size=file_size,
            mime_type=mime_type,
            thumbnail_path=thumbnail_path,
            is_public=request.form.get('is_public', 'false').lower() == 'true'
        )
        db.session.add(media)
        db.session.commit()

        return jsonify({
            'message': 'Media uploaded successfully',
            'media': media.to_dict()
        }), 201

    except Exception as e:
        print(f'Error uploading media: {e}')
        return jsonify({'error': str(e)}), 500

@media_bp.route('/media', methods=['GET'])
def get_media():
    """Get all media for current user"""
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        media_list = Media.query.filter_by(user_id=user.id).order_by(Media.uploaded_at.desc()).all()
        
        # Filter by type if provided
        media_type = request.args.get('type')
        if media_type:
            media_list = [m for m in media_list if m.file_type == media_type]

        return jsonify({
            'media': [m.to_dict() for m in media_list],
            'total': len(media_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@media_bp.route('/media/<int:media_id>', methods=['GET'])
def get_media_item(media_id):
    """Get specific media item"""
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        media = Media.query.get(media_id)
        if not media:
            return jsonify({'error': 'Media not found'}), 404

        # Check if user has access
        if media.user_id != user.id and not media.is_public:
            return jsonify({'error': 'Access denied'}), 403

        return jsonify({'media': media.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@media_bp.route('/media/download/<int:media_id>', methods=['GET'])
def download_media(media_id):
    """Download media file"""
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        media = Media.query.get(media_id)
        if not media:
            return jsonify({'error': 'Media not found'}), 404

        # Check if user has access
        if media.user_id != user.id and not media.is_public:
            return jsonify({'error': 'Access denied'}), 403

        # Construct full path
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        file_path = os.path.join(base_dir, media.file_path.lstrip('/'))

        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found on server'}), 404

        return send_file(
            file_path,
            as_attachment=True,
            download_name=media.file_name,
            mimetype=media.mime_type
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@media_bp.route('/media/<int:media_id>', methods=['DELETE'])
def delete_media(media_id):
    """Delete media file"""
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        media = Media.query.get(media_id)
        if not media:
            return jsonify({'error': 'Media not found'}), 404

        # Check ownership
        if media.user_id != user.id:
            return jsonify({'error': 'Permission denied'}), 403

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
        return jsonify({'error': str(e)}), 500

@media_bp.route('/media/gallery', methods=['GET'])
def get_gallery():
    """Get gallery view with thumbnails"""
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    try:
        # Get all media types with thumbnails
        media_list = Media.query.filter_by(user_id=user.id).order_by(Media.uploaded_at.desc()).all()
        
        gallery = {
            'images': [],
            'videos': [],
            'documents': [],
            'audio': []
        }

        for media in media_list:
            item = media.to_dict()
            if media.file_type == 'image':
                gallery['images'].append(item)
            elif media.file_type == 'video':
                gallery['videos'].append(item)
            elif media.file_type == 'document':
                gallery['documents'].append(item)
            elif media.file_type == 'audio':
                gallery['audio'].append(item)

        return jsonify(gallery), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

