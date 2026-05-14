from extensions import db
from datetime import datetime

class Playlist(db.Model):
    __tablename__ = 'playlists'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='playlists')
    songs = db.relationship('Song', back_populates='playlist', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Playlist {self.name}>'