from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models.user import User
from models.audit_log import AuditLog
from marshmallow import ValidationError
from schemas.user_schema import user_schema, users_schema

user_bp = Blueprint('users', __name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def log_audit(actor_id, action, target_id, details):
    entry = AuditLog(
        user_id=actor_id,
        action=action,
        target_type="User",
        target_id=target_id,
        details=details
    )
    db.session.add(entry)


def is_admin(claims):
    return claims.get("role") == "admin"


def get_user_or_404(user_id):
    user = User.query.get(user_id)
    if not user:
        return None, jsonify({'error': 'User not found'}), 404
    return user, None, None


# ── GET /api/users ────────────────────────────────────────────────────────────

@user_bp.route('', methods=['GET'])
@jwt_required()
def get_users():
    claims = get_jwt()
    if not is_admin(claims):
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.all()
    return jsonify({'users': users_schema.dump(users)}), 200


# ── GET /api/users/<id> ───────────────────────────────────────────────────────

@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()

    # Users can only fetch their own profile; admins can fetch anyone
    if current_user_id != user_id and not is_admin(claims):
        return jsonify({'error': 'Unauthorized'}), 403

    user, err, code = get_user_or_404(user_id)
    if err:
        return err, code

    return jsonify({'user': user.to_dict(include_profile=True)}), 200


# ── PATCH /api/users/<id> ─────────────────────────────────────────────────────

@user_bp.route('/<int:user_id>', methods=['PATCH'])
@jwt_required()
def update_user(user_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()

    if current_user_id != user_id and not is_admin(claims):
        return jsonify({'error': 'Unauthorized'}), 403

    user, err, code = get_user_or_404(user_id)
    if err:
        return err, code

    data = request.get_json()

    # Profile fields — any user can update their own
    for field in ('username', 'email', 'bio', 'address', 'phone', 'avatar_url'):
        if field in data:
            setattr(user, field, data[field])

    # Admin-only fields
    if 'role' in data:
        if not is_admin(claims):
            return jsonify({'error': 'Only admins can change roles'}), 403
        if data['role'] not in ('user', 'admin'):
            return jsonify({'error': 'Invalid role'}), 400
        old_role = user.role
        user.role = data['role']
        log_audit(
            current_user_id, "CHANGE_ROLE", user_id,
            f"Changed {user.username}'s role from {old_role} to {data['role']}"
        )

    if 'suspended' in data:
        if not is_admin(claims):
            return jsonify({'error': 'Only admins can suspend accounts'}), 403
        user.suspended = data['suspended']
        action = "SUSPEND_USER" if data['suspended'] else "UNSUSPEND_USER"
        log_audit(current_user_id, action, user_id,
                  f"{action}: {user.username}")

    if 'role' not in data and 'suspended' not in data:
        log_audit(
            current_user_id, "UPDATE_PROFILE", user_id,
            f"{user.username} updated their profile"
        )

    user.first_login = False

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Update failed', 'details': str(e)}), 500

    return jsonify({'user': user.to_dict()}), 200


# ── PATCH /api/users/<id>/change-password ─────────────────────────────────────

@user_bp.route('/<int:user_id>/change-password', methods=['PATCH'])
@jwt_required()
def change_password(user_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()

    if current_user_id != user_id and not is_admin(claims):
        return jsonify({'error': 'Unauthorized'}), 403

    user, err, code = get_user_or_404(user_id)
    if err:
        return err, code

    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not new_password:
        return jsonify({'error': 'New password is required'}), 400

    # Non-admins must verify their old password
    if not is_admin(claims):
        if not old_password:
            return jsonify({'error': 'Old password is required'}), 400
        if not user.check_password(old_password):
            return jsonify({'error': 'Old password is incorrect'}), 401

    user.password_hash = new_password
    log_audit(current_user_id, "CHANGE_PASSWORD", user_id,
              f"{user.username} changed their password")

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Password change failed', 'details': str(e)}), 500

    return jsonify({'message': 'Password updated successfully'}), 200


# ── DELETE /api/users/<id> ────────────────────────────────────────────────────

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()

    if current_user_id != user_id and not is_admin(claims):
        return jsonify({'error': 'Unauthorized'}), 403

    user, err, code = get_user_or_404(user_id)
    if err:
        return err, code

    log_audit(current_user_id, "DELETE_ACCOUNT", user_id,
              f"Account deleted: {user.username}")
    db.session.delete(user)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Delete failed', 'details': str(e)}), 500

    return jsonify({'message': 'User deleted successfully'}), 200
