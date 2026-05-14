import pytest
from app import create_app
from extensions import db
from models.user import User
from models.song import Song
from models.favorite import Favorite

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
        
def test_create_favorite(app):
    with app.app_context():
        user = User(username='gene', email='gene@email.com', password='password123')
        db.session.add(user)
        db.session.commit()

        song = Song(title='Charm', artist='Rema', api_id='deezer_001')
        db.session.add(song)
        db.session.commit()

        favorite = Favorite(user_id=user.id, song_id=song.id)
        db.session.add(favorite)
        db.session.commit()

        found = Favorite.query.filter_by(user_id=user.id, song_id=song.id).first()
        assert found is not None

def test_duplicate_favorite_raises_error(app):
    with app.app_context():
        user = User(username='gene', email='gene@email.com', password='password123')
        db.session.add(user)
        db.session.commit()

        song = Song(title='Charm', artist='Rema', api_id='deezer_001')
        db.session.add(song)
        db.session.commit()

        fav1 = Favorite(user_id=user.id, song_id=song.id)
        fav2 = Favorite(user_id=user.id, song_id=song.id)
        db.session.add(fav1)
        db.session.commit()

        db.session.add(fav2)
        with pytest.raises(Exception):
            db.session.commit()

def test_favorite_repr(app):
    with app.app_context():
        user = User(username='gene', email='gene@email.com', password='password123')
        db.session.add(user)
        db.session.commit()

        song = Song(title='Charm', artist='Rema', api_id='deezer_001')
        db.session.add(song)
        db.session.commit()

        favorite = Favorite(user_id=user.id, song_id=song.id)
        assert repr(favorite) == f'<Favorite user={user.id} song={song.id}>'

def test_delete_user_deletes_favorites(app):
    with app.app_context():
        user = User(username='gene', email='gene@email.com', password='password123')
        db.session.add(user)
        db.session.commit()

        song = Song(title='Charm', artist='Rema', api_id='deezer_001')
        db.session.add(song)
        db.session.commit()

        favorite = Favorite(user_id=user.id, song_id=song.id)
        db.session.add(favorite)
        db.session.commit()

        db.session.delete(user)
        db.session.commit()

        assert Favorite.query.filter_by(song_id=song.id).first() is None
