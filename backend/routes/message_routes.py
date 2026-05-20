from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.message import Message
from models.audit_log import AuditLog
from schemas.message_schema import message_schema, messages_schema
from marshmallow import ValidationError

message_bp = Blueprint("messages", __name__)


# ── Helper ────────────────────────────────────────────────────────────────────

def log_audit(actor_id, action, target_id, details):
    db.session.add(AuditLog(
        user_id=actor_id,
        action=action,
        target_type="Message",
        target_id=target_id,
        details=details
    ))


def require_admin():
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    return None


def get_message_or_404(msg_id):
    msg = Message.query.get(msg_id)
    if not msg:
        return None, (jsonify({"error": "Message not found"}), 404)
    return msg, None


# ── GET /api/messages ─────────────────────────────────────────────────────────

@message_bp.route("", methods=["GET"])
@jwt_required()
def get_messages():
    err = require_admin()
    if err:
        return err

    email = request.args.get("email")
    is_read = request.args.get("is_read")
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)

    query = Message.query

    if email:
        query = query.filter_by(email=email)
    if is_read is not None:
        query = query.filter_by(is_read=is_read.lower() == "true")

    pagination = query.order_by(Message.created_at.desc()).paginate(
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


# ── GET /api/messages/<id> ────────────────────────────────────────────────────

@message_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_message(id):
    err = require_admin()
    if err:
        return err

    msg, err = get_message_or_404(id)
    if err:
        return err

    return jsonify({"message": message_schema.dump(msg)}), 200


# ── POST /api/messages ────────────────────────────────────────────────────────

@message_bp.route("", methods=["POST"])
def create_message():
    # Public route — no JWT required (contact form)
    data = request.get_json()

    try:
        new_msg = message_schema.load(data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    db.session.add(new_msg)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Could not send message", "details": str(e)}), 500

    return jsonify({"message": "Message sent successfully"}), 201


# ── PATCH /api/messages/<id> ──────────────────────────────────────────────────

@message_bp.route("/<int:id>", methods=["PATCH"])
@jwt_required()
def update_message(id):
    err = require_admin()
    if err:
        return err

    msg, err = get_message_or_404(id)
    if err:
        return err

    data = request.get_json()
    if "is_read" not in data:
        return jsonify({"error": "is_read field is required"}), 400

    msg.is_read = bool(data["is_read"])
    actor_id = int(get_jwt_identity())

    log_audit(
        actor_id, "MARK_MESSAGE_READ", msg.id,
        f"Message from {msg.email} marked as {'read' if msg.is_read else 'unread'}"
    )

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Update failed", "details": str(e)}), 500

    return jsonify({"message": message_schema.dump(msg)}), 200


# ── DELETE /api/messages/<id> ─────────────────────────────────────────────────

@message_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_message(id):
    err = require_admin()
    if err:
        return err

    msg, err = get_message_or_404(id)
    if err:
        return err

    actor_id = int(get_jwt_identity())
    log_audit(actor_id, "DELETE_MESSAGE", id,
              f"Deleted message from {msg.email}")
    db.session.delete(msg)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Delete failed", "details": str(e)}), 500

    return jsonify({"message": "Message deleted successfully"}), 200