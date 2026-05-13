from extensions import db
from sqlalchemy import UniqueConstraint

class Favorite(db.Model):
    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=False)

    __table_args__ = (UniqueConstraint('user_id', 'song_id', name='unique_user_song'),)

    user = db.relationship('User', back_populates='favorites')
    song = db.relationship('Song', back_populates='favorites')

    def __repr__(self):
        return f'<Favorite user={self.user_id} song={self.song_id}>'