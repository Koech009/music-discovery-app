from flask import Blueprint, request, jsonify
from models import db
from models.favorite import Favorite

favorite_bp = Blueprint('favorites', __name__)


#Thus returns the favorites of a specific user
@favorite_bp.route('/<int:user_id>', methods=['GET'])
def get_user_favorites(user_id):
    favorites = Favorite.query.filter_by(user_id=user_id).all()

    favorites_list = []
    for fav in favorites:
        favorites_list.append({
            'id': fav.id,
            'user_id': fav.user_id,
            'song_id': fav.song_id
        })

    return jsonify(favorites_list), 200


@favorite_bp.route('', methods=['POST'])
def add_favorite():
    data = request.get_json()

    if not data.get('user_id') or not data.get('song_id'):
        return jsonify({'error': 'user_id and song_id are required'}), 400

    already_exists = Favorite.query.filter_by(
        user_id=data['user_id'],
        song_id=data['song_id']
    ).first()

    if already_exists:
        return jsonify({'error': 'Song is already in favorites'}), 400

    new_favorite = Favorite(
        user_id=data['user_id'],
        song_id=data['song_id']
    )

    db.session.add(new_favorite)
    db.session.commit()

    return jsonify({'message': 'Song added to favorites', 'favorite_id': new_favorite.id}), 201



# This removes a song from a user favorite
@favorite_bp.route('/<int:favorite_id>', methods=['DELETE'])
def remove_favorite(favorite_id):
    favorite = Favorite.query.get(favorite_id)

    if not favorite:
        return jsonify({'error': 'Favorite not found'}), 404

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({'message': 'Song removed from favorites'}), 200