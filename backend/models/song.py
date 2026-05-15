from extensions import db

class Song(db.Model):
    __tablename__ = 'songs'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    artist = db.Column(db.String(200), nullable=False)
    api_id = db.Column(db.String(100), nullable=False)
    cover_url = db.Column(db.String(255))
    playlist_id = db.Column(db.Integer, db.ForeignKey('playlists.id'), nullable=True)

    playlist = db.relationship('Playlist', back_populates='songs')
    favorites = db.relationship('Favorite', back_populates='song', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Song {self.title}>'