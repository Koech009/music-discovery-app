from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, fields
# Handle importation of the song model after here.

class SongSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = 'Song'
        # Should fix this to be the Song model object.
        load_instances = True
        include_fk = True

    title = fields.String(required = True)
    artist = fields.String(required = True)
    api_id = fields.String(required = True)