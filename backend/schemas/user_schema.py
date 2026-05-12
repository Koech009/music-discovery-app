from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, fields, validate
# Handle importation of the user model after here.

class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = 'User' 
        # Convert user back to object after importing the User model.
        load_instance = True

    # Validations
    username = fields.Str(validate = validate.Range(3,50))
    email = fields.Email(required = True) 
    password = fields.String(required = True, validate = validate.Length(min=6), dump_only = True)
    role = fields.String(validate = validate.OneOf(["user", "admin"]))