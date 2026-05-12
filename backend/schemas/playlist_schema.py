from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, fields, validate
# Handle importation of the playlist model after here.

class PlaylistSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = 'Playlist'
        # Convert user back to object after importing the Playlist model.
        load_instance = True
        include_fk = True 
        # Determines whether foreign key fields are included in the serialized output.

    # Validations
    name = fields.String(required = True, validate = validate.Range(min =1, max = 100))

