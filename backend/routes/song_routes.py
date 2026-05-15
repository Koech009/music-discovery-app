from flask import Blueprint, request, jsonify
from models import db
from models.song import Song

song_bp = Blueprint('songs', __name__)

# Returns all songs inside a specific playlist
@song_bp.route('/playlist/<int:playlist_id>', methods=['GET'])
def get_songs_in_playlist(playlist_id):
    songs = Song.query.filter_by(playlist_id=playlist_id).all()

    songs_list = []
    for song in songs:
        songs_list.append({
            'id': song.id,
            'title': song.title,
            'artist': song.artist,
            'api_id': song.api_id,
            'playlist_id': song.playlist_id
        })

    return jsonify(songs_list), 200


# Adds a song to a playlist
@song_bp.route('', methods=['POST'])
def add_song():
    data = request.get_json()

    if not data.get('title') or not data.get('artist') or not data.get('playlist_id'):
        return jsonify({'error': 'Title, artist, and playlist_id are required'}), 400

    new_song = Song(
        title=data['title'],
        artist=data['artist'],
        api_id=data.get('api_id'),       
        playlist_id=data['playlist_id']
    )

    db.session.add(new_song)
    db.session.commit()

    return jsonify({'message': 'Song added to playlist', 'song_id': new_song.id}), 201


# Removes a song from a playlist
@song_bp.route('/<int:song_id>', methods=['DELETE'])
def delete_song(song_id):
    song = Song.query.get(song_id)

    if not song:
        return jsonify({'error': 'Song not found'}), 404

    db.session.delete(song)
    db.session.commit()

    return jsonify({'message': 'Song removed from playlist'}), 200