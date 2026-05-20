import os
import re
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from config import get_config
from extensions import db, migrate, bcrypt, jwt

load_dotenv()


def create_app(config=None):
    app = Flask(__name__)
    app.config.from_object(get_config())

    if config:
        app.config.update(config)

    # ── CORS ──────────────────────────────────────────────────────────────────
    raw_origins = os.getenv("ALLOWED_ORIGINS", "")
    env_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    flask_env = os.getenv("FLASK_ENV", "development")

    if flask_env == "development":
        class AnyLocalhost:
            """Allows any localhost or 127.0.0.1 on any port in dev."""
            def __contains__(self, origin):
                if not origin:
                    return False
                if re.match(r"https?://(localhost|127\.0\.0\.1)(:\d+)?$", origin):
                    return True
                return origin in env_origins
            def __iter__(self):
                return iter(env_origins)

        allowed_origins = AnyLocalhost()
    else:
        allowed_origins = env_origins

    CORS(app, resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    })

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        from models.user import User
        from models.playlist import Playlist
        from models.favorite import Favorite
        from models.message import Message
        from models.audit_log import AuditLog

    from routes.auth_routes import auth_bp
    from routes.user_routes import user_bp
    from routes.admin_routes import admin_bp
    from routes.playlist_routes import playlist_bp
    from routes.favorite_routes import favorite_bp
    from routes.message_routes import message_bp
    from routes.audit_routes import audit_bp

    app.register_blueprint(auth_bp,     url_prefix='/api/auth')
    app.register_blueprint(user_bp,     url_prefix='/api/users')
    app.register_blueprint(admin_bp,    url_prefix='/api/admin')
    app.register_blueprint(playlist_bp, url_prefix='/api/playlists')
    app.register_blueprint(favorite_bp, url_prefix='/api/favorites')
    app.register_blueprint(message_bp,  url_prefix='/api/messages')
    app.register_blueprint(audit_bp,    url_prefix='/api/admin/audit')

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return {"error": "Missing or invalid token"}, 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return {"error": "Token has expired"}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {"error": "Invalid token"}, 422

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(
        debug=os.getenv("FLASK_ENV", "development") == "development",
        port=int(os.getenv("PORT", 5000))
    )