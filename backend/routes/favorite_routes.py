from flask import Blueprint, request, jsonify
from extensions import db
from models.favorite import Favorite
from schemas.favorite_schema import favorite_schema, favorites_schema
from marshmallow import ValidationError
from routes.audit_routes import log_action

favorite_bp = Blueprint("favorites", __name__)


@favorite_bp.route("", methods=["GET"])
def get_user_favorites():
    user_id = request.args.get('userId', type=int)
    if not user_id:
        return jsonify({"error": "userId is required"}), 400
    favorites = Favorite.query.filter_by(user_id=user_id).all()
    return favorites_schema.jsonify(favorites), 200


@favorite_bp.route("", methods=["POST"])
def add_favorite():
    data = request.get_json()
    try:
        new_fav = favorite_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    already_exists = Favorite.query.filter_by(
        user_id=new_fav.user_id,
        isrc=new_fav.isrc
    ).first()
    if already_exists:
        return jsonify({"error": "Song is already in favorites"}), 409

    db.session.add(new_fav)
    db.session.flush()

    log_action(
        user_id=new_fav.user_id,
        action="ADD_FAVOURITE",
        target_type="Favorite",
        target_id=new_fav.id,
        details=f"Added song to favourites: {new_fav.title} by {new_fav.artist_name}"
    )

    db.session.commit()
    return favorite_schema.jsonify(new_fav), 201


@favorite_bp.route("/<int:favorite_id>", methods=["DELETE"])
def remove_favorite(favorite_id):
    fav = Favorite.query.get(favorite_id)
    if not fav:
        return jsonify({"error": "Favorite not found"}), 404

    user_id = fav.user_id
    title = fav.title
    artist_name = fav.artist_name

    db.session.delete(fav)

    log_action(
        user_id=user_id,
        action="REMOVE_FAVOURITE",
        target_type="Favorite",
        target_id=favorite_id,
        details=f"Removed song from favourites: {title} by {artist_name}"
    )

    db.session.commit()
    return jsonify({"message": "Song removed from favorites"}), 200
