import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from extensions import db

# ── App Setup ──

@pytest.fixture
def app():
    """Create a test Flask app with an in-memory SQLite database."""
    from routes.admin import admin_bp
    from routes.messages import message_bp
    from routes.playlists import playlist_bp
    from routes.audit import audit_bp
    from routes.auth import auth_bp
    from routes.users import user_bp

    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = "test-secret"

    db.init_app(app)
    JWTManager(app)

    app.register_blueprint(admin_bp,   url_prefix="/api/admin")
    app.register_blueprint(message_bp, url_prefix="/api/messages")
    app.register_blueprint(playlist_bp, url_prefix="/api/playlists")
    app.register_blueprint(audit_bp,   url_prefix="/api/admin/audit")
    app.register_blueprint(auth_bp,    url_prefix="/api/auth")
    app.register_blueprint(user_bp,    url_prefix="/api/users")

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Test client used to make HTTP requests."""
    return app.test_client()


# ── Token Helpers ──

def admin_token(app, user_id=1):
    """Create a JWT token with admin role."""
    with app.app_context():
        return create_access_token(identity=str(user_id), additional_claims={"role": "admin"})


def user_token(app, user_id=2):
    """Create a JWT token with regular user role."""
    with app.app_context():
        return create_access_token(identity=str(user_id), additional_claims={"role": "user"})


def auth_header(token):
    """Wrap a token in the Authorization header format Flask expects."""
    return {"Authorization": f"Bearer {token}"}


# ── DB Seed Helpers ──

def make_user(app, username="alice", email="alice@test.com", role="user",
              password="pass", approved=True, suspended=False):
    """Insert a user into the test database and return it."""
    from models.user import User
    with app.app_context():
        u = User(username=username, email=email, password=password,
                 role=role, approved=approved, suspended=suspended)
        db.session.add(u)
        db.session.commit()
        return u.id  


def make_message(app, name="Bob", email="bob@test.com", subject="Hi", body="Hello"):
    """Insert a contact message and return its id."""
    from models.message import Message
    with app.app_context():
        m = Message(name=name, email=email, subject=subject, body=body)
        db.session.add(m)
        db.session.commit()
        return m.id


def make_playlist(app, name="My Mix", user_id=1):
    """Insert a playlist and return its id."""
    from models.playlist import Playlist
    with app.app_context():
        p = Playlist(name=name, user_id=user_id)
        db.session.add(p)
        db.session.commit()
        return p.id



# AUTH TESTS
class TestAuth:

    def test_signup_success(self, client):
        """A new user can sign up with valid details."""
        res = client.post("/api/auth/signup", json={
            "username": "newuser",
            "email": "new@test.com",
            "password": "secret"
        })
        assert res.status_code == 201
        assert "user_id" in res.get_json()

    def test_signup_missing_fields(self, client):
        """Signup fails when required fields are missing."""
        res = client.post("/api/auth/signup", json={"username": "x"})
        assert res.status_code == 400

    def test_signup_duplicate_email(self, client, app):
        """Signup fails if the email is already registered."""
        make_user(app, email="dup@test.com")
        res = client.post("/api/auth/signup", json={
            "username": "other",
            "email": "dup@test.com",
            "password": "pass"
        })
        assert res.status_code == 400

    def test_login_success(self, client, app):
        """A registered user can log in with correct credentials."""
        make_user(app, email="login@test.com", password="mypass")
        res = client.post("/api/auth/login", json={
            "email": "login@test.com",
            "password": "mypass"
        })
        assert res.status_code == 200
        assert "user" in res.get_json()

    def test_login_wrong_password(self, client, app):
        """Login fails when the password is wrong."""
        make_user(app, email="wrong@test.com", password="correct")
        res = client.post("/api/auth/login", json={
            "email": "wrong@test.com",
            "password": "incorrect"
        })
        assert res.status_code == 401


# USER TESTS
class TestUsers:

    def test_get_user_success(self, client, app):
        """Fetching an existing user returns their profile."""
        uid = make_user(app, username="carol")
        res = client.get(f"/api/users/{uid}")
        assert res.status_code == 200
        assert res.get_json()["username"] == "carol"

    def test_get_user_not_found(self, client):
        """Fetching a non-existent user returns 404."""
        res = client.get("/api/users/9999")
        assert res.status_code == 404

    def test_update_user_success(self, client, app):
        """A user's username can be updated."""
        uid = make_user(app, username="old_name")
        res = client.put(f"/api/users/{uid}", json={"username": "new_name"})
        assert res.status_code == 200

    def test_update_user_not_found(self, client):
        """Updating a non-existent user returns 404."""
        res = client.put("/api/users/9999", json={"username": "x"})
        assert res.status_code == 404


