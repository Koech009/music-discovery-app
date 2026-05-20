from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from extensions import db
from models.audit_log import AuditLog
from schemas.audit_log_schema import audit_list_schema

audit_bp = Blueprint("audit", __name__)


# ── Internal Helper (imported by other routes) ────────────────────────────────

def log_action(user_id, action, target_type=None, target_id=None, details=None):
    """
    Called internally by other routes to record actions atomically.
    No commit here — the calling route commits everything in one transaction.
    """
    try:
        db.session.add(AuditLog(
            user_id=user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details
        ))
    except Exception as e:
        print(f"[AuditLog Error] Failed to log '{action}': {e}")


# ── Helpers ───────────────────────────────────────────────────────────────────

def require_admin():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({'error': 'Admin access required'}), 403
    return None


def paginate_query(query):
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get(
        "per_page", 20, type=int), 100)  # cap at 100

    pagination = query.order_by(AuditLog.timestamp.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return {
        "logs": audit_list_schema.dump(pagination.items),
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "per_page": per_page,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev
    }


# ── GET /api/admin/audit/ ─────────────────────────────────────────────────────

@audit_bp.route("/", methods=["GET"])
@jwt_required()
def get_logs():
    err = require_admin()
    if err:
        return err

    return jsonify(paginate_query(AuditLog.query)), 200


# ── GET /api/admin/audit/user/<id> ────────────────────────────────────────────

@audit_bp.route("/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_logs_by_user(user_id):
    err = require_admin()
    if err:
        return err

    return jsonify(paginate_query(AuditLog.query.filter_by(user_id=user_id))), 200


# ── GET /api/admin/audit/action/<action> ──────────────────────────────────────

@audit_bp.route("/action/<string:action>", methods=["GET"])
@jwt_required()
def get_logs_by_action(action):
    err = require_admin()
    if err:
        return err

    return jsonify(paginate_query(AuditLog.query.filter_by(action=action.upper()))), 200
