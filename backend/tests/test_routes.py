import pytest
from flask import Flask
from unittest.mock import MagicMock, patch

def make_app(blueprint, url_prefix):
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.register_blueprint(blueprint, url_prefix=url_prefix)
    return app.test_client()


# ADMIN ROUTES
@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_get_all_users(mock_db, mock_user):
    mock_user.query.all.return_value = []
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    assert c.get('/admin/users').status_code == 200


@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_create_user_missing_fields(mock_db, mock_user):
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    assert c.post('/admin/users', json={'username': 'john'}).status_code == 400


@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_create_user_success(mock_db, mock_user):
    mock_user.query.filter_by.return_value.first.return_value = None
    mock_user.return_value = MagicMock(id=1)
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    res = c.post('/admin/users', json={'username': 'john', 'email': 'j@j.com', 'password': '1234'})
    assert res.status_code == 201


@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_delete_user_not_found(mock_db, mock_user):
    mock_user.query.get.return_value = None
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    assert c.delete('/admin/users/99').status_code == 404


@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_promote_user(mock_db, mock_user):
    fake_user = MagicMock(username='john')
    mock_user.query.get.return_value = fake_user
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    assert c.put('/admin/users/1/promote').status_code == 200


# AUTH ROUTES
@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_signup_missing_fields(mock_db, mock_user):
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    assert c.post('/auth/signup', json={'username': 'john'}).status_code == 400


@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_signup_success(mock_db, mock_user):
    mock_user.query.filter_by.return_value.first.return_value = None
    mock_user.return_value = MagicMock(id=1)
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    res = c.post('/auth/signup', json={'username': 'john', 'email': 'j@j.com', 'password': '1234'})
    assert res.status_code == 201


@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_login_wrong_password(mock_db, mock_user):
    fake_user = MagicMock(password='correct')
    mock_user.query.filter_by.return_value.first.return_value = fake_user
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    res = c.post('/auth/login', json={'email': 'j@j.com', 'password': 'wrong'})
    assert res.status_code == 401


@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_login_success(mock_db, mock_user):
    fake_user = MagicMock(password='1234', id=1, username='john', email='j@j.com', role='user', first_login=True)
    mock_user.query.filter_by.return_value.first.return_value = fake_user
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    res = c.post('/auth/login', json={'email': 'j@j.com', 'password': '1234'})
    assert res.status_code == 200


# FAVORITE ROUTES
@patch('routes.favorite_routes.Favorite')
@patch('routes.favorite_routes.db')
def test_get_favorites(mock_db, mock_fav):
    mock_fav.query.filter_by.return_value.all.return_value = []
    from routes.favorite_routes import favorite_bp
    c = make_app(favorite_bp, '/favorites')
    assert c.get('/favorites/1').status_code == 200


@patch('routes.favorite_routes.Favorite')
@patch('routes.favorite_routes.db')
def test_add_favorite_success(mock_db, mock_fav):
    mock_fav.query.filter_by.return_value.first.return_value = None
    mock_fav.return_value = MagicMock(id=1)
    from routes.favorite_routes import favorite_bp
    c = make_app(favorite_bp, '/favorites')
    assert c.post('/favorites', json={'user_id': 1, 'song_id': 10}).status_code == 201


@patch('routes.favorite_routes.Favorite')
@patch('routes.favorite_routes.db')
def test_remove_favorite_not_found(mock_db, mock_fav):
    mock_fav.query.get.return_value = None
    from routes.favorite_routes import favorite_bp
    c = make_app(favorite_bp, '/favorites')
    assert c.delete('/favorites/99').status_code == 404


# PLAYLIST ROUTES
@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_get_playlists(mock_db, mock_pl):
    mock_pl.query.filter_by.return_value.all.return_value = []
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.get('/playlists/user/1').status_code == 200


@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_create_playlist_success(mock_db, mock_pl):
    mock_pl.return_value = MagicMock(id=1)
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.post('/playlists', json={'name': 'My Playlist', 'user_id': 1}).status_code == 201


@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_delete_playlist_not_found(mock_db, mock_pl):
    mock_pl.query.get.return_value = None
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.delete('/playlists/99').status_code == 404


# SONG ROUTES
@patch('routes.song_routes.Song')
@patch('routes.song_routes.db')
def test_get_songs_in_playlist(mock_db, mock_song):
    mock_song.query.filter_by.return_value.all.return_value = []
    from routes.song_routes import song_bp
    c = make_app(song_bp, '/songs')
    assert c.get('/songs/playlist/1').status_code == 200


@patch('routes.song_routes.Song')
@patch('routes.song_routes.db')
def test_add_song_success(mock_db, mock_song):
    mock_song.return_value = MagicMock(id=1)
    from routes.song_routes import song_bp
    c = make_app(song_bp, '/songs')
    res = c.post('/songs', json={'title': 'Song A', 'artist': 'Artist A', 'playlist_id': 1})
    assert res.status_code == 201


@patch('routes.song_routes.Song')
@patch('routes.song_routes.db')
def test_delete_song_not_found(mock_db, mock_song):
    mock_song.query.get.return_value = None
    from routes.song_routes import song_bp
    c = make_app(song_bp, '/songs')
    assert c.delete('/songs/99').status_code == 404


# USER ROUTES
@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_get_user_not_found(mock_db, mock_user):
    mock_user.query.get.return_value = None
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.get('/users/99').status_code == 404


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_get_user_success(mock_db, mock_user):
    mock_user.query.get.return_value = MagicMock(id=1, username='john', email='j@j.com', role='user', first_login=True, created_at='2024-01-01')
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.get('/users/1').status_code == 200


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_update_user_success(mock_db, mock_user):
    mock_user.query.get.return_value = MagicMock()
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.put('/users/1', json={'username': 'newname'}).status_code == 200