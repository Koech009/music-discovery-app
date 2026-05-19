from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from schemas.user_schema import user_schema, users_schema
from marshmallow import ValidationError
from datetime import datetime
from routes.audit_routes import log_action

user_bp = Blueprint('users', __name__)


# GET all users
@user_bp.route('', methods=['GET'])
def get_users():
    users = User.query.all()
    return users_schema.jsonify(users), 200


# GET single user by id
@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return user_schema.jsonify(user), 200


# POST create new user
@user_bp.route('', methods=['POST'])
def create_user():
    data = request.get_json()
    try:
        new_user = user_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    new_user.password = data.get('password')

    if User.query.filter_by(email=new_user.email).first():
        return jsonify({'error': 'Email already exists'}), 409
    if User.query.filter_by(username=new_user.username).first():
        return jsonify({'error': 'Username already taken'}), 409

    db.session.add(new_user)
    db.session.commit()
    return user_schema.jsonify(new_user), 201


# PATCH update user profile
@user_bp.route('/<int:user_id>', methods=['PATCH'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    actor_id = data.get('actorId', user_id)

    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'bio' in data:
        user.bio = data['bio']
    if 'address' in data:
        user.address = data['address']
    if 'phone' in data:
        user.phone = data['phone']
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
    if 'last_login' in data:
        user.last_login = datetime.fromisoformat(data['last_login'])

    if 'role' in data and data['role'] in ['user', 'admin']:
        old_role = user.role
        user.role = data['role']
        log_action(
            user_id=actor_id,
            action="CHANGE_ROLE",
            target_type="User",
            target_id=user_id,
            details=f"Changed {user.username}'s role from {old_role} to {data['role']}"
        )

    if 'suspended' in data:
        user.suspended = data['suspended']
        action = "SUSPEND_USER" if data['suspended'] else "UNSUSPEND_USER"
        log_action(
            user_id=actor_id,
            action=action,
            target_type="User",
            target_id=user_id,
            details=f"{action.lower().replace('_', ' ')}: {user.username}"
        )

    if 'role' not in data and 'suspended' not in data:
        log_action(
            user_id=actor_id,
            action="UPDATE_PROFILE",
            target_type="User",
            target_id=user_id,
            details=f"{user.username} updated their profile"
        )

    user.first_login = False

    # FIX: single commit saves all field changes + audit log atomically
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Update failed', 'details': str(e)}), 500

    return user_schema.jsonify(user), 200


# PATCH change password
@user_bp.route('/<int:user_id>/change-password', methods=['PATCH'])
def change_password(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not new_password:
        return jsonify({'error': 'New password is required.'}), 400

    if old_password is not None:
        if user.password != old_password:
            return jsonify({'error': 'Old password is incorrect.'}), 400

    user.password = new_password

    # FIX: log before commit
    log_action(
        user_id=user_id,
        action="CHANGE_PASSWORD",
        target_type="User",
        target_id=user_id,
        details=f"{user.username} changed their password"
    )

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Password change failed', 'details': str(e)}), 500

    return jsonify({'message': 'Password updated successfully'}), 200


# DELETE user
@user_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    username = user.username
    actor_id = request.get_json(silent=True) or {}
    actor_id = actor_id.get('actorId', user_id)

    # FIX: log before delete+commit — user.id still valid here
    log_action(
        user_id=actor_id,
        action="DELETE_ACCOUNT",
        target_type="User",
        target_id=user_id,
        details=f"User account deleted: {username}"
    )

    db.session.delete(user)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Delete failed', 'details': str(e)}), 500

    return jsonify({'message': 'User deleted successfully'}), 200
