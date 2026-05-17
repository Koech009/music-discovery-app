from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from schemas.user_schema import user_schema
from marshmallow import ValidationError
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

# POST signup
# Frontend: POST /api/auth/signup { username, email, password, role }


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    try:
        new_user = user_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    # Manually set password since it's excluded from schema mapping
    new_user.password = data.get('password')

    # Check duplicates
    if User.query.filter_by(email=new_user.email).first():
        return jsonify({'error': 'Email already registered'}), 409
    if User.query.filter_by(username=new_user.username).first():
        return jsonify({'error': 'Username already taken'}), 409

    db.session.add(new_user)
    db.session.commit()
    return user_schema.jsonify(new_user), 201


# POST login
# Frontend: POST /api/auth/login { email, password }
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').lower()
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or user.password != password:
        return jsonify({'error': 'Invalid email or password'}), 401

    if user.suspended:
        return jsonify({'error': 'Account is suspended'}), 403

    # Update last login
    user.last_login = datetime.utcnow()
    user.first_login = False
    db.session.commit()

    return user_schema.jsonify(user), 200
