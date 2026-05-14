import pytest
from app import create_app
from extensions import db
from models.user import User

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()
        
@pytest.fixture
def client(app):
    return app.test_client()

def test_create_user(app):
    with app.app_context():
        user = User(username='gene', email='gene@email.com', password='password123', role='user')
        db.session.add(user)
        db.session.commit()
        
        found = User.query.filter_by(username='gene').first()
        assert found is not None
        assert found.email == 'gene@email.com'
        
def test_user_default_role(app):
    with app.app_context(app):
        user = User(username='testuser', email='testuser@email.com', password='password123')
        db.session.add(user)
        db.session.commit()

        found = User.query.filter_by(username='testuser').first()
        assert found is not None
        assert found.role == 'user'
        
def test_user_unique_email(app):
    with app.app_context():
        user1 = User(username='user1', email='same@email.com', password='password123')
        user2 = User(username='user2', email='same@email.com', password='password123')
        db.session.add(user1)
        db.session.commit()

        db.session.add(user2)
        with pytest.raises(Exception):
            db.session.commit()

def test_user_repr(app):
    with app.app_context():
        user = User(username='gene', email='gene@email.com', password='password123')
        assert repr(user) == '<User gene>'