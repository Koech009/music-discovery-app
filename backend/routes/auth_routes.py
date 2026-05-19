from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from models.audit_log import AuditLog
from schemas.user_schema import user_schema
from marshmallow import ValidationError
from datetime import datetime

auth_bp = Blueprint('auth', __name__)


# POST signup
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    try:
        new_user = user_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    new_user.password = data.get('password')

    if User.query.filter_by(email=new_user.email).first():
        return jsonify({'error': 'Email already registered'}), 409
    if User.query.filter_by(username=new_user.username).first():
        return jsonify({'error': 'Username already taken'}), 409

    # Guard against invalid roles
    if new_user.role not in ['admin', 'user']:
        return jsonify({'error': 'Invalid role'}), 400

    # Explicit approval assignment — admins wait, users are immediate
    new_user.approved = False if new_user.role == 'admin' else True

    db.session.add(new_user)
    db.session.flush()  # Gets new_user.id without committing

    audit = AuditLog(
        user_id=new_user.id,
        action="SIGNUP",
        target_type="User",
        target_id=new_user.id,
        details=f"New {new_user.role} account created: {new_user.username}"
    )
    db.session.add(audit)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Could not create account', 'details': str(e)}), 500

    if new_user.role == 'admin':
        return jsonify({
            'message': 'Admin account created and pending approval.',
            'user': user_schema.dump(new_user)
        }), 201

    return user_schema.jsonify(new_user), 201


# POST login
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

    # Only admins are checked — users always pass through
    if user.role == 'admin' and user.approved is not True:
        return jsonify({'error': 'Your admin account is pending approval'}), 403

    user.last_login = datetime.utcnow()
    user.first_login = False

    audit = AuditLog(
        user_id=user.id,
        action="LOGIN",
        target_type="User",
        target_id=user.id,
        details=f"{user.username} logged in"
    )
    db.session.add(audit)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

    return user_schema.jsonify(user), 200
