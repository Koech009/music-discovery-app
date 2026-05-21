import pytest
from models.user import User
from models.favorite import Favorite
from models.playlist import Playlist
from models.message import Message
from models.audit_log import AuditLog


# ──────────────────────────────────────────────
# USER TESTS
# ──────────────────────────────────────────────

class TestUserModel:

    def test_create_user(self, session):
        user = User(username="koech", email="koech@example.com")
        user.password_hash = "plainpassword"
        session.add(user)
        session.commit()

        fetched = session.get(User, user.id)
        assert fetched.username == "koech"
        assert fetched.email == "koech@example.com"
        assert fetched.role == "user"

    def test_user_default_role(self, session):
        user = User(username="jane", email="jane@example.com")
        user.password_hash = "pw"
        session.add(user)
        session.commit()
        assert user.role == "user"

    def test_user_admin_role(self, session):
        admin = User(username="admin", email="admin@example.com", role="admin")
        admin.password_hash = "pw"
        session.add(admin)
        session.commit()
        assert admin.role == "admin"

    def test_user_defaults(self, session):
        user = User(username="defaults", email="defaults@example.com")
        user.password_hash = "pw"
        session.add(user)
        session.commit()
        assert user.suspended is False
        assert user.first_login is True
        assert user.last_login is None

    def test_user_password_hashed(self, session):
        user = User(username="hashtest", email="hash@example.com")
        user.password_hash = "plaintext"
        session.add(user)
        session.commit()
        # Hash should never equal the plain password
        assert user.password_hash != "plaintext"
        assert user.check_password("plaintext") is True
        assert user.check_password("wrongpassword") is False

    def test_user_unique_username(self, session):
        u1 = User(username="same", email="one@example.com")
        u1.password_hash = "pw"
        u2 = User(username="same", email="two@example.com")
        u2.password_hash = "pw"
        session.add(u1)
        session.commit()
        session.add(u2)
        with pytest.raises(Exception):
            session.commit()
        session.rollback()

    def test_user_unique_email(self, session):
        u1 = User(username="user1", email="same@example.com")
        u1.password_hash = "pw"
        u2 = User(username="user2", email="same@example.com")
        u2.password_hash = "pw"
        session.add(u1)
        session.commit()
        session.add(u2)
        with pytest.raises(Exception):
            session.commit()
        session.rollback()

    def test_user_to_dict(self, session):
        user = User(username="dictuser", email="dict@example.com")
        user.password_hash = "pw"
        session.add(user)
        session.commit()

        data = user.to_dict()
        assert data["username"] == "dictuser"
        assert data["email"] == "dict@example.com"
        assert data["role"] == "user"
        assert "password_hash" not in data

    def test_user_to_dict_include_profile(self, session):
        user = User(username="profileuser", email="profile@example.com")
        user.password_hash = "pw"
        session.add(user)
        session.commit()

        data = user.to_dict(include_profile=True)
        assert "profile" in data
        assert data["profile"]["bio"] == ""
        assert isinstance(data["profile"]["favourites"], list)
        assert isinstance(data["profile"]["playlists"], list)

    def test_user_update_last_login(self, session):
        user = User(username="loginuser", email="login@example.com")
        user.password_hash = "pw"
        session.add(user)
        session.commit()

        assert user.last_login is None
        user.update_last_login()
        session.commit()
        assert user.last_login is not None

    def test_user_repr(self, session):
        user = User(username="repruser", email="repr@example.com")
        user.password_hash = "pw"
        session.add(user)
        session.commit()
        assert "repruser" in repr(user)


# ──────────────────────────────────────────────
# FAVORITE TESTS
# ──────────────────────────────────────────────

