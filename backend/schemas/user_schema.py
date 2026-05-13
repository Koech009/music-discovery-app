from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, fields, validate
# Handle importation of the user model after here.
from ..routes.user_routes import User

class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        # Convert user back to object after importing the User model.
        load_instance = True

    # Validations
    username = fields.Str(validate = validate.Length(min=3,max=50))
    email = fields.Email(required = True) 
    password = fields.String(required = True, validate = validate.Length(min=6), load_only = True)
    role = fields.String(validate = validate.OneOf(["user", "admin"]))

class UserPublicSchema(UserSchema):
    class Meta(UserSchema.Meta):
        exclude = ("password")