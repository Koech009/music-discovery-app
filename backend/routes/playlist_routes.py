from flask import Blueprint, request, jsonify
from extensions import db
from models.playlist import Playlist
from schemas.playlist_schema import playlist_schema, playlists_schema
from marshmallow import ValidationError

playlist_bp = Blueprint('playlists', __name__)




# GET all playlists for a user
# Frontend: GET /playlists?userId=1



@playlist_bp.route('', methods=['GET'])
def get_playlists():
    user_id = request.args.get('userId', type=int)
    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    playlists = Playlist.query.filter_by(user_id=user_id).all()
    return playlists_schema.jsonify(playlists), 200


# GET route with pagination providing query parameters
@playlist_bp.route('', methods=['GET'])
def get_playlists_by_pagination():
    pass


# GET single playlist by ID
# Frontend: GET /playlists/:id

@playlist_bp.route('/<int:id>', methods=['GET'])
def get_playlist(id):
    playlist = Playlist.query.get(id)
    if not playlist:
        return jsonify({'error': 'Playlist not found'}), 404
    return playlist_schema.jsonify(playlist), 200

# POST create playlist
# Frontend: POST /playlists { name, description, userId, songs: [] }


@playlist_bp.route('', methods=['POST'])
def create_playlist():
    data = request.get_json()
    try:
        new_playlist = playlist_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400
    db.session.add(new_playlist)
    db.session.commit()
    return playlist_schema.jsonify(new_playlist), 201

# PATCH update playlist (name, description, songs)
# Frontend: PATCH /playlists/:id { name?, description?, songs? }


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
    return playlist_schema.jsonify(playlist), 200

# DELETE playlist
# Frontend: DELETE /playlists/:id


@playlist_bp.route('/<int:id>', methods=['DELETE'])
def delete_playlist(id):
    playlist = Playlist.query.get(id)
    if not playlist:
        return jsonify({'error': 'Playlist not found'}), 404
    db.session.delete(playlist)
    db.session.commit()
    return jsonify({'message': 'Playlist deleted successfully'}), 200
