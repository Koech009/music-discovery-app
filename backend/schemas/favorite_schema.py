from flask_marshmallow import Marshmallow
from marshmallow import validates, ValidationError, fields, validate, pre_load, post_dump, EXCLUDE
from models.favorite import Favorite
from extensions import db

ma = Marshmallow()


class FavoriteSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Favorite
        load_instance = True
        sqla_session = db.session
        include_fk = True
        unknown = EXCLUDE

    # Read-only fields
    id = ma.auto_field(dump_only=True)
    added_at = ma.auto_field(dump_only=True)

    # user_id set by backend from JWT — not required on input
    user_id = fields.Integer(load_default=None, data_key='userId')

    # Required fields
    title = fields.String(required=True, validate=validate.Length(min=1, max=255))
    artist_name = fields.String(required=True, validate=validate.Length(min=1, max=255))

    # Optional fields
    album_title = fields.String(validate=validate.Length(max=255))
    album_cover = fields.String(validate=validate.Length(max=500))
    preview_url = fields.String(validate=validate.Length(max=500))
    isrc = fields.String(validate=validate.Length(max=50))
    genre = fields.String(load_default='Unknown')

    @pre_load
    def normalize_fields(self, data, **kwargs):
        if 'artist' in data and isinstance(data['artist'], dict):
            data['artist_name'] = data['artist'].get('name', '')
        if 'album' in data and isinstance(data['album'], dict):
            data['album_title'] = data['album'].get('title', '')
            data['album_cover'] = data['album'].get('cover_small', '')
        if 'preview' in data and 'preview_url' not in data:
            data['preview_url'] = data['preview']
        return data

    @post_dump
    def nest_fields(self, data, **kwargs):
        return {
            'id': data.get('id'),
            'userId': data.get('userId'),
            'title': data.get('title'),
            'artist': {'name': data.get('artist_name')},
            'album': {
                'title': data.get('album_title'),
                'cover_small': data.get('album_cover')
            },
            'preview': data.get('preview_url'),
            'isrc': data.get('isrc'),
            'genre': data.get('genre'),
            'addedAt': data.get('added_at')
        }

    @validates('user_id')
    def validate_user_id(self, value):
        if value is not None and value <= 0:
            raise ValidationError("Invalid user ID.")

    @validates('preview_url')
    def validate_preview_url(self, value):
        if value and not value.startswith('http'):
            raise ValidationError("Preview URL must be a valid URL.")

    @validates('album_cover')
    def validate_album_cover(self, value):
        if value and not value.startswith('http'):
            raise ValidationError("Album cover must be a valid URL.")


favorite_schema = FavoriteSchema()
favorites_schema = FavoriteSchema(many=True)