# ADMIN — USER MANAGEMENT TESTS
class TestAdminUsers:

    def test_get_all_users_as_admin(self, client, app):
        """Admin can retrieve the full list of users."""
        token = admin_token(app)
        res = client.get("/api/admin/users", headers=auth_header(token))
        assert res.status_code == 200
        assert "users" in res.get_json()

    def test_get_all_users_forbidden_for_non_admin(self, client, app):
        """Non-admin users cannot access the user list."""
        token = user_token(app)
        res = client.get("/api/admin/users", headers=auth_header(token))
        assert res.status_code == 403

    def test_suspend_user(self, client, app):
        """Admin can suspend another user."""
        uid = make_user(app, username="target")
        token = admin_token(app, user_id=99)  
        res = client.patch(f"/api/admin/users/{uid}/suspend",
                           headers=auth_header(token))
        assert res.status_code == 200

    def test_cannot_suspend_yourself(self, client, app):
        """Admin cannot suspend their own account."""
        uid = make_user(app, username="self_admin", role="admin")
        token = admin_token(app, user_id=uid)
        res = client.patch(f"/api/admin/users/{uid}/suspend",
                           headers=auth_header(token))
        assert res.status_code == 400

    def test_promote_user_to_admin(self, client, app):
        """Admin can promote a regular user to admin (pending approval)."""
        uid = make_user(app, username="promoteme", role="user")
        token = admin_token(app, user_id=99)
        res = client.patch(f"/api/admin/users/{uid}/promote",
                           headers=auth_header(token))
        assert res.status_code == 200

    def test_promote_already_admin(self, client, app):
        """Promoting someone who is already an admin returns 400."""
        uid = make_user(app, username="already", role="admin")
        token = admin_token(app, user_id=99)
        res = client.patch(f"/api/admin/users/{uid}/promote",
                           headers=auth_header(token))
        assert res.status_code == 400

    def test_delete_user(self, client, app):
        """Admin can delete another user."""
        uid = make_user(app, username="todelete")
        token = admin_token(app, user_id=99)
        res = client.delete(f"/api/admin/users/{uid}",
                            headers=auth_header(token))
        assert res.status_code == 200

    def test_cannot_delete_yourself(self, client, app):
        """Admin cannot delete their own account."""
        uid = make_user(app, username="selfdelete", role="admin")
        token = admin_token(app, user_id=uid)
        res = client.delete(f"/api/admin/users/{uid}",
                            headers=auth_header(token))
        assert res.status_code == 400



# ADMIN — PENDING ADMIN APPROVAL TESTS
class TestAdminApproval:

    def test_get_pending_admins(self, client, app):
        """Admin can view the list of unapproved admin accounts."""
        make_user(app, username="pending_admin", role="admin", approved=False)
        token = admin_token(app)
        res = client.get("/api/admin/admins/pending", headers=auth_header(token))
        assert res.status_code == 200

    def test_approve_admin(self, client, app):
        """Admin can approve a pending admin account."""
        uid = make_user(app, username="toapprove", role="admin", approved=False)
        token = admin_token(app, user_id=99)
        res = client.patch(f"/api/admin/admins/{uid}/approve",
                           headers=auth_header(token))
        assert res.status_code == 200

    def test_approve_already_approved(self, client, app):
        """Approving an already-approved admin returns 400."""
        uid = make_user(app, username="already_approved", role="admin", approved=True)
        token = admin_token(app, user_id=99)
        res = client.patch(f"/api/admin/admins/{uid}/approve",
                           headers=auth_header(token))
        assert res.status_code == 400

    def test_reject_pending_admin(self, client, app):
        """Admin can reject and remove a pending admin account."""
        uid = make_user(app, username="toreject", role="admin", approved=False)
        token = admin_token(app, user_id=99)
        res = client.delete(f"/api/admin/admins/{uid}/reject",
                            headers=auth_header(token))
        assert res.status_code == 200

    def test_reject_already_approved_admin(self, client, app):
        """Rejecting an already approved admin returns 400."""
        uid = make_user(app, username="cant_reject", role="admin", approved=True)
        token = admin_token(app, user_id=99)
        res = client.delete(f"/api/admin/admins/{uid}/reject",
                            headers=auth_header(token))
        assert res.status_code == 400


# MESSAGE TESTS
class TestMessages:

    def test_create_message_public(self, client):
        """Anyone (no login required) can submit a contact message."""
        res = client.post("/api/messages", json={
            "name": "Jane",
            "email": "jane@test.com",
            "subject": "Hello",
            "body": "Just saying hi"
        })
        assert res.status_code == 201

    def test_get_all_messages_as_admin(self, client, app):
        """Admin can fetch the paginated list of messages."""
        token = admin_token(app)
        res = client.get("/api/messages", headers=auth_header(token))
        assert res.status_code == 200
        assert "messages" in res.get_json()

    def test_get_all_messages_forbidden(self, client, app):
        """Non-admin cannot access the messages list."""
        token = user_token(app)
        res = client.get("/api/messages", headers=auth_header(token))
        assert res.status_code == 403

    def test_get_single_message(self, client, app):
        """Admin can fetch a single message by id."""
        mid = make_message(app)
        token = admin_token(app)
        res = client.get(f"/api/messages/{mid}", headers=auth_header(token))
        assert res.status_code == 200

    def test_get_single_message_not_found(self, client, app):
        """Fetching a message that does not exist returns 404."""
        token = admin_token(app)
        res = client.get("/api/messages/9999", headers=auth_header(token))
        assert res.status_code == 404

    def test_mark_message_as_read(self, client, app):
        """Admin can mark a message as read."""
        mid = make_message(app)
        token = admin_token(app)
        res = client.patch(f"/api/messages/{mid}",
                           json={"is_read": True},
                           headers=auth_header(token))
        assert res.status_code == 200

    def test_mark_message_missing_field(self, client, app):
        """PATCH without the is_read field returns 400."""
        mid = make_message(app)
        token = admin_token(app)
        res = client.patch(f"/api/messages/{mid}",
                           json={},
                           headers=auth_header(token))
        assert res.status_code == 400

    def test_delete_message(self, client, app):
        """Admin can delete a message."""
        mid = make_message(app)
        token = admin_token(app)
        res = client.delete(f"/api/messages/{mid}", headers=auth_header(token))
        assert res.status_code == 200


