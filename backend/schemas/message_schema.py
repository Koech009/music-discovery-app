from flask_marshmallow import Marshmallow
from marshmallow import validates, ValidationError, fields, validate, pre_load, EXCLUDE
from models.message import Message
from extensions import db

ma = Marshmallow()


class MessageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Message
        load_instance = True
        sqla_session = db.session
        unknown = EXCLUDE

    # Read-only fields (dump only)
    id = ma.auto_field(dump_only=True)
    created_at = ma.auto_field(dump_only=True)
    is_read = ma.auto_field(dump_only=True)

    # Required fields (load)
    name = fields.String(
        required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    content = fields.String(
        required=True, validate=validate.Length(min=10, max=1000))

    # camelCase aliases for frontend
    isRead = fields.Boolean(attribute="is_read", dump_only=True)
    createdAt = fields.DateTime(attribute="created_at", dump_only=True)
    message = fields.String(attribute="content", dump_only=True)

    @pre_load
    def normalize_fields(self, data, **kwargs):
        # frontend sends 'message', backend stores as 'content'
        if 'message' in data and 'content' not in data:
            data['content'] = data.pop('message')
        # strip whitespace
        for field in ["name", "email", "content"]:
            if field in data and isinstance(data[field], str):
                data[field] = data[field].strip()
        return data

    @validates('name')
    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise ValidationError("Name must be at least 2 characters.")

    @validates('content')
    def validate_content(self, value):
        if len(value.strip()) < 10:
            raise ValidationError("Message must be at least 10 characters.")


# Instances
message_schema = MessageSchema()
messages_schema = MessageSchema(many=True)
