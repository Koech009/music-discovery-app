from app import create_app
from extensions import db
from models.user import User
from models.playlist import Playlist
from models.favorite import Favorite
from models.message import Message


def seed_data():
    db.drop_all()
    db.create_all()

    # Users
    admin = User(
        username="TunelyAdmin",
        email="tunelyadmin@tunely.com",
        role="admin",
        suspended=False,
        first_login=True,
        approved=True,
        password_hash="Tunely@123"
    )

    user1 = User(
        username="Joseph",
        email="jose@tunely.com",
        role="user",
        suspended=False,
        bio="Kenyan music lover",
        address="46 ELDORET",
        phone="0749158455",
        approved=True,
        password_hash="Jose@123"
    )

    user2 = User(
        username="terrence",
        email="terr@tunely.com",
        role="user",
        suspended=False,
        approved=True,
        password_hash="Terr@123"
    )

    user3 = User(
        username="Admin04",
        email="admin4@tunely.com",
        role="admin",
        suspended=False,
        bio="rnb lover",
        address="46 ELDORET",
        phone="0741448335",
        approved=True,
        password_hash="Koech@123"
    )

    db.session.add_all([admin, user1, user2, user3])
    db.session.flush()

    # Playlists
    playlist1 = Playlist(
        name="Late night vibes",
        description="Songs that i listen at night while trying to sleep",
        user_id=admin.id,
        songs=[]
    )
    playlist2 = Playlist(
        name="Kenyan songs",
        description="Kenyan songs that i love",
        user_id=admin.id,
        songs=[]
    )
    playlist3 = Playlist(
        name="Late night vibes",
        description="",
        user_id=user2.id,
        songs=[]
    )

    db.session.add_all([playlist1, playlist2, playlist3])

    # Favorites
    fav1 = Favorite(
        user_id=user1.id,
        title="Malaika",
        artist_name="Nyashinski",
        album_title="Malaika",
        album_cover="https://cdn-images.dzcdn.net/images/cover/0e33fee3141900e69f9d7169e59d3cc1/56x56-000000-80-0-0.jpg",
        preview_url="https://cdnt-preview.dzcdn.net/api/1/1/4/4/5/0/445bd140354dfb3924bfe353681d1546.mp3",
        isrc="TCADB1774336",
        genre="African Music"
    )
    fav2 = Favorite(
        user_id=user1.id,
        title="Ghost",
        artist_name="Halsey",
        album_title="BADLANDS (Deluxe)",
        album_cover="https://cdn-images.dzcdn.net/images/cover/47165475d4e74cd6fa98f8b83bd90b68/56x56-000000-80-0-0.jpg",
        preview_url="https://cdnt-preview.dzcdn.net/api/1/1/c/d/1/0/cd1cc3e4800efdaa48aa9137037a9d67.mp3",
        isrc="USUM71502622",
        genre="Alternative"
    )

    db.session.add_all([fav1, fav2])

    # Messages
    msg1 = Message(
        name="Ian Koech",
        email="ian.kipchirchir1@student.moringaschool.com",
        content="hello"
    )
    msg2 = Message(
        name="Ian Koech",
        email="iankipchirchir550@gmail.com",
        content="having trouble logging in"
    )

    db.session.add_all([msg1, msg2])
    db.session.commit()
    print(" Database seeded successfully!")


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        seed_data()