# PLAYLIST TESTS
class TestPlaylists:

    def test_create_playlist(self, client, app):
        """A logged-in user can create a playlist."""
        token = user_token(app, user_id=2)
        res = client.post("/api/playlists",
                          json={"name": "Chill Vibes"},
                          headers=auth_header(token))
        assert res.status_code == 201

    def test_get_own_playlists(self, client, app):
        """A user can list their own playlists."""
        make_playlist(app, name="My Mix", user_id=2)
        token = user_token(app, user_id=2)
        res = client.get("/api/playlists", headers=auth_header(token))
        assert res.status_code == 200
        assert "playlists" in res.get_json()

    def test_get_single_playlist_owner(self, client, app):
        """The owner of a playlist can view it."""
        pid = make_playlist(app, user_id=2)
        token = user_token(app, user_id=2)
        res = client.get(f"/api/playlists/{pid}", headers=auth_header(token))
        assert res.status_code == 200

    def test_get_playlist_unauthorized(self, client, app):
        """A different user cannot view someone else's playlist."""
        pid = make_playlist(app, user_id=2)
        token = user_token(app, user_id=3)  
        res = client.get(f"/api/playlists/{pid}", headers=auth_header(token))
        assert res.status_code == 403

    def test_admin_can_view_any_playlist(self, client, app):
        """An admin can view any playlist regardless of ownership."""
        pid = make_playlist(app, user_id=2)
        token = admin_token(app, user_id=99)
        res = client.get(f"/api/playlists/{pid}", headers=auth_header(token))
        assert res.status_code == 200

    def test_update_playlist_owner(self, client, app):
        """The owner can update their playlist name."""
        pid = make_playlist(app, user_id=2)
        token = user_token(app, user_id=2)
        res = client.patch(f"/api/playlists/{pid}",
                           json={"name": "Updated Name"},
                           headers=auth_header(token))
        assert res.status_code == 200

    def test_update_playlist_unauthorized(self, client, app):
        """Another user cannot update someone else's playlist."""
        pid = make_playlist(app, user_id=2)
        token = user_token(app, user_id=3)
        res = client.patch(f"/api/playlists/{pid}",
                           json={"name": "Stolen Name"},
                           headers=auth_header(token))
        assert res.status_code == 403

    def test_delete_playlist_owner(self, client, app):
        """The owner can delete their own playlist."""
        pid = make_playlist(app, user_id=2)
        token = user_token(app, user_id=2)
        res = client.delete(f"/api/playlists/{pid}", headers=auth_header(token))
        assert res.status_code == 200

    def test_delete_playlist_not_found(self, client, app):
        """Deleting a non-existent playlist returns 404."""
        token = user_token(app, user_id=2)
        res = client.delete("/api/playlists/9999", headers=auth_header(token))
        assert res.status_code == 404


# AUDIT LOG TESTS
class TestAuditLogs:

    def test_get_all_logs_as_admin(self, client, app):
        """Admin can retrieve all audit logs."""
        token = admin_token(app)
        res = client.get("/api/admin/audit/", headers=auth_header(token))
        assert res.status_code == 200
        assert "logs" in res.get_json()

    def test_get_all_logs_forbidden(self, client, app):
        """Non-admin cannot access audit logs."""
        token = user_token(app)
        res = client.get("/api/admin/audit/", headers=auth_header(token))
        assert res.status_code == 403

    def test_get_logs_by_user(self, client, app):
        """Admin can filter audit logs by a specific user id."""
        token = admin_token(app)
        res = client.get("/api/admin/audit/user/1", headers=auth_header(token))
        assert res.status_code == 200

    def test_get_logs_by_action(self, client, app):
        """Admin can filter audit logs by action name."""
        token = admin_token(app)
        res = client.get("/api/admin/audit/action/DELETE_USER",
                         headers=auth_header(token))
        assert res.status_code == 200

    def test_get_logs_by_action_forbidden(self, client, app):
        """Non-admin cannot filter audit logs by action."""
        token = user_token(app)
        res = client.get("/api/admin/audit/action/LOGIN",
                         headers=auth_header(token))
        assert res.status_code == 403