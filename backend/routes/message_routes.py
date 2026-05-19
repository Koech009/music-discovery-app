from flask import Blueprint, request, jsonify
from extensions import db
from models.message import Message
from schemas.message_schema import message_schema, messages_schema
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

message_bp = Blueprint("messages", __name__)

# Get all messages (admin) — optionally filter by email


@message_bp.route("", methods=["GET"])
def get_messages():
    email = request.args.get("email")
    query = Message.query
    if email:
        query = query.filter_by(email=email)
    return messages_schema.jsonify(query.all()), 200


# GET route with pagination providing query parameters
@message_bp.route('', methods=['GET'])
@jwt_required()
def get_messages_by_pagination():
    query = Message.query
    
    email = request.args.get("email")
    if email:
        query = query.filter_by(email=email)
        
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)
    
    pagination = query.paginate(
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
        'messages': messages_schema.dump(pagination.items)
    }), 200

# Get a single message by ID


@message_bp.route("/<int:id>", methods=["GET"])
def get_message(id):
    msg = Message.query.get(id)
    if not msg:
        return jsonify({"error": "Message not found"}), 404
    return message_schema.jsonify(msg), 200

# Create a new message (Contact form)


@message_bp.route("", methods=["POST"])
def create_message():
    data = request.get_json()
    try:
        new_msg = message_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400
    db.session.add(new_msg)
    db.session.commit()
    return message_schema.jsonify(new_msg), 201


# Update a message ( mark as read)
@message_bp.route("/<int:id>", methods=["PATCH"])
def update_message(id):
    msg = Message.query.get(id)
    if not msg:
        return jsonify({"error": "Message not found"}), 404

    data = request.get_json()
    if "is_read" in data:
        msg.is_read = data["is_read"]

    db.session.commit()
    return message_schema.jsonify(msg), 200

# Delete a message (admin only)


@message_bp.route("/<int:id>", methods=["DELETE"])
def delete_message(id):
    msg = Message.query.get(id)
    if not msg:
        return jsonify({"error": "Message not found"}), 404
    db.session.delete(msg)
    db.session.commit()
    return jsonify({"message": "Message deleted"}), 200
