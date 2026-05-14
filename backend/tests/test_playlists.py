import pytest
from app import create_app
from extensions import db
from models.playlist import Playlist

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
        
def test_create_playlist(app):
    with app.app_context():
        user = User(username='gene', email='gene@email.com', password='password123')
        db.session.add(user)
        db.session.commit()

        playlist = Playlist(name='Afrobeats Mix', description='My favourites', user_id=user.id)
        db.session.add(playlist)
        db.session.commit()

        found = Playlist.query.filter_by(name='Afrobeats Mix').first()
        assert found is not None
        assert found.description == 'My favourites'
        assert found.user_id == user.id

def test_playlist_belongs_to_user(app):
    with app.app_context():
        user = User(username='gene', email='gene@email.com', password='password123')
        db.session.add(user)
        db.session.commit()

        playlist = Playlist(name='Chill Vibes', user_id=user.id)
        db.session.add(playlist)
        db.session.commit()

        assert playlist.user_id == user.id

def test_playlist_repr(app):
    with app.app_context():
        user = User(username='gene', email='gene@email.com', password='password123')
        db.session.add(user)
        db.session.commit()

        playlist = Playlist(name='Afrobeats Mix', user_id=user.id)
        assert repr(playlist) == '<Playlist Afrobeats Mix>'

def test_delete_user_deletes_playlists(app):
    with app.app_context():
        user = User(username='gene', email='gene@email.com', password='password123')
        db.session.add(user)
        db.session.commit()

        playlist = Playlist(name='Chill Vibes', user_id=user.id)
        db.session.add(playlist)
        db.session.commit()

        db.session.delete(user)
        db.session.commit()

        assert Playlist.query.filter_by(name='Chill Vibes').first() is None