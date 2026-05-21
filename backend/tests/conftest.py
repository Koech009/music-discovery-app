import pytest
from app import create_app
from config import TestConfig
from extensions import db
from models.user import User
from models.favorite import Favorite
from models.playlist import Playlist
from models.message import Message
from models.audit_log import AuditLog


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
        nested = connection.begin_nested()

        yield db.session

        db.session.remove()
        nested.rollback()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope="function")
def app_ctx(app):
    """
    Lightweight context for tests that need the app (schemas, routes)
    but don't need a database session.
    """
    with app.app_context():
        yield


@pytest.fixture
def client(app):
    return app.test_client()
