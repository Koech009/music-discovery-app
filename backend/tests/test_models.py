import pytest
from flask import Flask
from extensions import db
from models.user import User
from models.favorite import Favorite
from models.playlist import Playlist
from models.message import Message
from models.audit_log import AuditLog


# ── Fixtures ──
@pytest.fixture
def app():
    app = Flask(__name__)
    app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI="sqlite:///:memory:")
    db.init_app(app)
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def session(app):
    with app.app_context():
        yield db.session


@pytest.fixture
def user(session):
    u = User(username="alice", email="alice@test.com", password="pw")
    session.add(u)
    session.commit()
    return u


# ── User ──

class TestUser:

    def test_create_and_defaults(self, session):
        u = User(username="koech", email="koech@test.com", password="pw")
        session.add(u)
        session.commit()
        assert u.username == "koech"
        assert u.role == "user"
        assert u.suspended is False
        assert u.first_login is True
        assert u.last_login is None

    def test_admin_role(self, session):
        u = User(username="admin", email="admin@test.com", password="pw", role="admin")
        session.add(u)
        session.commit()
        assert u.role == "admin"

    def test_unique_username_and_email(self, session):
        session.add(User(username="same", email="a@test.com", password="pw"))
        session.commit()
        for kwargs in [
            dict(username="same", email="b@test.com", password="pw"),
            dict(username="other", email="a@test.com", password="pw"),
        ]:
            session.add(User(**kwargs))
            with pytest.raises(Exception):
                session.commit()
            session.rollback()

    def test_to_dict(self, user):
        data = user.to_dict()
        assert data["username"] == "alice"
        assert data["role"] == "user"
        assert data["profile"]["bio"] == ""

    def test_repr(self, user):
        assert "alice" in repr(user)


# ── Favorite ──

class TestFavorite:

    def test_create_and_defaults(self, session, user):
        fav = Favorite(user_id=user.id, title="Blinding Lights",
                       artist_name="The Weeknd", isrc="ISRC001")
        session.add(fav)
        session.commit()
        assert fav.title == "Blinding Lights"
        assert fav.genre == "Unknown"
        assert fav.user.username == "alice"

    def test_unique_constraint(self, session, user):
        for _ in range(2):
            session.add(Favorite(user_id=user.id, title="Song",
                                 artist_name="Artist", isrc="ISRC999"))
        session.flush()
        with pytest.raises(Exception):
            session.commit()
        session.rollback()

    def test_to_dict(self, session, user):
        fav = Favorite(user_id=user.id, title="Peponi", artist_name="Sauti Sol",
                       album_title="Live and Die in Afrika",
                       album_cover="http://cover.url", isrc="KE001")
        session.add(fav)
        session.commit()
        data = fav.to_dict()
        assert data["title"] == "Peponi"
        assert data["artist"]["name"] == "Sauti Sol"
        assert data["isrc"] == "KE001"

    def test_repr(self, session, user):
        fav = Favorite(user_id=user.id, title="My Song",
                       artist_name="Me", isrc="REPR01")
        session.add(fav)
        session.commit()
        assert "My Song" in repr(fav)


# ── Playlist ─

class TestPlaylist:

    def test_create_and_defaults(self, session, user):
        pl = Playlist(name="Chill Vibes", user_id=user.id)
        session.add(pl)
        session.commit()
        assert pl.name == "Chill Vibes"
        assert pl.songs in ([], None)
        assert pl.user.username == "alice"

    def test_with_songs(self, session, user):
        songs = [{"title": "Shape of You", "artist": "Ed Sheeran"}]
        pl = Playlist(name="Pop Hits", user_id=user.id, songs=songs)
        session.add(pl)
        session.commit()
        assert pl.songs[0]["title"] == "Shape of You"

    def test_to_dict(self, session, user):
        pl = Playlist(name="My Mix", description="Evening vibes", user_id=user.id)
        session.add(pl)
        session.commit()
        data = pl.to_dict()
        assert data["name"] == "My Mix"
        assert data["description"] == "Evening vibes"
        assert data["userId"] == user.id
        assert isinstance(data["songs"], list)

    def test_repr(self, session, user):
        pl = Playlist(name="ReprList", user_id=user.id)
        session.add(pl)
        session.commit()
        assert "ReprList" in repr(pl)


# ── Message ──

class TestMessage:

    def test_create_and_defaults(self, session):
        msg = Message(name="Koech", email="koech@test.com", content="Hello!")
        session.add(msg)
        session.commit()
        assert msg.name == "Koech"
        assert msg.is_read is False

    def test_mark_read(self, session):
        msg = Message(name="Reader", email="r@test.com", content="Read me")
        session.add(msg)
        session.commit()
        msg.is_read = True
        session.commit()
        assert session.get(Message, msg.id).is_read is True

    def test_to_dict(self, session):
        msg = Message(name="Dict", email="dict@test.com", content="Content")
        session.add(msg)
        session.commit()
        data = msg.to_dict()
        assert data["name"] == "Dict"
        assert data["isRead"] is False
        assert "createdAt" in data

    def test_repr(self, session):
        msg = Message(name="ReprMsg", email="r@test.com", content="Hi")
        session.add(msg)
        session.commit()
        assert "ReprMsg" in repr(msg)


# ── AuditLog ──

class TestAuditLog:

    @pytest.fixture
    def log(self, session, user):
        entry = AuditLog(user_id=user.id, action="DELETE_USER",
                         target_type="User", target_id=99,
                         details="Deleted user: bob")
        session.add(entry)
        session.commit()
        return entry

    def test_create_and_timestamp(self, log):
        assert log.action == "DELETE_USER"
        assert log.timestamp is not None

    def test_to_dict(self, log, user):
        data = log.to_dict()
        for key in ("id", "user_id", "actor", "action",
                    "target_type", "target_id", "details", "timestamp"):
            assert key in data
        assert data["actor"] == "alice"
        assert isinstance(data["timestamp"], str)

    def test_actor_fallback(self, session):
        log = AuditLog(user_id=9999, action="TEST")
        session.add(log)
        session.commit()
        assert log.to_dict()["actor"] == "User #9999"

    def test_action_required(self, session, user):
        session.add(AuditLog(user_id=user.id))
        with pytest.raises(Exception):
            session.commit()

    def test_multiple_logs(self, session, user):
        for action in ("LOGIN", "UPDATE_PROFILE", "LOGOUT"):
            session.add(AuditLog(user_id=user.id, action=action))
        session.commit()
        assert AuditLog.query.filter_by(user_id=user.id).count() == 3

    def test_repr(self, log, user):
        text = repr(log)
        assert "DELETE_USER" in text
        assert str(user.id) in text