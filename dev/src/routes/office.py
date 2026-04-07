import os
import secrets
from datetime import datetime, timedelta
from urllib.parse import urlencode

import requests
from flask import Blueprint, jsonify, request, session

from src.models.user import User, OfficeIntegration, db
from src.utils.tenant_access import is_segment_enabled_for_user

office_bp = Blueprint('office', __name__)
GRAPH_BASE = 'https://graph.microsoft.com/v1.0'


def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)


def require_integrations_enabled(user):
    if not is_segment_enabled_for_user(user.id, 'integrations'):
        return jsonify({'error': 'Module disabled for tenant', 'segment': 'integrations'}), 403
    return None


def get_office_config():
    scopes = os.getenv(
        'OFFICE_SCOPES',
        'offline_access User.Read Files.ReadWrite Sites.ReadWrite.All'
    )
    return {
        'client_id': os.getenv('OFFICE_CLIENT_ID', '').strip(),
        'client_secret': os.getenv('OFFICE_CLIENT_SECRET', '').strip(),
        'tenant_id': os.getenv('OFFICE_TENANT_ID', 'common').strip() or 'common',
        'redirect_uri': os.getenv('OFFICE_REDIRECT_URI', '').strip(),
        'scopes': scopes,
        'webhook_url': os.getenv('OFFICE_WEBHOOK_NOTIFICATION_URL', '').strip(),
    }


def validate_office_config():
    config = get_office_config()
    missing = []
    if not config['client_id']:
        missing.append('OFFICE_CLIENT_ID')
    if not config['client_secret']:
        missing.append('OFFICE_CLIENT_SECRET')
    if not config['redirect_uri']:
        missing.append('OFFICE_REDIRECT_URI')
    return config, missing


def token_url(tenant_id):
    return f'https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token'


def auth_url(tenant_id):
    return f'https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize'


def ensure_fresh_token(integration, config):
    if not integration:
        return None, ('Office integration not connected', 404)

    now = datetime.utcnow()
    if integration.token_expires_at and integration.token_expires_at > now + timedelta(seconds=60):
        return integration.access_token, None

    if not integration.refresh_token:
        return None, ('Refresh token missing, reconnect Office integration', 401)

    payload = {
        'client_id': config['client_id'],
        'client_secret': config['client_secret'],
        'grant_type': 'refresh_token',
        'refresh_token': integration.refresh_token,
        'redirect_uri': config['redirect_uri'],
        'scope': config['scopes'],
    }

    response = requests.post(token_url(integration.tenant_id), data=payload, timeout=30)
    if not response.ok:
        return None, (f'Token refresh failed: {response.text}', 502)

    data = response.json()
    integration.access_token = data['access_token']
    integration.refresh_token = data.get('refresh_token', integration.refresh_token)
    integration.token_type = data.get('token_type', 'Bearer')
    integration.scope = data.get('scope', integration.scope)
    integration.token_expires_at = now + timedelta(seconds=int(data.get('expires_in', 3600)))
    db.session.commit()
    return integration.access_token, None


def graph_request(integration, config, method, path, params=None, body=None):
    token, error = ensure_fresh_token(integration, config)
    if error:
        return None, error

    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json',
    }
    if body is not None:
        headers['Content-Type'] = 'application/json'

    response = requests.request(
        method,
        f'{GRAPH_BASE}{path}',
        headers=headers,
        params=params,
        json=body,
        timeout=30,
    )

    if not response.ok:
        return None, (f'Graph API error ({response.status_code}): {response.text}', response.status_code)

    if response.status_code == 204 or not response.content:
        return {}, None

    return response.json(), None


@office_bp.route('/office/connect', methods=['POST'])
def office_connect():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_integrations_enabled(user)
    if blocked:
        return blocked

    config, missing = validate_office_config()
    if missing:
        return jsonify({'error': 'Office config missing', 'missing': missing}), 500

    state = secrets.token_urlsafe(24)
    session['office_oauth_state'] = state

    query = urlencode({
        'client_id': config['client_id'],
        'response_type': 'code',
        'redirect_uri': config['redirect_uri'],
        'response_mode': 'query',
        'scope': config['scopes'],
        'state': state,
    })

    return jsonify({'auth_url': f"{auth_url(config['tenant_id'])}?{query}", 'state': state})


