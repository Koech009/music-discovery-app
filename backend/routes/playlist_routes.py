from flask import Blueprint, request, jsonify
from models import db
from models.playlist import Playlist

playlist_bp = Blueprint('playlists', __name__)



#This Returns playlists
@playlist_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_playlists(user_id):
    playlists = Playlist.query.filter_by(user_id=user_id).all()

    playlists_list = []
    for playlist in playlists:
        playlists_list.append({
            'id': playlist.id,
            'name': playlist.name,
            'description': playlist.description,
            'user_id': playlist.user_id,
            'created_at': playlist.created_at
        })

    return jsonify(playlists_list), 200


#This Creates a new playlist
@playlist_bp.route('', methods=['POST'])
def create_playlist():
    data = request.get_json()

    if not data.get('name') or not data.get('user_id'):
        return jsonify({'error': 'Playlist name and user_id are required'}), 400

    new_playlist = Playlist(
        name=data['name'],
        description=data.get('description', ''), 
        user_id=data['user_id']
    )

    db.session.add(new_playlist)
    db.session.commit()

    return jsonify({'message': 'Playlist created successfully', 'playlist_id': new_playlist.id}), 201


@playlist_bp.route('/<int:playlist_id>', methods=['PUT'])
def update_playlist(playlist_id):
    playlist = Playlist.query.get(playlist_id)

    if not playlist:
        return jsonify({'error': 'Playlist not found'}), 404

    data = request.get_json()

    if 'name' in data:
        playlist.name = data['name']

    if 'description' in data:
        playlist.description = data['description']

    db.session.commit()

    return jsonify({'message': 'Playlist updated successfully'}), 200


# Delete a playlist
@playlist_bp.route('/<int:playlist_id>', methods=['DELETE'])
def delete_playlist(playlist_id):
    playlist = Playlist.query.get(playlist_id)

    if not playlist:
        return jsonify({'error': 'Playlist not found'}), 404

    db.session.delete(playlist)
    db.session.commit()

    return jsonify({'message': 'Playlist deleted successfully'}), 200