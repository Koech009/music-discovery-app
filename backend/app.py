from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, migrate

from models.user import User
from models.playlist import Playlist
from models.favorite import Favorite
from models.message import Message


def create_app(config=None):
    app = Flask(__name__)
    app.config.from_object(Config)

    if config:
        app.config.update(config)

    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)

    from routes.auth_routes import auth_bp
    from routes.user_routes import user_bp
    from routes.admin_routes import admin_bp
    from routes.playlist_routes import playlist_bp
    from routes.favorite_routes import favorite_bp
    from routes.message_routes import message_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(playlist_bp, url_prefix='/api/playlists')
    app.register_blueprint(favorite_bp, url_prefix='/api/favorites')
    app.register_blueprint(message_bp, url_prefix='/api/messages')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
