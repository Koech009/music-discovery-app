from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.favorite import Favorite
from models.audit_log import AuditLog
from schemas.favorite_schema import favorite_schema, favorites_schema
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

favorite_bp = Blueprint("favorites", __name__)


def log_audit(user_id, action, target_id, details):
    db.session.add(AuditLog(
        user_id=user_id,
        action=action,
        target_type="Favorite",
        target_id=target_id,
        details=details
    ))


# ── GET /api/favorites ────────────────────────────────────────────────────────

@favorite_bp.route("", methods=["GET"])
@jwt_required()
def get_user_favorites():
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()

    if claims.get("role") == "admin":
        user_id = request.args.get("userId", type=int) or current_user_id
    else:
        user_id = current_user_id

   
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)
 
    pagination = Favorite.query.filter_by(user_id=user_id).paginate(
        page=page, 
        per_page=limit, 
        error_out=False
    )
    
    return jsonify({
        'success': True,
        'metadata': {
            'total_items': pagination.total,
            'total_pages': pagination.pages,
            'current_page': pagination.page,
            'limit': pagination.per_page,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        },
        'favorites': favorites_schema.dump(pagination.items)
    }), 200

# ── POST /api/favorites ───────────────────────────────────────────────────────

@favorite_bp.route("", methods=["POST"])
@jwt_required()
def add_favorite():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    print("FAVORITE DATA:", data)

    try:
        new_fav = favorite_schema.load(data)
    except ValidationError as err:
        print("FAVORITE ERRORS:", err.messages)
        return jsonify({"errors": err.messages}), 400

    new_fav.user_id = current_user_id

    # Duplicate check: ISRC first, then fallback to title + artist
    exists = None
    if new_fav.isrc:
        exists = Favorite.query.filter_by(
            user_id=current_user_id, isrc=new_fav.isrc
        ).first()
    if not exists:
        exists = Favorite.query.filter_by(
            user_id=current_user_id,
            title=new_fav.title,
            artist_name=new_fav.artist_name
        ).first()

    if exists:
        return jsonify({"error": "Song is already in favorites"}), 409

    db.session.add(new_fav)
    db.session.flush()

    log_audit(
        current_user_id, "ADD_FAVOURITE", new_fav.id,
        f"Added to favourites: {new_fav.title} by {new_fav.artist_name}"
    )

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Could not add favorite", "details": str(e)}), 500

    return jsonify({"favorite": favorite_schema.dump(new_fav)}), 201


# ── DELETE /api/favorites/<id> ────────────────────────────────────────────────

@favorite_bp.route("/<int:favorite_id>", methods=["DELETE"])
@jwt_required()
def remove_favorite(favorite_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()

    fav = Favorite.query.get(favorite_id)
    if not fav:
        return jsonify({"error": "Favorite not found"}), 404

    if fav.user_id != current_user_id and claims.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    log_audit(
        current_user_id, "REMOVE_FAVOURITE", favorite_id,
        f"Removed from favourites: {fav.title} by {fav.artist_name}"
    )
    db.session.delete(fav)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Could not remove favorite", "details": str(e)}), 500

    return jsonify({"message": "Song removed from favorites"}), 200