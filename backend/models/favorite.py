from extensions import db
from datetime import datetime
from sqlalchemy import UniqueConstraint


class Favorite(db.Model):
    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Song metadata stored with the favorite
    title = db.Column(db.String(255), nullable=False)
    artist_name = db.Column(db.String(255), nullable=False)
    album_title = db.Column(db.String(255))
    album_cover = db.Column(db.String(500))
    preview_url = db.Column(db.String(500))
    isrc = db.Column(db.String(50))  # unique track identifier
    genre = db.Column(db.String(100), default="Unknown")

    # Timestamp when added
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'isrc', name='unique_user_song'),
    )

    # Relationships
    user = db.relationship('User', back_populates='favorites')

    def __repr__(self):
        return f'<Favorite user={self.user_id} title={self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'title': self.title,
            'artist': {'name': self.artist_name},
            'album': {
                'title': self.album_title,
                'cover_small': self.album_cover
            },
            'preview': self.preview_url,
            'isrc': self.isrc,
            'genre': self.genre,
            'addedAt': self.added_at.isoformat() if self.added_at else None
        }
