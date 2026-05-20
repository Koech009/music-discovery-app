import pytest
from flask import Flask, jsonify
from unittest.mock import MagicMock, patch


# ── helpers ──────────────────────────────────────────────────────────────────

def make_app(blueprint, url_prefix):
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.register_blueprint(blueprint, url_prefix=url_prefix)
    return app.test_client()


def make_json_response(app, data=None, status=200):
    """
    Return a real Flask Response so that schema.jsonify() mock values
    can be returned directly from route functions without causing a 500.
    """
    with app.app_context():
        return jsonify(data or {}), status


def _json_resp(payload=None, status=200):
    """
    Lightweight helper: builds a (Response, status) tuple that Flask accepts.
    Used to patch schema.jsonify() return values inline.
    """
    app = Flask(__name__)
    with app.app_context():
        return jsonify(payload or {"ok": True})


# ─────────────────────────────────────────────
# ADMIN ROUTES
# Decorator order reminder:
#   @patch('...User')   → mock_user  (2nd param)
#   @patch('...db')     → mock_db    (1st param)
# ─────────────────────────────────────────────

@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_get_all_users(mock_db, mock_user):
    mock_user.query.all.return_value = []
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    assert c.get('/admin/users').status_code == 200


@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_toggle_suspend_not_found(mock_db, mock_user):
    mock_user.query.get.return_value = None
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    assert c.patch('/admin/users/99/suspend').status_code == 404


@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_toggle_suspend_success(mock_db, mock_user):
    fake_user = MagicMock(username='john', suspended=False)
    mock_user.query.get.return_value = fake_user
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    assert c.patch('/admin/users/1/suspend').status_code == 200


@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_promote_user_not_found(mock_db, mock_user):
    mock_user.query.get.return_value = None
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    assert c.patch('/admin/users/99/promote').status_code == 404


@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_promote_user_success(mock_db, mock_user):
    fake_user = MagicMock(username='john')
    mock_user.query.get.return_value = fake_user
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    assert c.patch('/admin/users/1/promote').status_code == 200


@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_admin_delete_user_not_found(mock_db, mock_user):
    mock_user.query.get.return_value = None
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    assert c.delete('/admin/users/99').status_code == 404


@patch('routes.admin_routes.User')
@patch('routes.admin_routes.db')
def test_admin_delete_user_success(mock_db, mock_user):
    mock_user.query.get.return_value = MagicMock(username='john')
    from routes.admin_routes import admin_bp
    c = make_app(admin_bp, '/admin')
    assert c.delete('/admin/users/1').status_code == 200


# ─────────────────────────────────────────────
# AUTH ROUTES
# Three patches → (mock_db, mock_user, mock_schema) bottom-up
#   @patch('...user_schema') ← top    → 3rd arg: mock_schema
#   @patch('...User')        ← middle → 2nd arg: mock_user
#   @patch('...db')          ← bottom → 1st arg: mock_db
# ─────────────────────────────────────────────

@patch('routes.auth_routes.user_schema')
@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_signup_validation_error(mock_db, mock_user, mock_schema):
    from marshmallow import ValidationError
    mock_schema.load.side_effect = ValidationError(
        {'username': ['Missing data']})
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    assert c.post('/auth/signup', json={'username': 'john'}).status_code == 400


@patch('routes.auth_routes.user_schema')
@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_signup_duplicate_email(mock_db, mock_user, mock_schema):
    fake_new_user = MagicMock(email='j@j.com', username='john', password=None)
    mock_schema.load.return_value = fake_new_user
    # Email already exists
    mock_user.query.filter_by.return_value.first.return_value = MagicMock()
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    res = c.post('/auth/signup',
                 json={'username': 'john', 'email': 'j@j.com', 'password': '1234'})
    assert res.status_code == 409


@patch('routes.auth_routes.user_schema')
@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_signup_success(mock_db, mock_user, mock_schema):
    fake_new_user = MagicMock(email='j@j.com', username='john', password=None)
    mock_schema.load.return_value = fake_new_user
    # No duplicate found for email or username
    mock_user.query.filter_by.return_value.first.return_value = None
    # schema.jsonify() must return a real Flask Response, not a plain dict
    mock_schema.jsonify.return_value = _json_resp({'username': 'john'})
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    res = c.post('/auth/signup',
                 json={'username': 'john', 'email': 'j@j.com', 'password': 'StrongPass1!'})
    assert res.status_code == 201