@office_bp.route('/office/callback', methods=['GET'])
def office_callback():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_integrations_enabled(user)
    if blocked:
        return blocked

    config, missing = validate_office_config()
    if missing:
        return jsonify({'error': 'Office config missing', 'missing': missing}), 500

    state = request.args.get('state', '')
    code = request.args.get('code', '')
    expected_state = session.get('office_oauth_state')

    if not code:
        return jsonify({'error': 'Missing authorization code'}), 400
    if not expected_state or state != expected_state:
        return jsonify({'error': 'Invalid OAuth state'}), 400

    payload = {
        'client_id': config['client_id'],
        'client_secret': config['client_secret'],
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': config['redirect_uri'],
        'scope': config['scopes'],
    }

    token_response = requests.post(token_url(config['tenant_id']), data=payload, timeout=30)
    if not token_response.ok:
        return jsonify({'error': 'Token exchange failed', 'details': token_response.text}), 502

    token_data = token_response.json()
    expires_at = datetime.utcnow() + timedelta(seconds=int(token_data.get('expires_in', 3600)))

    me_response = requests.get(
        f'{GRAPH_BASE}/me',
        headers={'Authorization': f"Bearer {token_data['access_token']}"},
        timeout=30,
    )
    if not me_response.ok:
        return jsonify({'error': 'Failed to fetch Microsoft profile', 'details': me_response.text}), 502

    drive_response = requests.get(
        f'{GRAPH_BASE}/me/drive',
        headers={'Authorization': f"Bearer {token_data['access_token']}"},
        timeout=30,
    )

    graph_user = me_response.json()
    drive_data = drive_response.json() if drive_response.ok else {}

    integration = OfficeIntegration.query.filter_by(user_id=user.id).first()
    if not integration:
        integration = OfficeIntegration(user_id=user.id, tenant_id=config['tenant_id'], access_token='temp', token_expires_at=expires_at)
        db.session.add(integration)

    integration.tenant_id = config['tenant_id']
    integration.graph_user_id = graph_user.get('id')
    integration.drive_id = drive_data.get('id')
    integration.access_token = token_data['access_token']
    integration.refresh_token = token_data.get('refresh_token')
    integration.token_type = token_data.get('token_type', 'Bearer')
    integration.scope = token_data.get('scope')
    integration.token_expires_at = expires_at
    db.session.commit()

    session.pop('office_oauth_state', None)

    return jsonify({'message': 'Office integration connected', 'integration': integration.to_dict()})


@office_bp.route('/office/status', methods=['GET'])
def office_status():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_integrations_enabled(user)
    if blocked:
        return blocked

    integration = OfficeIntegration.query.filter_by(user_id=user.id).first()
    if not integration:
        return jsonify({'connected': False})

    return jsonify({'connected': True, 'integration': integration.to_dict()})


@office_bp.route('/office/disconnect', methods=['POST'])
def office_disconnect():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_integrations_enabled(user)
    if blocked:
        return blocked

    integration = OfficeIntegration.query.filter_by(user_id=user.id).first()
    if integration:
        db.session.delete(integration)
        db.session.commit()

    return jsonify({'message': 'Office integration disconnected'})


@office_bp.route('/office/docs', methods=['GET'])
def office_docs_list():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_integrations_enabled(user)
    if blocked:
        return blocked

    config, missing = validate_office_config()
    if missing:
        return jsonify({'error': 'Office config missing', 'missing': missing}), 500

    integration = OfficeIntegration.query.filter_by(user_id=user.id).first()
    parent_id = request.args.get('parent_id')

    path = '/me/drive/root/children' if not parent_id else f'/me/drive/items/{parent_id}/children'
    data, error = graph_request(integration, config, 'GET', path)
    if error:
        return jsonify({'error': error[0]}), error[1]

    return jsonify({'items': data.get('value', [])})


@office_bp.route('/office/docs/upload', methods=['POST'])
def office_docs_upload():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_integrations_enabled(user)
    if blocked:
        return blocked

    config, missing = validate_office_config()
    if missing:
        return jsonify({'error': 'Office config missing', 'missing': missing}), 500

    integration = OfficeIntegration.query.filter_by(user_id=user.id).first()
    token, error = ensure_fresh_token(integration, config)
    if error:
        return jsonify({'error': error[0]}), error[1]

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'Invalid file name'}), 400

    parent_id = request.form.get('parent_id')
    filename = request.form.get('filename', file.filename)
    content = file.read()

    if parent_id:
        upload_path = f'/me/drive/items/{parent_id}:/{filename}:/content'
    else:
        upload_path = f'/me/drive/root:/{filename}:/content'

    response = requests.put(
        f'{GRAPH_BASE}{upload_path}',
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/octet-stream'},
        data=content,
        timeout=60,
    )

    if not response.ok:
        return jsonify({'error': 'Upload failed', 'details': response.text}), response.status_code

    return jsonify({'message': 'Uploaded', 'item': response.json()})


