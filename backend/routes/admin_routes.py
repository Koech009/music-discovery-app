from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from schemas.user_schema import user_schema, users_schema
from routes.audit_routes import log_action

admin_bp = Blueprint('admin', __name__)

# Temporary actor ID until JWT is implemented by teammate
SYSTEM_ADMIN_ID = 1


# GET all users
@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return users_schema.jsonify(users), 200


# GET pending admins
@admin_bp.route('/admins/pending', methods=['GET'])
def get_pending_admins():
    pending = User.query.filter_by(role='admin', approved=False).all()
    return users_schema.jsonify(pending), 200


# PATCH approve admin
@admin_bp.route('/admins/<int:user_id>/approve', methods=['PATCH'])
def approve_admin(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.role != 'admin':
        return jsonify({'error': 'User is not an admin'}), 400
    if user.approved:
        return jsonify({'error': 'Admin already approved'}), 400

    user.approved = True
    db.session.commit()
    log_action(
        user_id=SYSTEM_ADMIN_ID,
        action="APPROVE_ADMIN",
        target_type="User",
        target_id=user.id,
        details=f"Approved admin account: {user.username}"
    )
    return user_schema.jsonify(user), 200


# DELETE reject/remove pending admin
@admin_bp.route('/admins/<int:user_id>/reject', methods=['DELETE'])
def reject_admin(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.role != 'admin':
        return jsonify({'error': 'User is not an admin'}), 400
    if user.approved:
        return jsonify({'error': 'Cannot reject an already approved admin'}), 400

    username = user.username
    db.session.delete(user)
    db.session.commit()
    log_action(
        user_id=SYSTEM_ADMIN_ID,
        action="REJECT_ADMIN",
        target_type="User",
        target_id=user_id,
        details=f"Rejected and removed admin account: {username}"
    )
    return jsonify({'message': f'{username} rejected and removed'}), 200


# PATCH suspend/unsuspend user
@admin_bp.route('/users/<int:user_id>/suspend', methods=['PATCH'])
def toggle_suspend(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.suspended = not user.suspended
    db.session.commit()
    action = "SUSPEND_USER" if user.suspended else "UNSUSPEND_USER"
    log_action(
        user_id=SYSTEM_ADMIN_ID,
        action=action,
        target_type="User",
        target_id=user.id,
        details=f"{action.lower().replace('_', ' ')}: {user.username}"
    )
    status = "suspended" if user.suspended else "unsuspended"
    return jsonify({'message': f'{user.username} has been {status}'}), 200


# PATCH promote user to admin
@admin_bp.route('/users/<int:user_id>/promote', methods=['PATCH'])
def promote_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.role == 'admin':
        return jsonify({'error': 'User is already an admin'}), 400

    user.role = 'admin'
    user.approved = False
    db.session.commit()
    log_action(
        user_id=SYSTEM_ADMIN_ID,
        action="PROMOTE_USER",
        target_type="User",
        target_id=user.id,
        details=f"Promoted {user.username} to admin, pending approval"
    )
    return user_schema.jsonify(user), 200


# DELETE user
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    username = user.username
    db.session.delete(user)
    db.session.commit()
    log_action(
        user_id=SYSTEM_ADMIN_ID,
        action="DELETE_USER",
        target_type="User",
        target_id=user_id,
        details=f"Deleted user account: {username}"
    )
    return jsonify({'message': 'User deleted successfully'}), 200