@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_login_missing_fields(mock_db, mock_user):
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    assert c.post('/auth/login', json={}).status_code == 400


@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_login_user_not_found(mock_db, mock_user):
    # No user found → 401
    mock_user.query.filter_by.return_value.first.return_value = None
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    assert c.post('/auth/login',
                  json={'email': 'j@j.com', 'password': 'wrong'}).status_code == 401


@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_login_wrong_password(mock_db, mock_user):
    # Route compares plain strings: user.password != password
    fake_user = MagicMock(suspended=False)
    fake_user.password = 'correct'          # plain attribute, not MagicMock
    mock_user.query.filter_by.return_value.first.return_value = fake_user
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    assert c.post('/auth/login',
                  json={'email': 'j@j.com', 'password': 'wrong'}).status_code == 401


@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_login_suspended(mock_db, mock_user):
    fake_user = MagicMock(suspended=True)
    fake_user.password = '1234'
    mock_user.query.filter_by.return_value.first.return_value = fake_user
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    assert c.post('/auth/login',
                  json={'email': 'j@j.com', 'password': '1234'}).status_code == 403


@patch('routes.auth_routes.user_schema')
@patch('routes.auth_routes.User')
@patch('routes.auth_routes.db')
def test_login_success(mock_db, mock_user, mock_schema):
    fake_user = MagicMock(suspended=False)
    fake_user.password = '1234'
    mock_user.query.filter_by.return_value.first.return_value = fake_user
    mock_schema.jsonify.return_value = _json_resp({'username': 'john'})
    from routes.auth_routes import auth_bp
    c = make_app(auth_bp, '/auth')
    assert c.post('/auth/login',
                  json={'email': 'j@j.com', 'password': '1234'}).status_code == 200


# ─────────────────────────────────────────────
# FAVORITE ROUTES
# ─────────────────────────────────────────────

@patch('routes.favorite_routes.Favorite')
@patch('routes.favorite_routes.db')
def test_get_favorites_missing_user_id(mock_db, mock_fav):
    from routes.favorite_routes import favorite_bp
    c = make_app(favorite_bp, '/favorites')
    assert c.get('/favorites').status_code == 400


@patch('routes.favorite_routes.Favorite')
@patch('routes.favorite_routes.db')
def test_get_favorites_success(mock_db, mock_fav):
    mock_fav.query.filter_by.return_value.all.return_value = []
    from routes.favorite_routes import favorite_bp
    c = make_app(favorite_bp, '/favorites')
    assert c.get('/favorites?userId=1').status_code == 200


@patch('routes.favorite_routes.favorite_schema')
@patch('routes.favorite_routes.Favorite')
@patch('routes.favorite_routes.db')
def test_add_favorite_validation_error(mock_db, mock_fav, mock_schema):
    from marshmallow import ValidationError
    mock_schema.load.side_effect = ValidationError(
        {'user_id': ['Missing data']})
    from routes.favorite_routes import favorite_bp
    c = make_app(favorite_bp, '/favorites')
    assert c.post('/favorites', json={}).status_code == 400


@patch('routes.favorite_routes.favorite_schema')
@patch('routes.favorite_routes.Favorite')
@patch('routes.favorite_routes.db')
def test_add_favorite_duplicate(mock_db, mock_fav, mock_schema):
    fake_fav = MagicMock(user_id=1, isrc='ABC123')
    mock_schema.load.return_value = fake_fav
    mock_fav.query.filter_by.return_value.first.return_value = MagicMock()
    from routes.favorite_routes import favorite_bp
    c = make_app(favorite_bp, '/favorites')
    assert c.post('/favorites',
                  json={'user_id': 1, 'isrc': 'ABC123'}).status_code == 409


