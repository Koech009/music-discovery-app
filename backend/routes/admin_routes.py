from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from schemas.user_schema import user_schema, users_schema
from datetime import datetime

admin_bp = Blueprint('admin', __name__)


# GET all users
@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return users_schema.jsonify(users), 200


# PATCH suspend/unsuspend user
@admin_bp.route('/users/<int:user_id>/suspend', methods=['PATCH'])
def toggle_suspend(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.suspended = not user.suspended
    db.session.commit()
    status = "suspended" if user.suspended else "unsuspended"
    return jsonify({'message': f'{user.username} has been {status}'}), 200


# PATCH promote user to admin
@admin_bp.route('/users/<int:user_id>/promote', methods=['PATCH'])
def promote_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.role = 'admin'
    db.session.commit()
    return jsonify({'message': f'{user.username} promoted to admin'}), 200


# DELETE user
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200
