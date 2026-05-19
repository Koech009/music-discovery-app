from flask import Blueprint, request, jsonify
from extensions import db
from models.message import Message
from schemas.message_schema import message_schema, messages_schema
from marshmallow import ValidationError
from routes.audit_routes import log_action

message_bp = Blueprint("messages", __name__)

# Temporary actor ID until JWT is implemented
SYSTEM_ADMIN_ID = 1


# GET all messages
@message_bp.route("", methods=["GET"])
def get_messages():
    email = request.args.get("email")
    query = Message.query
    if email:
        query = query.filter_by(email=email)
    return messages_schema.jsonify(query.all()), 200


# GET single message by ID
@message_bp.route("/<int:id>", methods=["GET"])
def get_message(id):
    msg = Message.query.get(id)
    if not msg:
        return jsonify({"error": "Message not found"}), 404
    return message_schema.jsonify(msg), 200


# POST create a new message (contact form)
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


# PATCH mark message as read
@message_bp.route("/<int:id>", methods=["PATCH"])
def update_message(id):
    msg = Message.query.get(id)
    if not msg:
        return jsonify({"error": "Message not found"}), 404

    data = request.get_json()
    if "is_read" in data:
        msg.is_read = data["is_read"]

    db.session.commit()

    log_action(
        user_id=SYSTEM_ADMIN_ID,
        action="MARK_MESSAGE_READ",
        target_type="Message",
        target_id=msg.id,
        details=f"Message from {msg.email} marked as {'read' if msg.is_read else 'unread'}"
    )
    return message_schema.jsonify(msg), 200


# DELETE message
@message_bp.route("/<int:id>", methods=["DELETE"])
def delete_message(id):
    msg = Message.query.get(id)
    if not msg:
        return jsonify({"error": "Message not found"}), 404

    db.session.delete(msg)
    db.session.commit()

    log_action(
        user_id=SYSTEM_ADMIN_ID,
        action="DELETE_MESSAGE",
        target_type="Message",
        target_id=id,
        details=f"Deleted message from {msg.email}"
    )
    return jsonify({"message": "Message deleted"}), 200
