from flask import Blueprint, request, jsonify
from extensions import db
from models.favorite import Favorite
from schemas.favorite_schema import favorite_schema, favorites_schema
from marshmallow import ValidationError

favorite_bp = Blueprint("favorites", __name__)

# Get all favorites for a specific user
# Frontend: GET /favorites?userId=1


@favorite_bp.route("", methods=["GET"])
def get_user_favorites():
    user_id = request.args.get('userId', type=int)
    if not user_id:
        return jsonify({"error": "userId is required"}), 400
    favorites = Favorite.query.filter_by(user_id=user_id).all()
    return favorites_schema.jsonify(favorites), 200

# Add a new favorite
# Frontend: POST /favorites { ...song, userId, genre, addedAt }


@favorite_bp.route("", methods=["POST"])
def add_favorite():
    data = request.get_json()
    try:
        new_fav = favorite_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    # Prevent duplicates
    already_exists = Favorite.query.filter_by(
        user_id=new_fav.user_id,
        isrc=new_fav.isrc
    ).first()
    if already_exists:
        return jsonify({"error": "Song is already in favorites"}), 409

    db.session.add(new_fav)
    db.session.commit()
    return favorite_schema.jsonify(new_fav), 201

# Remove a favorite
# Frontend: DELETE /favorites/:id


@favorite_bp.route("/<int:favorite_id>", methods=["DELETE"])
def remove_favorite(favorite_id):
    fav = Favorite.query.get(favorite_id)
    if not fav:
        return jsonify({"error": "Favorite not found"}), 404
    db.session.delete(fav)
    db.session.commit()
    return jsonify({"message": "Song removed from favorites"}), 200
