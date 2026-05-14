from flask_marshmallow import Marshmallow
from marshmallow import fields, validate, validates, ValidationError, pre_load, EXCLUDE
from extensions import db
from models.playlist import Playlist

ma = Marshmallow()


class PlaylistSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Playlist
        load_instance = True
        sqla_session = db.session
        include_fk = True
        unknown = EXCLUDE

    id = ma.auto_field(dump_only=True)
    created_at = ma.auto_field(dump_only=True)

    user_id = fields.Int(required=True, data_key="userId")
    name = fields.String(
        required=True, validate=validate.Length(min=1, max=120))
    description = fields.String(
        load_default='', validate=validate.Length(max=500))
    songs = fields.List(fields.Dict(), load_default=list)

    @pre_load
    def strip_fields(self, data, **kwargs):
        for field in ["name", "description"]:
            if field in data and isinstance(data[field], str):
                data[field] = data[field].strip()
        return data

    @validates("name")
    def validate_name(self, value):
        if not value.strip():
            raise ValidationError("Playlist name cannot be empty.")

    @validates("user_id")
    def validate_user_id(self, value):
        if value <= 0:
            raise ValidationError("Invalid user ID.")


# Instances
playlist_schema = PlaylistSchema()
playlists_schema = PlaylistSchema(many=True)
