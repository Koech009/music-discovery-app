from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.user import User
from models.audit_log import AuditLog
from schemas.user_schema import user_schema, users_schema

admin_bp = Blueprint('admin', __name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def log_audit(actor_id, action, target_id, details):
    db.session.add(AuditLog(
        user_id=actor_id,
        action=action,
        target_type="User",
        target_id=target_id,
        details=details
    ))


def require_admin():
    """Returns (actor_id, error_response) — error is None if authorized."""
    claims = get_jwt()
    if claims.get("role") != "admin":
        return None, (jsonify({'error': 'Admin access required'}), 403)
    return int(get_jwt_identity()), None


def get_user_or_404(user_id):
    user = User.query.get(user_id)
    if not user:
        return None, (jsonify({'error': 'User not found'}), 404)
    return user, None


def commit_or_500():
    try:
        db.session.commit()
        return None
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500


# ── GET /api/admin/users ──────────────────────────────────────────────────────

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    actor_id, err = require_admin()
    if err:
        return err

    users = User.query.all()
    return jsonify({'users': users_schema.dump(users)}), 200


# ── GET /api/admin/admins/pending ─────────────────────────────────────────────

@admin_bp.route('/admins/pending', methods=['GET'])
@jwt_required()
def get_pending_admins():
    actor_id, err = require_admin()
    if err:
        return err

    pending = User.query.filter_by(role='admin', approved=False).all()
    return jsonify({'pending_admins': users_schema.dump(pending)}), 200


# ── PATCH /api/admin/admins/<id>/approve ──────────────────────────────────────

@admin_bp.route('/admins/<int:user_id>/approve', methods=['PATCH'])
@jwt_required()
def approve_admin(user_id):
    actor_id, err = require_admin()
    if err:
        return err

    user, err = get_user_or_404(user_id)
    if err:
        return err

    if user.role != 'admin':
        return jsonify({'error': 'User is not an admin'}), 400
    if user.approved:
        return jsonify({'error': 'Admin is already approved'}), 400

    user.approved = True
    log_audit(actor_id, "APPROVE_ADMIN", user_id,
              f"Approved admin account: {user.username}")

    err = commit_or_500()
    if err:
        return err

    return jsonify({'message': f'{user.username} approved', 'user': user_schema.dump(user)}), 200


# ── DELETE /api/admin/admins/<id>/reject ──────────────────────────────────────

@admin_bp.route('/admins/<int:user_id>/reject', methods=['DELETE'])
@jwt_required()
def reject_admin(user_id):
    actor_id, err = require_admin()
    if err:
        return err

    user, err = get_user_or_404(user_id)
    if err:
        return err

    if user.role != 'admin':
        return jsonify({'error': 'User is not an admin'}), 400
    if user.approved:
        return jsonify({'error': 'Cannot reject an already approved admin'}), 400

    username = user.username
    log_audit(actor_id, "REJECT_ADMIN", user_id,
              f"Rejected admin account: {username}")
    db.session.delete(user)

    err = commit_or_500()
    if err:
        return err

    return jsonify({'message': f'{username} rejected and removed'}), 200


# ── PATCH /api/admin/users/<id>/suspend ───────────────────────────────────────

@admin_bp.route('/users/<int:user_id>/suspend', methods=['PATCH'])
@jwt_required()
def toggle_suspend(user_id):
    actor_id, err = require_admin()
    if err:
        return err

    user, err = get_user_or_404(user_id)
    if err:
        return err

    # Prevent admins from suspending themselves
    if user_id == actor_id:
        return jsonify({'error': 'You cannot suspend your own account'}), 400

    user.suspended = not user.suspended
    action = "SUSPEND_USER" if user.suspended else "UNSUSPEND_USER"
    log_audit(actor_id, action, user_id, f"{action}: {user.username}")

    err = commit_or_500()
    if err:
        return err

    status = "suspended" if user.suspended else "unsuspended"
    return jsonify({'message': f'{user.username} has been {status}', 'user': user_schema.dump(user)}), 200


# ── PATCH /api/admin/users/<id>/promote ───────────────────────────────────────

@admin_bp.route('/users/<int:user_id>/promote', methods=['PATCH'])
@jwt_required()
def promote_user(user_id):
    actor_id, err = require_admin()
    if err:
        return err

    user, err = get_user_or_404(user_id)
    if err:
        return err

    if user.role == 'admin':
        return jsonify({'error': 'User is already an admin'}), 400

    user.role = 'admin'
    user.approved = False  # Promoted admins still require approval
    log_audit(actor_id, "PROMOTE_USER", user_id,
              f"Promoted {user.username} to admin, pending approval")

    err = commit_or_500()
    if err:
        return err

    return jsonify({'message': f'{user.username} promoted to admin, pending approval', 'user': user_schema.dump(user)}), 200


# ── DELETE /api/admin/users/<id> ──────────────────────────────────────────────

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    actor_id, err = require_admin()
    if err:
        return err

    user, err = get_user_or_404(user_id)
    if err:
        return err

    # Prevent admins from deleting themselves
    if user_id == actor_id:
        return jsonify({'error': 'You cannot delete your own account'}), 400

    username = user.username
    log_audit(actor_id, "DELETE_USER", user_id,
              f"Deleted user account: {username}")
    db.session.delete(user)

    err = commit_or_500()
    if err:
        return err

    return jsonify({'message': f'{username} deleted successfully'}), 200
