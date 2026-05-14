from flask import Blueprint, request, jsonify
from models import db
from models.user import User

auth_bp = Blueprint('auth', __name__)

# Creates a new user account
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Username, email, and password are required'}), 400

    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email is already registered'}), 400

    new_user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],  
        role=data.get('role', 'user')
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Account created successfully', 'user_id': new_user.id}), 201

# This part Logs in an existing user
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Find a specific user by their email
    user = User.query.filter_by(email=data.get('email')).first()

    if not user or user.password != data.get('password'):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'first_login': user.first_login
        }
    }), 200