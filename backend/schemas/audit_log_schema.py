from marshmallow import Schema, fields
from models.audit_log import AuditLog
from extensions import db


class AuditLogSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    action = fields.Str(dump_only=True)
    target_type = fields.Str(allow_none=True, dump_only=True)
    target_id = fields.Int(allow_none=True, dump_only=True)
    details = fields.Str(allow_none=True, dump_only=True)
    timestamp = fields.DateTime(dump_only=True)
    user = fields.Nested("UserSchema", only=(
        "id", "username", "email"), dump_only=True)


audit_schema = AuditLogSchema()
audit_list_schema = AuditLogSchema(many=True)
