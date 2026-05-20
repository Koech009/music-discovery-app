from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.playlist import Playlist
from models.audit_log import AuditLog
from schemas.playlist_schema import playlist_schema, playlists_schema
from marshmallow import ValidationError

playlist_bp = Blueprint('playlists', __name__)


# ── Helper ────────────────────────────────────────────────────────────────────

def log_audit(user_id, action, target_id, details):
    db.session.add(AuditLog(
        user_id=user_id,
        action=action,
        target_type="Playlist",
        target_id=target_id,
        details=details
    ))


def get_playlist_or_404(playlist_id):
    playlist = Playlist.query.get(playlist_id)
    if not playlist:
        return None, (jsonify({'error': 'Playlist not found'}), 404)
    return playlist, None


def is_owner_or_admin(playlist, current_user_id, claims):
    return playlist.user_id == current_user_id or claims.get("role") == "admin"


# ── GET /api/playlists ────────────────────────────────────────────────────────

@playlist_bp.route('', methods=['GET'])
@jwt_required()
def get_playlists():
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()

    # Admins can query any user's playlists via ?userId=
    # Regular users always get their own
    if claims.get("role") == "admin":
        user_id = request.args.get("userId", type=int) or current_user_id
    else:
        user_id = current_user_id

    playlists = Playlist.query.filter_by(user_id=user_id).all()
    return jsonify({'playlists': playlists_schema.dump(playlists)}), 200


# ── GET /api/playlists/<id> ───────────────────────────────────────────────────

@playlist_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_playlist(id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()

    playlist, err = get_playlist_or_404(id)
    if err:
        return err

    if not is_owner_or_admin(playlist, current_user_id, claims):
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify({'playlist': playlist_schema.dump(playlist)}), 200


# ── POST /api/playlists ───────────────────────────────────────────────────────

@playlist_bp.route('', methods=['POST'])
@jwt_required()
def create_playlist():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    try:
        new_playlist = playlist_schema.load(data)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    # Always assign playlist to the authenticated user
    new_playlist.user_id = current_user_id

    db.session.add(new_playlist)
    db.session.flush()

    log_audit(
        current_user_id, "CREATE_PLAYLIST", new_playlist.id,
        f"Created playlist: {new_playlist.name}"
    )

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Could not create playlist', 'details': str(e)}), 500

    return jsonify({'playlist': playlist_schema.dump(new_playlist)}), 201


# ── PATCH /api/playlists/<id> ─────────────────────────────────────────────────

@playlist_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def update_playlist(id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()

    playlist, err = get_playlist_or_404(id)
    if err:
        return err

    if not is_owner_or_admin(playlist, current_user_id, claims):
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    for field in ('name', 'description', 'songs'):
        if field in data:
            setattr(playlist, field, data[field])

    log_audit(
        current_user_id, "UPDATE_PLAYLIST", playlist.id,
        f"Updated playlist: {playlist.name}"
    )

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Update failed', 'details': str(e)}), 500

    return jsonify({'playlist': playlist_schema.dump(playlist)}), 200


# ── DELETE /api/playlists/<id> ────────────────────────────────────────────────

@playlist_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_playlist(id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()

    playlist, err = get_playlist_or_404(id)
    if err:
        return err

    if not is_owner_or_admin(playlist, current_user_id, claims):
        return jsonify({'error': 'Unauthorized'}), 403

    log_audit(
        current_user_id, "DELETE_PLAYLIST", id,
        f"Deleted playlist: {playlist.name}"
    )
    db.session.delete(playlist)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Delete failed', 'details': str(e)}), 500

    return jsonify({'message': 'Playlist deleted successfully'}), 200
