from extensions import db
from datetime import datetime


class User(db.Model):
    __tablename__ = 'users'

    # Core fields
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')

    # Profile fields
    bio = db.Column(db.Text)
    avatar_url = db.Column(db.String(255))
    address = db.Column(db.String(255))
    phone = db.Column(db.String(20))

    # Status fields
    suspended = db.Column(db.Boolean, default=False)
    first_login = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime, nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    playlists = db.relationship(
        'Playlist',
        back_populates='user',
        cascade='all, delete-orphan'
    )
    favorites = db.relationship(
        'Favorite',
        back_populates='user',
        cascade='all, delete-orphan'
    )

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        """Serialize user object into dictionary for JSON responses."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'address': self.address,
            'phone': self.phone,
            'suspended': self.suspended,
            'first_login': self.first_login,
            'lastLogin': self.last_login.isoformat() if self.last_login else None,
            'createdAt': self.created_at.isoformat(),
            'profile': {
                'bio': self.bio or '',
                'favourites': [],
                'playlists': []
            }
        }
