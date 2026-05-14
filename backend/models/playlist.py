from extensions import db
from datetime import datetime


class Playlist(db.Model):
    __tablename__ = 'playlists'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, default='')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Songs stored as JSON array of song metadata (title, artist, album, )
    songs = db.Column(db.JSON, default=list)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='playlists')

    def __repr__(self):
        return f'<Playlist {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description or '',
            'userId': self.user_id,
            'songs': self.songs or [],
            'createdAt': self.created_at.isoformat()
        }