@patch('routes.favorite_routes.favorite_schema')
@patch('routes.favorite_routes.Favorite')
@patch('routes.favorite_routes.db')
def test_add_favorite_success(mock_db, mock_fav, mock_schema):
    fake_fav = MagicMock(user_id=1, isrc='ABC123')
    mock_schema.load.return_value = fake_fav
    mock_fav.query.filter_by.return_value.first.return_value = None
    mock_schema.jsonify.return_value = _json_resp({'isrc': 'ABC123'})
    from routes.favorite_routes import favorite_bp
    c = make_app(favorite_bp, '/favorites')
    assert c.post('/favorites',
                  json={'user_id': 1, 'isrc': 'ABC123'}).status_code == 201


@patch('routes.favorite_routes.Favorite')
@patch('routes.favorite_routes.db')
def test_remove_favorite_not_found(mock_db, mock_fav):
    mock_fav.query.get.return_value = None
    from routes.favorite_routes import favorite_bp
    c = make_app(favorite_bp, '/favorites')
    assert c.delete('/favorites/99').status_code == 404


@patch('routes.favorite_routes.Favorite')
@patch('routes.favorite_routes.db')
def test_remove_favorite_success(mock_db, mock_fav):
    mock_fav.query.get.return_value = MagicMock()
    from routes.favorite_routes import favorite_bp
    c = make_app(favorite_bp, '/favorites')
    assert c.delete('/favorites/1').status_code == 200


# ─────────────────────────────────────────────
# MESSAGE ROUTES
# ─────────────────────────────────────────────


@patch('routes.message_routes.Message')
@patch('routes.message_routes.db')
def test_get_messages_filtered_by_email(mock_db, mock_msg):
    mock_msg.query.filter_by.return_value.all.return_value = []
    from routes.message_routes import message_bp
    c = make_app(message_bp, '/messages')
    assert c.get('/messages?email=j@j.com').status_code == 200


@patch('routes.message_routes.Message')
@patch('routes.message_routes.db')
def test_get_message_not_found(mock_db, mock_msg):
    mock_msg.query.get.return_value = None
    from routes.message_routes import message_bp
    c = make_app(message_bp, '/messages')
    assert c.get('/messages/99').status_code == 404


@patch('routes.message_routes.message_schema')
@patch('routes.message_routes.Message')
@patch('routes.message_routes.db')
def test_get_message_success(mock_db, mock_msg, mock_schema):
    mock_msg.query.get.return_value = MagicMock()
    mock_schema.jsonify.return_value = _json_resp({'id': 1})
    from routes.message_routes import message_bp
    c = make_app(message_bp, '/messages')
    assert c.get('/messages/1').status_code == 200


@patch('routes.message_routes.message_schema')
@patch('routes.message_routes.Message')
@patch('routes.message_routes.db')
def test_create_message_validation_error(mock_db, mock_msg, mock_schema):
    from marshmallow import ValidationError
    mock_schema.load.side_effect = ValidationError({'email': ['Missing data']})
    from routes.message_routes import message_bp
    c = make_app(message_bp, '/messages')
    assert c.post('/messages', json={}).status_code == 400


@patch('routes.message_routes.message_schema')
@patch('routes.message_routes.Message')
@patch('routes.message_routes.db')
def test_create_message_success(mock_db, mock_msg, mock_schema):
    mock_schema.load.return_value = MagicMock()
    mock_schema.jsonify.return_value = _json_resp({'name': 'John'})
    from routes.message_routes import message_bp
    c = make_app(message_bp, '/messages')
    assert c.post('/messages',
                  json={'name': 'John', 'email': 'j@j.com',
                        'message': 'Hello there!'}).status_code == 201


@patch('routes.message_routes.Message')
@patch('routes.message_routes.db')
def test_update_message_not_found(mock_db, mock_msg):
    mock_msg.query.get.return_value = None
    from routes.message_routes import message_bp
    c = make_app(message_bp, '/messages')
    assert c.patch('/messages/99', json={'is_read': True}).status_code == 404


@patch('routes.message_routes.message_schema')
@patch('routes.message_routes.Message')
@patch('routes.message_routes.db')
def test_update_message_success(mock_db, mock_msg, mock_schema):
    mock_msg.query.get.return_value = MagicMock(is_read=False)
    mock_schema.jsonify.return_value = _json_resp({'is_read': True})
    from routes.message_routes import message_bp
    c = make_app(message_bp, '/messages')
    assert c.patch('/messages/1', json={'is_read': True}).status_code == 200


