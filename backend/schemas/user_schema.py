from flask_marshmallow import Marshmallow
from marshmallow import validates, ValidationError, fields, validate, EXCLUDE
from models.user import User
from extensions import db
import re

ma = Marshmallow()


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        sqla_session = db.session
        exclude = ('password',)
        unknown = EXCLUDE

    # Read-only fields
    id = ma.auto_field(dump_only=True)
    created_at = ma.auto_field(dump_only=True)
    last_login = ma.auto_field(dump_only=True)

    # Required fields
    username = fields.String(
        required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    # accepted on input, never returned
    password = fields.String(required=True, load_only=True)
    role = fields.String(validate=validate.OneOf(
        ["user", "admin"]), load_default="user")

    # Optional fields
    bio = fields.String(validate=validate.Length(max=500))
    avatar_url = fields.String(validate=validate.Length(max=255))
    address = fields.String(validate=validate.Length(min=5, max=255))
    phone = fields.String()
    suspended = fields.Boolean(load_default=False)
    first_login = fields.Boolean(load_default=True)

    @validates('username')
    def validate_username(self, value):
        if ' ' in value:
            raise ValidationError("Username cannot contain spaces.")

    @validates('password')
    def validate_password(self, value):
        if len(value) < 8:
            raise ValidationError("Password must be at least 8 characters.")
        if not re.search(r'[A-Z]', value):
            raise ValidationError(
                "Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise ValidationError(
                "Password must contain at least one lowercase letter.")
        if not re.search(r'[0-9]', value):
            raise ValidationError("Password must contain at least one number.")
        if not re.search(r'[!@#$%^&*]', value):
            raise ValidationError(
                "Password must contain at least one special character (!@#$%^&*).")

    @validates('phone')
    def validate_phone(self, value):
        if value and not re.match(r'^\+?\d{7,15}$', value):
            raise ValidationError("Phone must be digits, 7-15 characters.")


# Instances
user_schema = UserSchema()
users_schema = UserSchema(many=True)
