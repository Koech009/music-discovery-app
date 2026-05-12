from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, fields
from song_schema import SongSchema
# Handle importation of the favorite model after here.

class FavoriteSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = 'Favorite'
        # Change from string to Favorite model object.
        load_instance = True
        include_fk = True
    
    #Validations
    song_id = fields.Int(required = True)
    user_id = fields.Int(required = True)
    songs = fields.List(
        fields.Nested(SongSchema)
    )
