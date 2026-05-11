from flask import Flask
from flask_cors import CORS
from config import Config
from models import db, migrate

# Import all models so Alembic detects them
from models.user import User
from models.playlist import Playlist
from models.song import Song
from models.favorite import Favorite


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS
    CORS(app)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    from routes.auth_routes import auth_bp
    from routes.user_routes import user_bp
    from routes.admin_routes import admin_bp
    from routes.playlist_routes import playlist_bp
    from routes.song_routes import song_bp
    from routes.favorite_routes import favorite_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(playlist_bp, url_prefix='/api/playlists')
    app.register_blueprint(song_bp, url_prefix='/api/songs')
    app.register_blueprint(favorite_bp, url_prefix='/api/favorites')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
