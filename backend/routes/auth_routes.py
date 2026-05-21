from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from extensions import db, token_blocklist
from models.user import User
from models.audit_log import AuditLog
from marshmallow import ValidationError
from schemas.user_schema import user_schema

auth_bp = Blueprint('auth', __name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_tokens(user):
    """
    Generate access + refresh token pair with role baked in.
    Always pass the full user object so role is current.
    """
    identity = str(user.id)
    claims = {"role": user.role}
    return (
        create_access_token(identity=identity, additional_claims=claims),
        create_refresh_token(identity=identity, additional_claims=claims)
    )


def log_audit(user_id, action, details):
    db.session.add(AuditLog(
        user_id=user_id,
        action=action,
        target_type="User",
        target_id=user_id,
        details=details
    ))


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    print("RECEIVED DATA:", data)

    try:
        new_user = user_schema.load(data)  # @post_load handles hashing
    except ValidationError as err:
        print("VALIDATION ERRORS:", err.messages)
        return jsonify({'errors': err.messages}), 400

    if User.query.filter_by(email=new_user.email).first():
        return jsonify({'error': 'Email already registered'}), 409
    if User.query.filter_by(username=new_user.username).first():
        return jsonify({'error': 'Username already taken'}), 409

    if new_user.role not in ('admin', 'user'):
        return jsonify({'error': 'Invalid role'}), 400

    new_user.approved = new_user.role == 'user'

    db.session.add(new_user)
    db.session.flush()

    log_audit(new_user.id, "SIGNUP",
              f"New {new_user.role} account created: {new_user.username}")

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

    access_token, refresh_token = make_tokens(new_user)

    return jsonify({
        'message': 'Account created successfully.',
        'user': user_schema.dump(new_user),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201
# ── POST /api/auth/login ──────────────────────────────────────────────────────


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    # Vague message prevents user enumeration
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if user.suspended:
        return jsonify({'error': 'Account is suspended'}), 403

    if user.role == 'admin' and not user.approved:
        return jsonify({'error': 'Your admin account is pending approval'}), 403

    user.update_last_login()
    log_audit(user.id, "LOGIN", f"{user.username} logged in")

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

    access_token, refresh_token = make_tokens(user)

    return jsonify({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


# ── POST /api/auth/refresh ────────────────────────────────────────────────────

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.suspended:
        return jsonify({'error': 'Account is suspended'}), 403

    access_token, refresh_token = make_tokens(user)

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


# ── POST /api/auth/logout ─────────────────────────────────────────────────────

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    token_blocklist.add(jti)

    user_id = int(get_jwt_identity())
    log_audit(user_id, "LOGOUT", f"User {user_id} logged out")

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Logout failed', 'details': str(e)}), 500

    return jsonify({'message': 'Logged out successfully'}), 200


# ── GET /api/auth/me ──────────────────────────────────────────────────────────

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict(include_profile=True)}), 200