@patch('routes.message_routes.Message')
@patch('routes.message_routes.db')
def test_delete_message_not_found(mock_db, mock_msg):
    mock_msg.query.get.return_value = None
    from routes.message_routes import message_bp
    c = make_app(message_bp, '/messages')
    assert c.delete('/messages/99').status_code == 404


@patch('routes.message_routes.Message')
@patch('routes.message_routes.db')
def test_delete_message_success(mock_db, mock_msg):
    mock_msg.query.get.return_value = MagicMock()
    from routes.message_routes import message_bp
    c = make_app(message_bp, '/messages')
    assert c.delete('/messages/1').status_code == 200


# ─────────────────────────────────────────────
# PLAYLIST ROUTES
# ─────────────────────────────────────────────

@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_get_playlists_missing_user_id(mock_db, mock_pl):
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.get('/playlists').status_code == 400


@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_get_playlists_success(mock_db, mock_pl):
    mock_pl.query.filter_by.return_value.all.return_value = []
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.get('/playlists?userId=1').status_code == 200


@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_get_single_playlist_not_found(mock_db, mock_pl):
    mock_pl.query.get.return_value = None
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.get('/playlists/99').status_code == 404


@patch('routes.playlist_routes.playlist_schema')
@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_get_single_playlist_success(mock_db, mock_pl, mock_schema):
    mock_pl.query.get.return_value = MagicMock()
    mock_schema.jsonify.return_value = _json_resp({'id': 1})
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.get('/playlists/1').status_code == 200


@patch('routes.playlist_routes.playlist_schema')
@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_create_playlist_validation_error(mock_db, mock_pl, mock_schema):
    from marshmallow import ValidationError
    mock_schema.load.side_effect = ValidationError({'name': ['Missing data']})
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.post('/playlists', json={}).status_code == 400


@patch('routes.playlist_routes.playlist_schema')
@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_create_playlist_success(mock_db, mock_pl, mock_schema):
    mock_schema.load.return_value = MagicMock()
    mock_schema.jsonify.return_value = _json_resp({'name': 'My Playlist'})
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.post('/playlists',
                  json={'name': 'My Playlist', 'userId': 1}).status_code == 201


@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_update_playlist_not_found(mock_db, mock_pl):
    mock_pl.query.get.return_value = None
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.patch('/playlists/99',
                   json={'name': 'New Name'}).status_code == 404


@patch('routes.playlist_routes.playlist_schema')
@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_update_playlist_success(mock_db, mock_pl, mock_schema):
    mock_pl.query.get.return_value = MagicMock()
    mock_schema.jsonify.return_value = _json_resp({'name': 'New Name'})
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.patch(
        '/playlists/1', json={'name': 'New Name'}).status_code == 200


@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_delete_playlist_not_found(mock_db, mock_pl):
    mock_pl.query.get.return_value = None
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.delete('/playlists/99').status_code == 404


@patch('routes.playlist_routes.Playlist')
@patch('routes.playlist_routes.db')
def test_delete_playlist_success(mock_db, mock_pl):
    mock_pl.query.get.return_value = MagicMock()
    from routes.playlist_routes import playlist_bp
    c = make_app(playlist_bp, '/playlists')
    assert c.delete('/playlists/1').status_code == 200


# ─────────────────────────────────────────────
# USER ROUTES
# ─────────────────────────────────────────────

@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_get_users(mock_db, mock_user):
    mock_user.query.all.return_value = []
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.get('/users').status_code == 200


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_get_user_not_found(mock_db, mock_user):
    mock_user.query.get.return_value = None
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.get('/users/99').status_code == 404


@patch('routes.user_routes.user_schema')
@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_get_user_success(mock_db, mock_user, mock_schema):
    mock_user.query.get.return_value = MagicMock(
        id=1, username='john', email='j@j.com')
    mock_schema.jsonify.return_value = _json_resp(
        {'id': 1, 'username': 'john'})
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.get('/users/1').status_code == 200


