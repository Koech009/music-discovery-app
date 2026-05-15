from flask import Blueprint, request, jsonify
from models import db
from models.user import User

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    users = User.query.all()

    users_list = []
    for user in users:
        users_list.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'created_at': user.created_at
        })

    return jsonify(users_list), 200

@admin_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()

    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Username, email, and password are required'}), 400


    existing = User.query.filter_by(email=data['email']).first()
    if existing:
        return jsonify({'error': 'Email is already registered'}), 400

    new_user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],   
        role=data.get('role', 'user')
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully', 'user_id': new_user.id}), 201


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()


    if 'username' in data:
        user.username = data['username']

    if 'email' in data:
        user.email = data['email']

    if 'role' in data:
        user.role = data['role']   

    if 'password' in data:
        user.password = data['password']

    db.session.commit()

    return jsonify({'message': 'User updated successfully'}), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User deleted successfully'}), 200



@admin_bp.route('/users/<int:user_id>/promote', methods=['PUT'])
def promote_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.role = 'admin'
    db.session.commit()

    return jsonify({'message': f'{user.username} has been promoted to admin'}), 200