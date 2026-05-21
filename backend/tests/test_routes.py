import pytest
from flask import Flask, jsonify
from unittest.mock import MagicMock, patch


# ── Helpers ───────────────────────────────────────────────────────────────────

def _json_resp(payload=None):
    app = Flask(__name__)
    with app.app_context():
        return jsonify(payload or {"ok": True})


def make_app(blueprint, url_prefix):
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    app.register_blueprint(blueprint, url_prefix=url_prefix)
    return app


def admin_headers(app):
    """Generate a real JWT access token with role=admin."""
    from flask_jwt_extended import JWTManager, create_access_token
    JWTManager(app)
    with app.app_context():
        token = create_access_token(
            identity="1", additional_claims={"role": "admin"})
    return {"Authorization": f"Bearer {token}"}


def user_headers(app):
    """Generate a real JWT access token with role=user."""
    from flask_jwt_extended import JWTManager, create_access_token
    JWTManager(app)
    with app.app_context():
        token = create_access_token(
            identity="1", additional_claims={"role": "user"})
    return {"Authorization": f"Bearer {token}"}


# ── ADMIN ROUTES ──────────────────────────────────────────────────────────────

class TestAdminRoutes:

    def setup_method(self):
        from routes.admin_routes import admin_bp
        self.app = make_app(admin_bp, '/admin')
        self.headers = admin_headers(self.app)
        self.client = self.app.test_client()

    @patch('routes.admin_routes.users_schema')
    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_get_all_users(self, mock_db, mock_user, mock_schema):
        mock_user.query.all.return_value = []
        mock_schema.dump.return_value = []
        res = self.client.get('/admin/users', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_get_all_users_forbidden_for_non_admin(self, mock_db, mock_user):
        headers = user_headers(self.app)
        res = self.client.get('/admin/users', headers=headers)
        assert res.status_code == 403

    @patch('routes.admin_routes.users_schema')
    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_get_pending_admins(self, mock_db, mock_user, mock_schema):
        mock_user.query.filter_by.return_value.all.return_value = []
        mock_schema.dump.return_value = []
        res = self.client.get('/admin/admins/pending', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_approve_admin_not_found(self, mock_db, mock_user):
        mock_user.query.get.return_value = None
        res = self.client.patch(
            '/admin/admins/99/approve', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_approve_admin_not_an_admin(self, mock_db, mock_user):
        mock_user.query.get.return_value = MagicMock(
            role='user', approved=False)
        res = self.client.patch(
            '/admin/admins/1/approve', headers=self.headers)
        assert res.status_code == 400

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_approve_admin_already_approved(self, mock_db, mock_user):
        mock_user.query.get.return_value = MagicMock(
            role='admin', approved=True)
        res = self.client.patch(
            '/admin/admins/1/approve', headers=self.headers)
        assert res.status_code == 400

    @patch('routes.admin_routes.user_schema')
    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_approve_admin_success(self, mock_db, mock_user, mock_schema):
        fake_user = MagicMock(
            role='admin', approved=False, username='newadmin')
        mock_user.query.get.return_value = fake_user
        mock_schema.dump.return_value = {}
        mock_db.session.commit.return_value = None
        res = self.client.patch(
            '/admin/admins/2/approve', headers=self.headers)
        assert res.status_code == 200
        assert fake_user.approved is True

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_reject_admin_not_found(self, mock_db, mock_user):
        mock_user.query.get.return_value = None
        res = self.client.delete(
            '/admin/admins/99/reject', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_reject_admin_already_approved(self, mock_db, mock_user):
        mock_user.query.get.return_value = MagicMock(
            role='admin', approved=True)
        res = self.client.delete(
            '/admin/admins/1/reject', headers=self.headers)
        assert res.status_code == 400

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_reject_admin_success(self, mock_db, mock_user):
        fake_user = MagicMock(role='admin', approved=False, username='pending')
        mock_user.query.get.return_value = fake_user
        mock_db.session.commit.return_value = None
        res = self.client.delete(
            '/admin/admins/2/reject', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_toggle_suspend_not_found(self, mock_db, mock_user):
        mock_user.query.get.return_value = None
        res = self.client.patch(
            '/admin/users/99/suspend', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_toggle_suspend_self(self, mock_db, mock_user):
        # Actor ID from token is "1", suspending user id=1 should be blocked
        fake_user = MagicMock(username='self', suspended=False)
        mock_user.query.get.return_value = fake_user
        res = self.client.patch('/admin/users/1/suspend', headers=self.headers)
        assert res.status_code == 400

    @patch('routes.admin_routes.user_schema')
    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_toggle_suspend_success(self, mock_db, mock_user, mock_schema):
        fake_user = MagicMock(username='john', suspended=False)
        mock_user.query.get.return_value = fake_user
        mock_schema.dump.return_value = {}
        mock_db.session.commit.return_value = None
        res = self.client.patch('/admin/users/2/suspend', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_promote_user_not_found(self, mock_db, mock_user):
        mock_user.query.get.return_value = None
        res = self.client.patch(
            '/admin/users/99/promote', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_promote_user_already_admin(self, mock_db, mock_user):
        mock_user.query.get.return_value = MagicMock(role='admin')
        res = self.client.patch('/admin/users/2/promote', headers=self.headers)
        assert res.status_code == 400

    @patch('routes.admin_routes.user_schema')
    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_promote_user_success(self, mock_db, mock_user, mock_schema):
        fake_user = MagicMock(role='user', username='john')
        mock_user.query.get.return_value = fake_user
        mock_schema.dump.return_value = {}
        mock_db.session.commit.return_value = None
        res = self.client.patch('/admin/users/2/promote', headers=self.headers)
        assert res.status_code == 200
        assert fake_user.role == 'admin'
        assert fake_user.approved is False

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_delete_user_not_found(self, mock_db, mock_user):
        mock_user.query.get.return_value = None
        res = self.client.delete('/admin/users/99', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_delete_user_self(self, mock_db, mock_user):
        mock_user.query.get.return_value = MagicMock(username='self')
        res = self.client.delete('/admin/users/1', headers=self.headers)
        assert res.status_code == 400

    @patch('routes.admin_routes.User')
    @patch('routes.admin_routes.db')
    def test_delete_user_success(self, mock_db, mock_user):
        mock_user.query.get.return_value = MagicMock(username='john')
        mock_db.session.commit.return_value = None
        res = self.client.delete('/admin/users/2', headers=self.headers)
        assert res.status_code == 200


# ── AUTH ROUTES ───────────────────────────────────────────────────────────────

class TestAuthRoutes:

    def setup_method(self):
        from routes.auth_routes import auth_bp
        self.app = make_app(auth_bp, '/auth')
        from flask_jwt_extended import JWTManager
        JWTManager(self.app)
        self.client = self.app.test_client()
        self.headers = admin_headers(self.app)

    @patch('routes.auth_routes.user_schema')
    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_signup_validation_error(self, mock_db, mock_user, mock_schema):
        from marshmallow import ValidationError
        mock_schema.load.side_effect = ValidationError(
            {'username': ['Missing data']})
        res = self.client.post('/auth/signup', json={'username': 'john'})
        assert res.status_code == 400

    @patch('routes.auth_routes.user_schema')
    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_signup_duplicate_email(self, mock_db, mock_user, mock_schema):
        fake_user = MagicMock(email='j@j.com', username='john', role='user')
        mock_schema.load.return_value = fake_user
        mock_user.query.filter_by.return_value.first.return_value = MagicMock()
        res = self.client.post('/auth/signup',
                               json={'username': 'john', 'email': 'j@j.com', 'password': '1234'})
        assert res.status_code == 409

    @patch('routes.auth_routes.user_schema')
    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_signup_invalid_role(self, mock_db, mock_user, mock_schema):
        fake_user = MagicMock(
            email='j@j.com', username='john', role='superuser')
        mock_schema.load.return_value = fake_user
        mock_user.query.filter_by.return_value.first.return_value = None
        res = self.client.post('/auth/signup',
                               json={'username': 'john', 'email': 'j@j.com',
                                     'password': '1234', 'role': 'superuser'})
        assert res.status_code == 400

    @patch('routes.auth_routes.user_schema')
    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_signup_admin_pending(self, mock_db, mock_user, mock_schema):
        fake_user = MagicMock(
            email='a@a.com', username='adminuser', role='admin')
        mock_schema.load.return_value = fake_user
        mock_schema.dump.return_value = {}
        mock_user.query.filter_by.return_value.first.return_value = None
        mock_db.session.commit.return_value = None
        res = self.client.post('/auth/signup',
                               json={'username': 'adminuser', 'email': 'a@a.com',
                                     'password': 'StrongPass1!', 'role': 'admin'})
        assert res.status_code == 201
        assert b'pending' in res.data

    @patch('routes.auth_routes.user_schema')
    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_signup_user_success(self, mock_db, mock_user, mock_schema):
        fake_user = MagicMock(email='j@j.com', username='john', role='user')
        mock_schema.load.return_value = fake_user
        mock_schema.dump.return_value = {}
        mock_user.query.filter_by.return_value.first.return_value = None
        mock_db.session.commit.return_value = None
        res = self.client.post('/auth/signup',
                               json={'username': 'john', 'email': 'j@j.com',
                                     'password': 'StrongPass1!'})
        assert res.status_code == 201
        data = res.get_json()
        assert 'access_token' in data
        assert 'refresh_token' in data

    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_login_missing_fields(self, mock_db, mock_user):
        res = self.client.post('/auth/login', json={})
        assert res.status_code == 400

    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_login_user_not_found(self, mock_db, mock_user):
        mock_user.query.filter_by.return_value.first.return_value = None
        res = self.client.post('/auth/login',
                               json={'email': 'j@j.com', 'password': 'wrong'})
        assert res.status_code == 401

    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_login_wrong_password(self, mock_db, mock_user):
        fake_user = MagicMock(suspended=False, role='user', approved=True)
        fake_user.check_password.return_value = False
        mock_user.query.filter_by.return_value.first.return_value = fake_user
        res = self.client.post('/auth/login',
                               json={'email': 'j@j.com', 'password': 'wrong'})
        assert res.status_code == 401

    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_login_suspended(self, mock_db, mock_user):
        fake_user = MagicMock(suspended=True)
        fake_user.check_password.return_value = True
        mock_user.query.filter_by.return_value.first.return_value = fake_user
        res = self.client.post('/auth/login',
                               json={'email': 'j@j.com', 'password': '1234'})
        assert res.status_code == 403

    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_login_admin_not_approved(self, mock_db, mock_user):
        fake_user = MagicMock(suspended=False, role='admin', approved=False)
        fake_user.check_password.return_value = True
        mock_user.query.filter_by.return_value.first.return_value = fake_user
        res = self.client.post('/auth/login',
                               json={'email': 'a@a.com', 'password': '1234'})
        assert res.status_code == 403

    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_login_success(self, mock_db, mock_user):
        fake_user = MagicMock(suspended=False, role='user', approved=True)
        fake_user.check_password.return_value = True
        fake_user.to_dict.return_value = {'username': 'john'}
        mock_user.query.filter_by.return_value.first.return_value = fake_user
        mock_db.session.commit.return_value = None
        res = self.client.post('/auth/login',
                               json={'email': 'j@j.com', 'password': '1234'})
        assert res.status_code == 200
        data = res.get_json()
        assert 'access_token' in data
        assert 'refresh_token' in data

    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_logout_success(self, mock_db, mock_user):
        fake_user = MagicMock(id=1)
        mock_user.query.get.return_value = fake_user
        mock_db.session.commit.return_value = None
        res = self.client.post('/auth/logout', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_me_not_found(self, mock_db, mock_user):
        mock_user.query.get.return_value = None
        res = self.client.get('/auth/me', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.auth_routes.User')
    @patch('routes.auth_routes.db')
    def test_me_success(self, mock_db, mock_user):
        fake_user = MagicMock()
        fake_user.to_dict.return_value = {'username': 'john', 'profile': {}}
        mock_user.query.get.return_value = fake_user
        res = self.client.get('/auth/me', headers=self.headers)
        assert res.status_code == 200


# ── FAVORITE ROUTES ───────────────────────────────────────────────────────────

class TestFavoriteRoutes:

    def setup_method(self):
        from routes.favorite_routes import favorite_bp
        self.app = make_app(favorite_bp, '/favorites')
        from flask_jwt_extended import JWTManager
        JWTManager(self.app)
        self.client = self.app.test_client()
        self.headers = user_headers(self.app)
        self.admin_headers = admin_headers(self.app)

    @patch('routes.favorite_routes.favorites_schema')
    @patch('routes.favorite_routes.Favorite')
    @patch('routes.favorite_routes.db')
    def test_get_favorites_success(self, mock_db, mock_fav, mock_schema):
        mock_pagination = MagicMock(
            total=0, pages=1, page=1, per_page=10,
            has_next=False, has_prev=False, items=[]
        )
        mock_fav.query.filter_by.return_value.paginate.return_value = mock_pagination
        mock_schema.dump.return_value = []
        res = self.client.get('/favorites', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.favorite_routes.favorite_schema')
    @patch('routes.favorite_routes.Favorite')
    @patch('routes.favorite_routes.db')
    def test_add_favorite_validation_error(self, mock_db, mock_fav, mock_schema):
        from marshmallow import ValidationError
        mock_schema.load.side_effect = ValidationError(
            {'title': ['Missing data']})
        res = self.client.post('/favorites', json={}, headers=self.headers)
        assert res.status_code == 400

    @patch('routes.favorite_routes.favorite_schema')
    @patch('routes.favorite_routes.Favorite')
    @patch('routes.favorite_routes.db')
    def test_add_favorite_duplicate(self, mock_db, mock_fav, mock_schema):
        fake_fav = MagicMock(user_id=1, isrc='ABC123',
                             title='Song', artist_name='Artist')
        mock_schema.load.return_value = fake_fav
        mock_fav.query.filter_by.return_value.first.return_value = MagicMock()
        res = self.client.post('/favorites',
                               json={'isrc': 'ABC123'}, headers=self.headers)
        assert res.status_code == 409

    @patch('routes.favorite_routes.favorite_schema')
    @patch('routes.favorite_routes.Favorite')
    @patch('routes.favorite_routes.db')
    def test_add_favorite_success(self, mock_db, mock_fav, mock_schema):
        fake_fav = MagicMock(user_id=1, isrc='ABC123',
                             title='Song', artist_name='Artist')
        mock_schema.load.return_value = fake_fav
        mock_schema.dump.return_value = {}
        mock_fav.query.filter_by.return_value.first.return_value = None
        mock_db.session.commit.return_value = None
        res = self.client.post('/favorites',
                               json={'isrc': 'ABC123'}, headers=self.headers)
        assert res.status_code == 201

    @patch('routes.favorite_routes.Favorite')
    @patch('routes.favorite_routes.db')
    def test_remove_favorite_not_found(self, mock_db, mock_fav):
        mock_fav.query.get.return_value = None
        res = self.client.delete('/favorites/99', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.favorite_routes.Favorite')
    @patch('routes.favorite_routes.db')
    def test_remove_favorite_unauthorized(self, mock_db, mock_fav):
        # fav belongs to user 2, token identity is 1
        mock_fav.query.get.return_value = MagicMock(
            user_id=2, title='Song', artist_name='Artist')
        res = self.client.delete('/favorites/1', headers=self.headers)
        assert res.status_code == 403

    @patch('routes.favorite_routes.Favorite')
    @patch('routes.favorite_routes.db')
    def test_remove_favorite_success(self, mock_db, mock_fav):
        # fav belongs to user 1 — matches token identity
        mock_fav.query.get.return_value = MagicMock(
            user_id=1, title='Song', artist_name='Artist')
        mock_db.session.commit.return_value = None
        res = self.client.delete('/favorites/1', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.favorite_routes.Favorite')
    @patch('routes.favorite_routes.db')
    def test_remove_favorite_admin_can_delete_any(self, mock_db, mock_fav):
        # fav belongs to user 2 but admin token should allow it
        mock_fav.query.get.return_value = MagicMock(
            user_id=2, title='Song', artist_name='Artist')
        mock_db.session.commit.return_value = None
        res = self.client.delete('/favorites/1', headers=self.admin_headers)
        assert res.status_code == 200


# ── MESSAGE ROUTES ────────────────────────────────────────────────────────────

class TestMessageRoutes:

    def setup_method(self):
        from routes.message_routes import message_bp
        self.app = make_app(message_bp, '/messages')
        from flask_jwt_extended import JWTManager
        JWTManager(self.app)
        self.client = self.app.test_client()
        self.headers = admin_headers(self.app)

    @patch('routes.message_routes.messages_schema')
    @patch('routes.message_routes.Message')
    @patch('routes.message_routes.db')
    def test_get_messages_success(self, mock_db, mock_msg, mock_schema):
        mock_pagination = MagicMock(
            total=0, pages=1, page=1, per_page=10,
            has_next=False, has_prev=False, items=[]
        )
        mock_msg.query.order_by.return_value.paginate.return_value = mock_pagination
        mock_schema.dump.return_value = []
        res = self.client.get('/messages', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.message_routes.Message')
    @patch('routes.message_routes.db')
    def test_get_messages_non_admin_forbidden(self, mock_db, mock_msg):
        headers = user_headers(self.app)
        res = self.client.get('/messages', headers=headers)
        assert res.status_code == 403

    @patch('routes.message_routes.message_schema')
    @patch('routes.message_routes.Message')
    @patch('routes.message_routes.db')
    def test_get_single_message_not_found(self, mock_db, mock_msg, mock_schema):
        mock_msg.query.get.return_value = None
        res = self.client.get('/messages/99', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.message_routes.message_schema')
    @patch('routes.message_routes.Message')
    @patch('routes.message_routes.db')
    def test_get_single_message_success(self, mock_db, mock_msg, mock_schema):
        mock_msg.query.get.return_value = MagicMock()
        mock_schema.dump.return_value = {}
        res = self.client.get('/messages/1', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.message_routes.message_schema')
    @patch('routes.message_routes.Message')
    @patch('routes.message_routes.db')
    def test_create_message_validation_error(self, mock_db, mock_msg, mock_schema):
        from marshmallow import ValidationError
        mock_schema.load.side_effect = ValidationError(
            {'email': ['Missing data']})
        res = self.client.post('/messages', json={})  # no auth — public route
        assert res.status_code == 400

    @patch('routes.message_routes.message_schema')
    @patch('routes.message_routes.Message')
    @patch('routes.message_routes.db')
    def test_create_message_success(self, mock_db, mock_msg, mock_schema):
        mock_schema.load.return_value = MagicMock()
        mock_db.session.commit.return_value = None
        res = self.client.post('/messages',
                               json={'name': 'John', 'email': 'j@j.com',
                                     'content': 'Hello!'})
        assert res.status_code == 201

    @patch('routes.message_routes.message_schema')
    @patch('routes.message_routes.Message')
    @patch('routes.message_routes.db')
    def test_update_message_not_found(self, mock_db, mock_msg, mock_schema):
        mock_msg.query.get.return_value = None
        res = self.client.patch('/messages/99',
                                json={'is_read': True}, headers=self.headers)
        assert res.status_code == 404

    @patch('routes.message_routes.message_schema')
    @patch('routes.message_routes.Message')
    @patch('routes.message_routes.db')
    def test_update_message_missing_is_read(self, mock_db, mock_msg, mock_schema):
        mock_msg.query.get.return_value = MagicMock()
        res = self.client.patch('/messages/1',
                                json={}, headers=self.headers)
        assert res.status_code == 400

    @patch('routes.message_routes.message_schema')
    @patch('routes.message_routes.Message')
    @patch('routes.message_routes.db')
    def test_update_message_success(self, mock_db, mock_msg, mock_schema):
        mock_msg.query.get.return_value = MagicMock(
            is_read=False, email='j@j.com')
        mock_schema.dump.return_value = {}
        mock_db.session.commit.return_value = None
        res = self.client.patch('/messages/1',
                                json={'is_read': True}, headers=self.headers)
        assert res.status_code == 200

    @patch('routes.message_routes.Message')
    @patch('routes.message_routes.db')
    def test_delete_message_not_found(self, mock_db, mock_msg):
        mock_msg.query.get.return_value = None
        res = self.client.delete('/messages/99', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.message_routes.Message')
    @patch('routes.message_routes.db')
    def test_delete_message_success(self, mock_db, mock_msg):
        mock_msg.query.get.return_value = MagicMock(email='j@j.com')
        mock_db.session.commit.return_value = None
        res = self.client.delete('/messages/1', headers=self.headers)
        assert res.status_code == 200


# ── PLAYLIST ROUTES ───────────────────────────────────────────────────────────

class TestPlaylistRoutes:

    def setup_method(self):
        from routes.playlist_routes import playlist_bp
        self.app = make_app(playlist_bp, '/playlists')
        from flask_jwt_extended import JWTManager
        JWTManager(self.app)
        self.client = self.app.test_client()
        self.headers = user_headers(self.app)

    @patch('routes.playlist_routes.playlists_schema')
    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_get_playlists_success(self, mock_db, mock_pl, mock_schema):
        mock_pagination = MagicMock(
            total=0, pages=1, page=1, per_page=10,
            has_next=False, has_prev=False, items=[]
        )
        mock_pl.query.filter_by.return_value.paginate.return_value = mock_pagination
        mock_schema.dump.return_value = []
        res = self.client.get('/playlists', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_get_single_playlist_not_found(self, mock_db, mock_pl):
        mock_pl.query.get.return_value = None
        res = self.client.get('/playlists/99', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.playlist_routes.playlist_schema')
    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_get_single_playlist_unauthorized(self, mock_db, mock_pl, mock_schema):
        # Playlist belongs to user 2, token is user 1
        mock_pl.query.get.return_value = MagicMock(user_id=2)
        res = self.client.get('/playlists/1', headers=self.headers)
        assert res.status_code == 403

    @patch('routes.playlist_routes.playlist_schema')
    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_get_single_playlist_success(self, mock_db, mock_pl, mock_schema):
        mock_pl.query.get.return_value = MagicMock(user_id=1)
        mock_schema.dump.return_value = {}
        res = self.client.get('/playlists/1', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.playlist_routes.playlist_schema')
    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_create_playlist_validation_error(self, mock_db, mock_pl, mock_schema):
        from marshmallow import ValidationError
        mock_schema.load.side_effect = ValidationError(
            {'name': ['Missing data']})
        res = self.client.post('/playlists', json={}, headers=self.headers)
        assert res.status_code == 400

    @patch('routes.playlist_routes.playlist_schema')
    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_create_playlist_success(self, mock_db, mock_pl, mock_schema):
        fake_pl = MagicMock(name='Chill Vibes')
        mock_schema.load.return_value = fake_pl
        mock_schema.dump.return_value = {}
        mock_db.session.commit.return_value = None
        res = self.client.post('/playlists',
                               json={'name': 'Chill Vibes'}, headers=self.headers)
        assert res.status_code == 201

    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_update_playlist_not_found(self, mock_db, mock_pl):
        mock_pl.query.get.return_value = None
        res = self.client.patch('/playlists/99',
                                json={'name': 'New'}, headers=self.headers)
        assert res.status_code == 404

    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_update_playlist_unauthorized(self, mock_db, mock_pl):
        mock_pl.query.get.return_value = MagicMock(user_id=2)
        res = self.client.patch('/playlists/1',
                                json={'name': 'New'}, headers=self.headers)
        assert res.status_code == 403

    @patch('routes.playlist_routes.playlist_schema')
    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_update_playlist_success(self, mock_db, mock_pl, mock_schema):
        mock_pl.query.get.return_value = MagicMock(user_id=1, name='Old')
        mock_schema.dump.return_value = {}
        mock_db.session.commit.return_value = None
        res = self.client.patch('/playlists/1',
                                json={'name': 'New Name'}, headers=self.headers)
        assert res.status_code == 200

    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_delete_playlist_not_found(self, mock_db, mock_pl):
        mock_pl.query.get.return_value = None
        res = self.client.delete('/playlists/99', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_delete_playlist_unauthorized(self, mock_db, mock_pl):
        mock_pl.query.get.return_value = MagicMock(user_id=2, name='Mine')
        res = self.client.delete('/playlists/1', headers=self.headers)
        assert res.status_code == 403

    @patch('routes.playlist_routes.Playlist')
    @patch('routes.playlist_routes.db')
    def test_delete_playlist_success(self, mock_db, mock_pl):
        mock_pl.query.get.return_value = MagicMock(user_id=1, name='Mine')
        mock_db.session.commit.return_value = None
        res = self.client.delete('/playlists/1', headers=self.headers)
        assert res.status_code == 200


# ── USER ROUTES ───────────────────────────────────────────────────────────────

class TestUserRoutes:

    def setup_method(self):
        from routes.user_routes import user_bp
        self.app = make_app(user_bp, '/users')
        from flask_jwt_extended import JWTManager
        JWTManager(self.app)
        self.client = self.app.test_client()
        self.headers = user_headers(self.app)
        self.admin_headers = admin_headers(self.app)

    @patch('routes.user_routes.users_schema')
    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_get_users_admin_only(self, mock_db, mock_user, mock_schema):
        mock_user.query.all.return_value = []
        mock_schema.dump.return_value = []
        res = self.client.get('/users', headers=self.admin_headers)
        assert res.status_code == 200

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_get_users_forbidden_for_user(self, mock_db, mock_user):
        res = self.client.get('/users', headers=self.headers)
        assert res.status_code == 403

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_get_user_not_found(self, mock_db, mock_user):
        mock_user.query.get.return_value = None
        res = self.client.get('/users/99', headers=self.admin_headers)
        assert res.status_code == 404

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_get_user_own_profile(self, mock_db, mock_user):
        fake_user = MagicMock()
        fake_user.to_dict.return_value = {'username': 'john', 'profile': {}}
        mock_user.query.get.return_value = fake_user
        # user fetching their own profile (id=1 from token)
        res = self.client.get('/users/1', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_get_user_other_profile_forbidden(self, mock_db, mock_user):
        mock_user.query.get.return_value = MagicMock()
        res = self.client.get('/users/2', headers=self.headers)
        assert res.status_code == 403

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_update_user_not_found(self, mock_db, mock_user):
        mock_user.query.get.return_value = None
        res = self.client.patch('/users/1',
                                json={'username': 'new'}, headers=self.headers)
        assert res.status_code == 404

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_update_user_unauthorized(self, mock_db, mock_user):
        mock_user.query.get.return_value = MagicMock()
        res = self.client.patch('/users/2',
                                json={'username': 'new'}, headers=self.headers)
        assert res.status_code == 403

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_update_user_role_forbidden_for_user(self, mock_db, mock_user):
        fake_user = MagicMock(username='john', role='user')
        mock_user.query.get.return_value = fake_user
        res = self.client.patch('/users/1',
                                json={'role': 'admin'}, headers=self.headers)
        assert res.status_code == 403

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_update_user_success(self, mock_db, mock_user):
        fake_user = MagicMock(username='john', role='user', first_login=True)
        fake_user.to_dict.return_value = {'username': 'newname'}
        mock_user.query.get.return_value = fake_user
        mock_db.session.commit.return_value = None
        res = self.client.patch('/users/1',
                                json={'username': 'newname'}, headers=self.headers)
        assert res.status_code == 200

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_change_password_not_found(self, mock_db, mock_user):
        mock_user.query.get.return_value = None
        res = self.client.patch('/users/1/change-password',
                                json={'new_password': 'abc'}, headers=self.headers)
        assert res.status_code == 404

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_change_password_missing_new(self, mock_db, mock_user):
        mock_user.query.get.return_value = MagicMock()
        res = self.client.patch('/users/1/change-password',
                                json={}, headers=self.headers)
        assert res.status_code == 400

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_change_password_wrong_old(self, mock_db, mock_user):
        fake_user = MagicMock()
        fake_user.check_password.return_value = False
        mock_user.query.get.return_value = fake_user
        res = self.client.patch('/users/1/change-password',
                                json={'old_password': 'wrong',
                                      'new_password': 'new'}, headers=self.headers)
        assert res.status_code == 401

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_change_password_success(self, mock_db, mock_user):
        fake_user = MagicMock(username='john')
        fake_user.check_password.return_value = True
        mock_user.query.get.return_value = fake_user
        mock_db.session.commit.return_value = None
        res = self.client.patch('/users/1/change-password',
                                json={'old_password': 'old',
                                      'new_password': 'new'}, headers=self.headers)
        assert res.status_code == 200

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_delete_user_not_found(self, mock_db, mock_user):
        mock_user.query.get.return_value = None
        res = self.client.delete('/users/1', headers=self.headers)
        assert res.status_code == 404

    @patch('routes.user_routes.User')
    @patch('routes.user_routes.db')
    def test_delete_user_success(self, mock_db, mock_user):
        fake_user = MagicMock(username='john')
        mock_user.query.get.return_value = fake_user
        mock_db.session.commit.return_value = None
        res = self.client.delete('/users/1', headers=self.headers)
        assert res.status_code == 200


# ── AUDIT ROUTES ──────────────────────────────────────────────────────────────

class TestAuditRoutes:

    def setup_method(self):
        from routes.audit_routes import audit_bp
        self.app = make_app(audit_bp, '/audit')
        from flask_jwt_extended import JWTManager
        JWTManager(self.app)
        self.client = self.app.test_client()
        self.headers = admin_headers(self.app)

    @patch('routes.audit_routes.audit_list_schema')
    @patch('routes.audit_routes.AuditLog')
    @patch('routes.audit_routes.db')
    def test_get_logs_success(self, mock_db, mock_log, mock_schema):
        mock_pagination = MagicMock(
            total=0, pages=1, page=1, per_page=20,
            has_next=False, has_prev=False, items=[]
        )
        mock_log.query.order_by.return_value.paginate.return_value = mock_pagination
        mock_schema.dump.return_value = []
        res = self.client.get('/audit/', headers=self.headers)
        assert res.status_code == 200
        data = res.get_json()
        assert 'logs' in data
        assert 'total' in data

    @patch('routes.audit_routes.AuditLog')
    @patch('routes.audit_routes.db')
    def test_get_logs_non_admin_forbidden(self, mock_db, mock_log):
        headers = user_headers(self.app)
        res = self.client.get('/audit/', headers=headers)
        assert res.status_code == 403

    @patch('routes.audit_routes.audit_list_schema')
    @patch('routes.audit_routes.AuditLog')
    @patch('routes.audit_routes.db')
    def test_get_logs_by_user(self, mock_db, mock_log, mock_schema):
        mock_pagination = MagicMock(
            total=0, pages=1, page=1, per_page=20,
            has_next=False, has_prev=False, items=[]
        )
        mock_log.query.filter_by.return_value.order_by.return_value.paginate.return_value = mock_pagination
        mock_schema.dump.return_value = []
        res = self.client.get('/audit/user/1', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.audit_routes.audit_list_schema')
    @patch('routes.audit_routes.AuditLog')
    @patch('routes.audit_routes.db')
    def test_get_logs_by_action(self, mock_db, mock_log, mock_schema):
        mock_pagination = MagicMock(
            total=0, pages=1, page=1, per_page=20,
            has_next=False, has_prev=False, items=[]
        )
        mock_log.query.filter_by.return_value.order_by.return_value.paginate.return_value = mock_pagination
        mock_schema.dump.return_value = []
        res = self.client.get('/audit/action/login', headers=self.headers)
        assert res.status_code == 200

    @patch('routes.audit_routes.audit_list_schema')
    @patch('routes.audit_routes.AuditLog')
    @patch('routes.audit_routes.db')
    def test_get_logs_pagination_metadata(self, mock_db, mock_log, mock_schema):
        mock_pagination = MagicMock(
            total=25, pages=2, page=1, per_page=20,
            has_next=True, has_prev=False, items=[]
        )
        mock_log.query.order_by.return_value.paginate.return_value = mock_pagination
        mock_schema.dump.return_value = []
        res = self.client.get(
            '/audit/?page=1&per_page=20', headers=self.headers)
        assert res.status_code == 200
        data = res.get_json()
        assert data['total'] == 25
        assert data['pages'] == 2
        assert data['has_next'] is True
        assert data['has_prev'] is False

    @patch('routes.audit_routes.AuditLog')
    @patch('routes.audit_routes.db')
    def test_get_logs_by_user_non_admin_forbidden(self, mock_db, mock_log):
        headers = user_headers(self.app)
        res = self.client.get('/audit/user/1', headers=headers)
        assert res.status_code == 403

    @patch('routes.audit_routes.AuditLog')
    @patch('routes.audit_routes.db')
    def test_get_logs_by_action_non_admin_forbidden(self, mock_db, mock_log):
        headers = user_headers(self.app)
        res = self.client.get('/audit/action/login', headers=headers)
        assert res.status_code == 403

    @patch('routes.audit_routes.audit_list_schema')
    @patch('routes.audit_routes.AuditLog')
    @patch('routes.audit_routes.db')
    def test_get_logs_by_action_uppercased(self, mock_db, mock_log, mock_schema):
        """Route calls action.upper() — verify filter_by receives uppercase."""
        mock_pagination = MagicMock(
            total=0, pages=1, page=1, per_page=20,
            has_next=False, has_prev=False, items=[]
        )
        mock_log.query.filter_by.return_value.order_by.return_value.paginate.return_value = mock_pagination
        mock_schema.dump.return_value = []
        self.client.get('/audit/action/login', headers=self.headers)
        mock_log.query.filter_by.assert_called_with(action='LOGIN')