@patch('routes.user_routes.user_schema')
@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_create_user_validation_error(mock_db, mock_user, mock_schema):
    from marshmallow import ValidationError
    mock_schema.load.side_effect = ValidationError({'email': ['Missing data']})
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.post('/users', json={'username': 'john'}).status_code == 400


@patch('routes.user_routes.user_schema')
@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_create_user_duplicate_email(mock_db, mock_user, mock_schema):
    fake_new_user = MagicMock(email='j@j.com', username='john')
    mock_schema.load.return_value = fake_new_user
    mock_user.query.filter_by.return_value.first.return_value = MagicMock()
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.post('/users',
                  json={'username': 'john', 'email': 'j@j.com',
                        'password': '1234'}).status_code == 409


@patch('routes.user_routes.user_schema')
@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_create_user_success(mock_db, mock_user, mock_schema):
    fake_new_user = MagicMock(email='j@j.com', username='john')
    mock_schema.load.return_value = fake_new_user
    mock_user.query.filter_by.return_value.first.return_value = None
    mock_schema.jsonify.return_value = _json_resp({'username': 'john'})
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.post('/users',
                  json={'username': 'john', 'email': 'j@j.com',
                        'password': '1234'}).status_code == 201


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_update_user_not_found(mock_db, mock_user):
    mock_user.query.get.return_value = None
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.patch('/users/99', json={'username': 'new'}).status_code == 404


@patch('routes.user_routes.user_schema')
@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_update_user_success(mock_db, mock_user, mock_schema):
    mock_user.query.get.return_value = MagicMock()
    mock_schema.jsonify.return_value = _json_resp({'username': 'newname'})
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.patch('/users/1', json={'username': 'newname'}).status_code == 200


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_change_password_not_found(mock_db, mock_user):
    mock_user.query.get.return_value = None
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.patch('/users/99/change-password',
                   json={'new_password': 'abc'}).status_code == 404


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_change_password_missing_new(mock_db, mock_user):
    mock_user.query.get.return_value = MagicMock()
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.patch('/users/1/change-password', json={}).status_code == 400


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_change_password_wrong_old(mock_db, mock_user):
    fake_user = MagicMock()
    fake_user.password = 'correct'          # plain string, not MagicMock
    mock_user.query.get.return_value = fake_user
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.patch('/users/1/change-password',
                   json={'old_password': 'wrong',
                         'new_password': 'new'}).status_code == 400


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_change_password_success(mock_db, mock_user):
    fake_user = MagicMock()
    fake_user.password = 'old'
    mock_user.query.get.return_value = fake_user
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.patch('/users/1/change-password',
                   json={'old_password': 'old',
                         'new_password': 'new'}).status_code == 200


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_delete_user_not_found(mock_db, mock_user):
    mock_user.query.get.return_value = None
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.delete('/users/99').status_code == 404


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_delete_user_success(mock_db, mock_user):
    mock_user.query.get.return_value = MagicMock()
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.delete('/users/1').status_code == 200


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_user_login_invalid(mock_db, mock_user):
    mock_user.query.filter_by.return_value.first.return_value = None
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.post('/users/login',
                  json={'email': 'x@x.com', 'password': 'bad'}).status_code == 401


@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_user_login_suspended(mock_db, mock_user):
    fake_user = MagicMock(suspended=True)
    fake_user.password = '1234'
    mock_user.query.filter_by.return_value.first.return_value = fake_user
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.post('/users/login',
                  json={'email': 'j@j.com', 'password': '1234'}).status_code == 403


@patch('routes.user_routes.user_schema')
@patch('routes.user_routes.User')
@patch('routes.user_routes.db')
def test_user_login_success(mock_db, mock_user, mock_schema):
    fake_user = MagicMock(suspended=False)
    fake_user.password = '1234'
    mock_user.query.filter_by.return_value.first.return_value = fake_user
    mock_schema.jsonify.return_value = _json_resp({'username': 'john'})
    from routes.user_routes import user_bp
    c = make_app(user_bp, '/users')
    assert c.post('/users/login',
                  json={'email': 'j@j.com', 'password': '1234'}).status_code == 200
