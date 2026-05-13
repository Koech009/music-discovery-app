from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, fields, validate
from song_schema import SongSchema
# Handle importation of the playlist model after here.
from ..routes.playlist_routes import Playlist

class PlaylistSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Playlist
        # Convert user back to object after importing the Playlist model.
        load_instance = True
        include_fk = True 
        # Determines whether foreign key fields are included in the serialized output.

    # Validations
    name = fields.String(required = True, validate = validate.Length(min =1, max = 100))
    user_id = fields.Int(required=True)
    songs = fields.List(
        fields.Nested(SongSchema)
    )
