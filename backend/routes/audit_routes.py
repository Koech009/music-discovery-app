from flask import Blueprint, jsonify, request
from extensions import db
from models.audit_log import AuditLog
from schemas.audit_log_schema import audit_list_schema

audit_bp = Blueprint("audit", __name__, url_prefix="/api/admin/audit")


def log_action(user_id, action, target_type=None, target_id=None, details=None):
    """Called internally by routes to record actions automatically."""
    try:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details
        )
        db.session.add(entry)
        # No commit here — calling route commits everything atomically
    except Exception as e:
        print(f"[AuditLog Error] Failed to log '{action}': {e}")


@audit_bp.route("/", methods=["GET"])
def get_logs():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pagination = (
        AuditLog.query
        .order_by(AuditLog.timestamp.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return jsonify({
        "logs": audit_list_schema.dump(pagination.items),
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "per_page": per_page,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev
    }), 200


@audit_bp.route("/user/<int:user_id>", methods=["GET"])
def get_logs_by_user(user_id):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pagination = (
        AuditLog.query
        .filter_by(user_id=user_id)
        .order_by(AuditLog.timestamp.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return jsonify({
        "logs": audit_list_schema.dump(pagination.items),
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "per_page": per_page,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev
    }), 200
