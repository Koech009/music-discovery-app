from flask import Blueprint, request, jsonify
from models import db
from models.user import User

user_bp = Blueprint('users', __name__)

# Returns a single user's profile
@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'first_login': user.first_login,
        'created_at': user.created_at
    }), 200

# Updates a user's profile 
@user_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    if 'username' in data:
        user.username = data['username']

    if 'email' in data:
        user.email = data['email']

    if 'password' in data:
        user.password = data['password']  

    user.first_login = False

    db.session.commit()

    return jsonify({'message': 'Profile updated successfully'}), 200