class TestFavoriteModel:

    def _make_user(self, session, username, email):
        user = User(username=username, email=email)
        user.password_hash = "pw"
        session.add(user)
        session.commit()
        return user

    def test_create_favorite(self, session):
        user = self._make_user(session, "favuser", "fav@example.com")
        fav = Favorite(
            user_id=user.id,
            title="Blinding Lights",
            artist_name="The Weeknd",
            isrc="USUG12004416"
        )
        session.add(fav)
        session.commit()

        fetched = session.get(Favorite, fav.id)
        assert fetched.title == "Blinding Lights"
        assert fetched.artist_name == "The Weeknd"

    def test_favorite_default_genre(self, session):
        user = self._make_user(session, "genreuser", "genre@example.com")
        fav = Favorite(user_id=user.id, title="Song",
                       artist_name="Artist", isrc="ISRC001")
        session.add(fav)
        session.commit()
        assert fav.genre == "Unknown"

    def test_favorite_unique_constraint(self, session):
        user = self._make_user(session, "uniqfav", "uniqfav@example.com")
        fav1 = Favorite(user_id=user.id, title="Song",
                        artist_name="Artist", isrc="ISRC999")
        fav2 = Favorite(user_id=user.id, title="Song",
                        artist_name="Artist", isrc="ISRC999")
        session.add(fav1)
        session.commit()
        session.add(fav2)
        with pytest.raises(Exception):
            session.commit()
        session.rollback()

    def test_favorite_to_dict(self, session):
        user = self._make_user(session, "dictfav", "dictfav@example.com")
        fav = Favorite(
            user_id=user.id,
            title="Peponi",
            artist_name="Sauti Sol",
            album_title="Live and Die in Afrika",
            album_cover="http://cover.url",
            isrc="KE001"
        )
        session.add(fav)
        session.commit()

        data = fav.to_dict()
        assert data["title"] == "Peponi"
        assert data["artist"]["name"] == "Sauti Sol"
        assert data["album"]["title"] == "Live and Die in Afrika"
        assert data["isrc"] == "KE001"
        assert data["genre"] == "Unknown"
        assert "addedAt" in data

    def test_favorite_user_relationship(self, session):
        user = self._make_user(session, "reluser", "rel@example.com")
        fav = Favorite(user_id=user.id, title="Track",
                       artist_name="Artist", isrc="REL001")
        session.add(fav)
        session.commit()
        assert fav.user.username == "reluser"

    def test_favorite_repr(self, session):
        user = self._make_user(session, "reprfav", "reprfav@example.com")
        fav = Favorite(user_id=user.id, title="My Song",
                       artist_name="Me", isrc="REPR01")
        session.add(fav)
        session.commit()
        assert "My Song" in repr(fav)


# ──────────────────────────────────────────────
# PLAYLIST TESTS
# ──────────────────────────────────────────────

class TestPlaylistModel:

    def _make_user(self, session, username, email):
        user = User(username=username, email=email)
        user.password_hash = "pw"
        session.add(user)
        session.commit()
        return user

    def test_create_playlist(self, session):
        user = self._make_user(session, "pluser", "pl@example.com")
        pl = Playlist(name="Chill Vibes", user_id=user.id)
        session.add(pl)
        session.commit()

        fetched = session.get(Playlist, pl.id)
        assert fetched.name == "Chill Vibes"
        assert fetched.user_id == user.id

    def test_playlist_default_songs(self, session):
        user = self._make_user(session, "songsuser", "songs@example.com")
        pl = Playlist(name="Empty", user_id=user.id)
        session.add(pl)
        session.commit()
        assert pl.songs == [] or pl.songs is None

    def test_playlist_with_songs(self, session):
        user = self._make_user(session, "songdata", "songdata@example.com")
        songs = [{"title": "Shape of You", "artist": "Ed Sheeran"}]
        pl = Playlist(name="Pop Hits", user_id=user.id, songs=songs)
        session.add(pl)
        session.commit()

        fetched = session.get(Playlist, pl.id)
        assert len(fetched.songs) == 1
        assert fetched.songs[0]["title"] == "Shape of You"

    def test_playlist_to_dict(self, session):
        user = self._make_user(session, "dictpl", "dictpl@example.com")
        pl = Playlist(name="My Mix", description="Evening vibes",
                      user_id=user.id)
        session.add(pl)
        session.commit()

        data = pl.to_dict()
        assert data["name"] == "My Mix"
        assert data["description"] == "Evening vibes"
        assert data["userId"] == user.id
        assert isinstance(data["songs"], list)
        assert "createdAt" in data

    def test_playlist_user_relationship(self, session):
        user = self._make_user(session, "plreluser", "plrel@example.com")
        pl = Playlist(name="Linked", user_id=user.id)
        session.add(pl)
        session.commit()
        assert pl.user.username == "plreluser"

    def test_playlist_repr(self, session):
        user = self._make_user(session, "reprpl", "reprpl@example.com")
        pl = Playlist(name="ReprList", user_id=user.id)
        session.add(pl)
        session.commit()
        assert "ReprList" in repr(pl)


# ──────────────────────────────────────────────
# MESSAGE TESTS
# ──────────────────────────────────────────────

