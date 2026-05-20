from flask_jwt_extended import create_access_token, verify_jwt_in_request, get_jwt_identity
from functools import wraps
from flask import jsonify

def create_token(user_id, role):
    additional_claims = {"role": role}
    return create_access_token(identity=str(user_id), additional_claims=additional_claims)

def verify_token(token):
    try:
        verify_jwt_in_request()
        return get_jwt_identity()
    except Exception as e:
        return None