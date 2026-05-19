from flask import Blueprint, request, jsonify
from extensions import db
from models.playlist import Playlist
from schemas.playlist_schema import playlist_schema, playlists_schema
from marshmallow import ValidationError
from routes.audit_routes import log_action

playlist_bp = Blueprint('playlists', __name__)


# GET all playlists for a user
@playlist_bp.route('', methods=['GET'])
def get_playlists():
    user_id = request.args.get('userId', type=int)
    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    playlists = Playlist.query.filter_by(user_id=user_id).all()
    return playlists_schema.jsonify(playlists), 200


# GET single playlist by ID
@playlist_bp.route('/<int:id>', methods=['GET'])
def get_playlist(id):
    playlist = Playlist.query.get(id)
    if not playlist:
        return jsonify({'error': 'Playlist not found'}), 404
    return playlist_schema.jsonify(playlist), 200


# POST create playlist
@playlist_bp.route('', methods=['POST'])
def create_playlist():
    data = request.get_json()
    try:
        new_playlist = playlist_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    db.session.add(new_playlist)
    db.session.commit()

    log_action(
        user_id=new_playlist.user_id,
        action="CREATE_PLAYLIST",
        target_type="Playlist",
        target_id=new_playlist.id,
        details=f"Created playlist: {new_playlist.name}"
    )
    return playlist_schema.jsonify(new_playlist), 201


# PATCH update playlist
@playlist_bp.route('/<int:id>', methods=['PATCH'])
def update_playlist(id):
    playlist = Playlist.query.get(id)
    if not playlist:
        return jsonify({'error': 'Playlist not found'}), 404

    data = request.get_json()
    if 'name' in data:
        playlist.name = data['name']
    if 'description' in data:
        playlist.description = data['description']
    if 'songs' in data:
        playlist.songs = data['songs']

    db.session.commit()

    log_action(
        user_id=playlist.user_id,
        action="UPDATE_PLAYLIST",
        target_type="Playlist",
        target_id=playlist.id,
        details=f"Updated playlist: {playlist.name}"
    )
    return playlist_schema.jsonify(playlist), 200


# DELETE playlist
@playlist_bp.route('/<int:id>', methods=['DELETE'])
def delete_playlist(id):
    playlist = Playlist.query.get(id)
    if not playlist:
        return jsonify({'error': 'Playlist not found'}), 404

    name = playlist.name
    user_id = playlist.user_id
    db.session.delete(playlist)
    db.session.commit()

    log_action(
        user_id=user_id,
        action="DELETE_PLAYLIST",
        target_type="Playlist",
        target_id=id,
        details=f"Deleted playlist: {name}"
    )
    return jsonify({'message': 'Playlist deleted successfully'}), 200