class TestMessageModel:

    def test_create_message(self, session):
        msg = Message(name="Koech", email="koech@example.com",
                      content="Hello there!")
        session.add(msg)
        session.commit()

        fetched = session.get(Message, msg.id)
        assert fetched.name == "Koech"
        assert fetched.content == "Hello there!"

    def test_message_default_is_read(self, session):
        msg = Message(name="Anon", email="anon@example.com", content="Test")
        session.add(msg)
        session.commit()
        assert msg.is_read is False

    def test_message_mark_read(self, session):
        msg = Message(name="Reader", email="read@example.com",
                      content="Read me")
        session.add(msg)
        session.commit()

        msg.is_read = True
        session.commit()

        fetched = session.get(Message, msg.id)
        assert fetched.is_read is True

    def test_message_to_dict(self, session):
        msg = Message(name="Dict", email="dict@example.com",
                      content="Dict content")
        session.add(msg)
        session.commit()

        data = msg.to_dict()
        assert data["name"] == "Dict"
        assert data["email"] == "dict@example.com"
        assert data["content"] == "Dict content"
        assert data["isRead"] is False
        assert "createdAt" in data

    def test_message_repr(self, session):
        msg = Message(name="ReprMsg", email="repr@example.com", content="Hi")
        session.add(msg)
        session.commit()
        assert "ReprMsg" in repr(msg)

    # ──────────────────────────────────────────────
# AUDIT LOG TESTS
# ──────────────────────────────────────────────


class TestAuditLogModel:

    def _make_user(self, session, username, email):
        user = User(username=username, email=email)
        user.password_hash = "pw"
        session.add(user)
        session.commit()
        return user

    def test_create_audit_log(self, session):
        user = self._make_user(session, "audituser", "audit@example.com")
        log = AuditLog(
            user_id=user.id,
            action="LOGIN",
            target_type="User",
            target_id=user.id,
            details="audituser logged in"
        )
        session.add(log)
        session.commit()

        fetched = session.get(AuditLog, log.id)
        assert fetched.action == "LOGIN"
        assert fetched.user_id == user.id
        assert fetched.details == "audituser logged in"

    def test_audit_log_target_type_and_id(self, session):
        user = self._make_user(session, "targetuser", "target@example.com")
        log = AuditLog(
            user_id=user.id,
            action="DELETE_MESSAGE",
            target_type="Message",
            target_id=42,
            details="Deleted message from someone@example.com"
        )
        session.add(log)
        session.commit()

        fetched = session.get(AuditLog, log.id)
        assert fetched.target_type == "Message"
        assert fetched.target_id == 42

    def test_audit_log_timestamp_auto_set(self, session):
        user = self._make_user(session, "tsuser", "ts@example.com")
        log = AuditLog(
            user_id=user.id,
            action="SIGNUP",
            target_type="User",
            target_id=user.id,
            details="New user account created"
        )
        session.add(log)
        session.commit()
        assert log.timestamp is not None

    def test_audit_log_user_relationship(self, session):
        user = self._make_user(session, "relaudit", "relaudit@example.com")
        log = AuditLog(
            user_id=user.id,
            action="LOGOUT",
            target_type="User",
            target_id=user.id,
            details="relaudit logged out"
        )
        session.add(log)
        session.commit()
        assert log.user.username == "relaudit"

    def test_audit_log_to_dict(self, session):
        user = self._make_user(session, "dictaudit", "dictaudit@example.com")
        log = AuditLog(
            user_id=user.id,
            action="MARK_MESSAGE_READ",
            target_type="Message",
            target_id=7,
            details="Message from someone marked as read"
        )
        session.add(log)
        session.commit()

        data = log.to_dict()
        assert data["user_id"] == user.id
        assert data["actor"] == "dictaudit"   # resolved from relationship
        assert data["action"] == "MARK_MESSAGE_READ"
        assert data["target_type"] == "Message"
        assert data["target_id"] == 7
        assert data["details"] == "Message from someone marked as read"
        assert "timestamp" in data

    def test_audit_log_multiple_entries_for_user(self, session):
        user = self._make_user(session, "multiaudit", "multi@example.com")
        actions = ["SIGNUP", "LOGIN", "LOGOUT"]
        for action in actions:
            log = AuditLog(
                user_id=user.id,
                action=action,
                target_type="User",
                target_id=user.id,
                details=f"{action} event"
            )
            session.add(log)
        session.commit()

        logs = AuditLog.query.filter_by(user_id=user.id).all()
        assert len(logs) == 3
        assert {l.action for l in logs} == {"SIGNUP", "LOGIN", "LOGOUT"}

    def test_audit_log_repr(self, session):
        user = self._make_user(session, "repraudit", "repraudit@example.com")
        log = AuditLog(
            user_id=user.id,
            action="DELETE_USER",
            target_type="User",
            target_id=user.id,
            details="User deleted"
        )
        session.add(log)
        session.commit()
        assert "DELETE_USER" in repr(log)
        assert str(user.id) in repr(log)
