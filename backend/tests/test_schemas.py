import pytest
from flask import Flask
from marshmallow import ValidationError
from extensions import db


# ── App context fixture  ───────────────────

@pytest.fixture(scope="module")
def app():
    from config import TestConfig
    from app import create_app
    app = create_app(TestConfig.__dict__)
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture(autouse=True)
def app_ctx(app):
    with app.app_context():
        yield


# ── FAVORITE SCHEMA ───────────────────────────────────────────────────────────

class TestFavoriteSchema:

    def setup_method(self):
        from schemas.favorite_schema import favorite_schema
        self.schema = favorite_schema

    def test_valid_full_payload(self):
        data = {
            "userId": 1,
            "title": "Song Title",
            "artist": {"name": "Artist Name"},
            "album": {"title": "Album Title", "cover_small": "http://cover.jpg"},
            "preview": "http://preview.mp3",
            "isrc": "US1234567890",
            "genre": "Pop"
        }
        result = self.schema.load(data)
        assert result.title == "Song Title"
        assert result.artist_name == "Artist Name"
        assert result.album_title == "Album Title"
        assert result.album_cover == "http://cover.jpg"
        assert result.preview_url == "http://preview.mp3"
        assert result.genre == "Pop"

    def test_pre_load_normalizes_artist_and_album(self):
        data = {
            "title": "Track",
            "artist": {"name": "Band"},
            "album": {"title": "LP", "cover_small": "http://img.jpg"},
            "preview": "http://audio.mp3"
        }
        result = self.schema.load(data)
        assert result.artist_name == "Band"
        assert result.album_title == "LP"
        assert result.preview_url == "http://audio.mp3"

    def test_genre_defaults_to_unknown(self):
        data = {"title": "Song", "artist": {"name": "Artist"}}
        result = self.schema.load(data)
        assert result.genre == "Unknown"

    def test_invalid_user_id_zero(self):
        data = {"userId": 0, "title": "Song", "artist": {"name": "Artist"}}
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "user_id" in str(exc.value.messages).lower(
        ) or "userId" in str(exc.value.messages)

    def test_invalid_user_id_negative(self):
        data = {"userId": -5, "title": "Song", "artist": {"name": "Artist"}}
        with pytest.raises(ValidationError):
            self.schema.load(data)

    def test_missing_title_raises(self):
        data = {"artist": {"name": "Artist"}}
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "title" in exc.value.messages

    def test_missing_artist_name_raises(self):
        data = {"title": "Song"}
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "artist_name" in exc.value.messages

    def test_invalid_preview_url(self):
        data = {
            "title": "Song",
            "artist": {"name": "Artist"},
            "preview": "not-a-url"
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "preview_url" in exc.value.messages

    def test_invalid_album_cover_url(self):
        data = {
            "title": "Song",
            "artist": {"name": "Artist"},
            "album": {"title": "LP", "cover_small": "not-a-url"}
        }
        with pytest.raises(ValidationError):
            self.schema.load(data)

    def test_dump_nests_fields(self):
        from models.favorite import Favorite
        fav = Favorite(
            user_id=1,
            title="Song",
            artist_name="Artist",
            album_title="Album",
            album_cover="http://cover.jpg",
            preview_url="http://preview.mp3",
            isrc="ABC123",
            genre="Jazz"
        )
        data = self.schema.dump(fav)
        assert data["artist"] == {"name": "Artist"}
        assert data["album"]["title"] == "Album"
        assert data["preview"] == "http://preview.mp3"
        assert "artist_name" not in data

    def test_isrc_max_length(self):
        data = {
            "title": "Song",
            "artist": {"name": "Artist"},
            "isrc": "X" * 51  # exceeds max 50
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "isrc" in exc.value.messages


# ── MESSAGE SCHEMA ────────────────────────────────────────────────────────────

class TestMessageSchema:

    def setup_method(self):
        from schemas.message_schema import message_schema
        self.schema = message_schema

    def test_valid_payload_with_message_key(self):
        # Frontend sends 'message', pre_load maps it to 'content'
        data = {
            "name": "John Doe",
            "email": "john@example.com",
            "message": "This is a valid message with enough length."
        }
        result = self.schema.load(data)
        assert result.name == "John Doe"
        assert result.email == "john@example.com"
        assert result.content == "This is a valid message with enough length."

    def test_valid_payload_with_content_key(self):
        data = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "content": "This message uses the content key directly."
        }
        result = self.schema.load(data)
        assert result.content == "This message uses the content key directly."

    def test_content_too_short(self):
        data = {"name": "JD", "email": "jd@example.com", "message": "short"}
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "content" in exc.value.messages

    def test_name_too_short(self):
        data = {
            "name": "J",
            "email": "j@example.com",
            "message": "This is a valid message with enough length."
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "name" in exc.value.messages

    def test_invalid_email(self):
        data = {
            "name": "John",
            "email": "not-an-email",
            "message": "This is a valid message with enough length."
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "email" in exc.value.messages

    def test_missing_required_fields(self):
        with pytest.raises(ValidationError) as exc:
            self.schema.load({})
        assert "name" in exc.value.messages
        assert "email" in exc.value.messages

    def test_whitespace_stripped(self):
        data = {
            "name": "  John  ",
            "email": "john@example.com",
            "content": "  This message has leading and trailing spaces.  "
        }
        result = self.schema.load(data)
        assert result.name == "John"
        assert result.content == "This message has leading and trailing spaces."

    def test_dump_returns_camel_case(self):
        from models.message import Message
        from datetime import datetime
        msg = Message(
            name="John",
            email="john@example.com",
            content="Hello world message here",
            is_read=False,
            created_at=datetime.utcnow()
        )
        data = self.schema.dump(msg)
        assert "isRead" in data
        assert "createdAt" in data
        assert data["isRead"] is False

    def test_content_max_length(self):
        data = {
            "name": "John",
            "email": "john@example.com",
            "content": "A" * 1001  # exceeds max 1000
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "content" in exc.value.messages


# ── PLAYLIST SCHEMA ───────────────────────────────────────────────────────────

class TestPlaylistSchema:

    def setup_method(self):
        from schemas.playlist_schema import playlist_schema
        self.schema = playlist_schema

    def test_valid_full_payload(self):
        data = {
            "name": "My Playlist",
            "description": "Some description",
            "songs": [{"title": "Song1"}, {"title": "Song2"}]
        }
        result = self.schema.load(data)
        assert result.name == "My Playlist"
        assert result.description == "Some description"
        assert len(result.songs) == 2

    def test_songs_defaults_to_empty_list(self):
        data = {"name": "Empty Playlist"}
        result = self.schema.load(data)
        assert result.songs == []

    def test_description_defaults_to_empty_string(self):
        data = {"name": "No Description"}
        result = self.schema.load(data)
        assert result.description == ""

    def test_name_required(self):
        with pytest.raises(ValidationError) as exc:
            self.schema.load({})
        assert "name" in exc.value.messages

    def test_name_empty_string_raises(self):
        # whitespace only — stripped then fails validate
        data = {"name": "   "}
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "name" in exc.value.messages

    def test_name_max_length(self):
        data = {"name": "N" * 121}  # exceeds max 120
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "name" in exc.value.messages

    def test_description_max_length(self):
        data = {"name": "Valid", "description": "D" * 501}
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "description" in exc.value.messages

    def test_whitespace_stripped_from_name(self):
        data = {"name": "  Chill Vibes  "}
        result = self.schema.load(data)
        assert result.name == "Chill Vibes"

    def test_user_id_is_dump_only(self):
        # user_id sent in payload should be ignored (dump_only)
        data = {"name": "Playlist", "user_id": 99}
        result = self.schema.load(data)
        assert result.user_id is None  # not set from load


# ── USER SCHEMA ───────────────────────────────────────────────────────────────

class TestUserSchema:

    def setup_method(self):
        from schemas.user_schema import user_schema
        self.schema = user_schema

    def test_valid_full_payload(self):
        data = {
            "username": "ValidUser",
            "email": "user@example.com",
            "password": "StrongPass1!",
            "role": "user",
            "phone": "+1234567890"
        }
        result = self.schema.load(data)
        assert result.username == "ValidUser"
        assert result.role == "user"

    def test_post_load_hashes_password(self):
        data = {
            "username": "HashUser",
            "email": "hash@example.com",
            "password": "StrongPass1!"
        }
        result = self.schema.load(data)
        # password_hash set, plain password removed
        assert result.password_hash is not None
        assert result.check_password("StrongPass1!") is True

    def test_password_too_short(self):
        data = {
            "username": "User",
            "email": "u@example.com",
            "password": "Short1!"
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "password" in exc.value.messages

    def test_password_missing_uppercase(self):
        data = {
            "username": "User",
            "email": "u@example.com",
            "password": "nouppercase1!"
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "password" in exc.value.messages

    def test_password_missing_number(self):
        data = {
            "username": "User",
            "email": "u@example.com",
            "password": "NoNumber!!"
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "password" in exc.value.messages

    def test_password_missing_special_char(self):
        data = {
            "username": "User",
            "email": "u@example.com",
            "password": "NoSpecial1"
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "password" in exc.value.messages

    def test_username_with_spaces_raises(self):
        data = {
            "username": "invalid user",
            "email": "u@example.com",
            "password": "StrongPass1!"
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "username" in exc.value.messages

    def test_username_too_short(self):
        data = {
            "username": "ab",
            "email": "u@example.com",
            "password": "StrongPass1!"
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "username" in exc.value.messages

    def test_invalid_email(self):
        data = {
            "username": "User",
            "email": "not-an-email",
            "password": "StrongPass1!"
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "email" in exc.value.messages

    def test_invalid_phone_too_short(self):
        data = {
            "username": "PhoneUser",
            "email": "phone@example.com",
            "password": "StrongPass1!",
            "phone": "123"
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "phone" in exc.value.messages

    def test_invalid_role(self):
        data = {
            "username": "User",
            "email": "u@example.com",
            "password": "StrongPass1!",
            "role": "superuser"
        }
        with pytest.raises(ValidationError) as exc:
            self.schema.load(data)
        assert "role" in exc.value.messages

    def test_role_defaults_to_user(self):
        data = {
            "username": "DefaultRole",
            "email": "dr@example.com",
            "password": "StrongPass1!"
        }
        result = self.schema.load(data)
        assert result.role == "user"

    def test_password_hash_not_in_dump(self):
        from models.user import User
        user = User(username="dumpuser", email="dump@example.com", role="user")
        user.password_hash = "StrongPass1!"
        data = self.schema.dump(user)
        assert "password" not in data
        assert "_password_hash" not in data
        assert "password_hash" not in data

    def test_admin_role_accepted(self):
        data = {
            "username": "AdminUser",
            "email": "admin@example.com",
            "password": "StrongPass1!",
            "role": "admin"
        }
        result = self.schema.load(data)
        assert result.role == "admin"
