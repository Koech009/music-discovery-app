import pytest
from marshmallow import ValidationError

from schemas.favorite_schema import favorite_schema
from schemas.message_schema import message_schema
from schemas.playlist_schema import playlist_schema
from schemas.user_schema import user_schema


# ---------- FavoriteSchema Tests ----------
def test_favorite_schema_valid():
    data = {
        "userId": 1,
        "title": "Song Title",
        "artist": {"name": "Artist Name"},
        "album": {"title": "Album Title", "cover_small": "http://cover.jpg"},
        "preview": "http://preview.mp3",
        "isrc": "US1234567890",
        "genre": "Pop"
    }
    result = favorite_schema.load(data)
    assert result.user_id == 1
    assert result.title == "Song Title"


def test_favorite_schema_invalid_user_id():
    data = {"userId": 0, "title": "Song", "artist": {"name": "Artist"}}
    with pytest.raises(ValidationError):
        favorite_schema.load(data)


# ---------- MessageSchema Tests ----------
def test_message_schema_valid():
    data = {
        "name": "John Doe",
        "email": "john@example.com",
        "message": "This is a valid message with enough length."
    }
    result = message_schema.load(data)
    assert result.name == "John Doe"
    assert result.email == "john@example.com"


def test_message_schema_invalid_content():
    data = {"name": "JD", "email": "jd@example.com", "message": "short"}
    with pytest.raises(ValidationError):
        message_schema.load(data)


# ---------- PlaylistSchema Tests ----------
def test_playlist_schema_valid():
    data = {
        "userId": 1,
        "name": "My Playlist",
        "description": "Some description",
        "songs": [{"title": "Song1"}, {"title": "Song2"}]
    }
    result = playlist_schema.load(data)
    assert result.name == "My Playlist"
    assert isinstance(result.songs, list)


def test_playlist_schema_invalid_user_id():
    data = {"userId": -1, "name": "Bad Playlist"}
    with pytest.raises(ValidationError):
        playlist_schema.load(data)


# ---------- UserSchema Tests ----------
def test_user_schema_valid():
    data = {
        "username": "ValidUser",
        "email": "user@example.com",
        "password": "StrongPass1!",
        "role": "user",
        "phone": "+1234567890"
    }
    result = user_schema.load(data)
    assert result.username == "ValidUser"
    assert result.role == "user"


def test_user_schema_invalid_password():
    data = {
        "username": "BadUser",
        "email": "bad@example.com",
        "password": "weak",
    }
    with pytest.raises(ValidationError):
        user_schema.load(data)


def test_user_schema_invalid_phone():
    data = {
        "username": "PhoneUser",
        "email": "phone@example.com",
        "password": "StrongPass1!",
        "phone": "123"  # too short
    }
    with pytest.raises(ValidationError):
        user_schema.load(data)