@office_bp.route('/office/docs/<item_id>/versions', methods=['GET'])
def office_doc_versions(item_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_integrations_enabled(user)
    if blocked:
        return blocked

    config, missing = validate_office_config()
    if missing:
        return jsonify({'error': 'Office config missing', 'missing': missing}), 500

    integration = OfficeIntegration.query.filter_by(user_id=user.id).first()
    data, error = graph_request(integration, config, 'GET', f'/me/drive/items/{item_id}/versions')
    if error:
        return jsonify({'error': error[0]}), error[1]

    return jsonify({'versions': data.get('value', [])})


@office_bp.route('/office/docs/<item_id>/restore/<version_id>', methods=['POST'])
def office_doc_restore(item_id, version_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_integrations_enabled(user)
    if blocked:
        return blocked

    config, missing = validate_office_config()
    if missing:
        return jsonify({'error': 'Office config missing', 'missing': missing}), 500

    integration = OfficeIntegration.query.filter_by(user_id=user.id).first()
    _, error = graph_request(
        integration,
        config,
        'POST',
        f'/me/drive/items/{item_id}/versions/{version_id}/restoreVersion',
        body={}
    )
    if error:
        return jsonify({'error': error[0]}), error[1]

    return jsonify({'message': 'Version restored'})


@office_bp.route('/office/docs/<item_id>/share', methods=['POST'])
def office_doc_share(item_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_integrations_enabled(user)
    if blocked:
        return blocked

    config, missing = validate_office_config()
    if missing:
        return jsonify({'error': 'Office config missing', 'missing': missing}), 500

    payload = request.get_json(silent=True) or {}
    recipients = payload.get('recipients', [])
    role = payload.get('role', 'write')
    send_invitation = bool(payload.get('sendInvitation', True))
    message = payload.get('message', 'Shared via NAPTIN portal')

    if not recipients:
        return jsonify({'error': 'recipients is required'}), 400

    recipients_payload = [{'email': email} for email in recipients if isinstance(email, str) and email.strip()]
    if not recipients_payload:
        return jsonify({'error': 'No valid recipient emails'}), 400

    integration = OfficeIntegration.query.filter_by(user_id=user.id).first()
    body = {
        'recipients': recipients_payload,
        'requireSignIn': True,
        'sendInvitation': send_invitation,
        'roles': [role],
        'message': message,
    }
    data, error = graph_request(integration, config, 'POST', f'/me/drive/items/{item_id}/invite', body=body)
    if error:
        return jsonify({'error': error[0]}), error[1]

    return jsonify({'message': 'Share invitation sent', 'result': data})


@office_bp.route('/office/docs/<item_id>/collab-link', methods=['GET'])
def office_doc_collab_link(item_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_integrations_enabled(user)
    if blocked:
        return blocked

    config, missing = validate_office_config()
    if missing:
        return jsonify({'error': 'Office config missing', 'missing': missing}), 500

    link_type = request.args.get('type', 'edit')
    scope = request.args.get('scope', 'organization')

    integration = OfficeIntegration.query.filter_by(user_id=user.id).first()
    body = {'type': link_type, 'scope': scope}
    data, error = graph_request(integration, config, 'POST', f'/me/drive/items/{item_id}/createLink', body=body)
    if error:
        return jsonify({'error': error[0]}), error[1]

    return jsonify({'link': data.get('link', {})})


@office_bp.route('/office/subscriptions', methods=['POST'])
def office_create_subscription():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    blocked = require_integrations_enabled(user)
    if blocked:
        return blocked

    config, missing = validate_office_config()
    if missing:
        return jsonify({'error': 'Office config missing', 'missing': missing}), 500
    if not config['webhook_url']:
        return jsonify({'error': 'OFFICE_WEBHOOK_NOTIFICATION_URL is required for subscriptions'}), 400

    payload = request.get_json(silent=True) or {}
    resource = payload.get('resource', '/me/drive/root')
    expiration = datetime.utcnow() + timedelta(minutes=55)

    integration = OfficeIntegration.query.filter_by(user_id=user.id).first()
    body = {
        'changeType': 'updated',
        'notificationUrl': config['webhook_url'],
        'resource': resource,
        'expirationDateTime': expiration.replace(microsecond=0).isoformat() + 'Z',
        'clientState': os.getenv('OFFICE_WEBHOOK_CLIENT_STATE', 'naptin-office-webhook'),
    }

    data, error = graph_request(integration, config, 'POST', '/subscriptions', body=body)
    if error:
        return jsonify({'error': error[0]}), error[1]

    return jsonify({'subscription': data}), 201


@office_bp.route('/office/webhook', methods=['GET', 'POST'])
def office_webhook():
    validation_token = request.args.get('validationToken')
    if validation_token:
        return validation_token, 200, {'Content-Type': 'text/plain'}

    payload = request.get_json(silent=True) or {}
    return jsonify({'received': True, 'payload': payload}), 202
