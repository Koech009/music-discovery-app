import pytest
from app import create_app
from config import TestConfig
from extensions import db
from models.user import User
from models.favorite import Favorite
from models.playlist import Playlist
from models.message import Message


@pytest.fixture(scope="session")
def app():
    app = create_app(TestConfig.__dict__)

    with app.app_context():
        db.drop_all()
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture(scope="function")
def session(app):
    with app.app_context():
        connection = db.engine.connect()
        transaction = connection.begin()
        db.session.bind = connection

        yield db.session

        db.session.remove()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(app):
    return app.test_client()
