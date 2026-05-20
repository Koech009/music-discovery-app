from extensions import db, bcrypt
from datetime import datetime
from sqlalchemy.ext.hybrid import hybrid_property


class User(db.Model):
    __tablename__ = "users"

    # Core fields
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _password_hash = db.Column("password_hash", db.String(255), nullable=False)
    role = db.Column(db.String(20), default="user")

    # Admin approval
    approved = db.Column(db.Boolean, nullable=False, default=False)

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
    playlists = db.relationship("Playlist", back_populates="user", cascade="all, delete-orphan")
    favorites = db.relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    audit_logs = db.relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.username}>"

    # Hybrid property for password hash
    @hybrid_property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, password: str):
        """Automatically hash plain password when setting."""
        self._password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        """Verify a plain password against the stored hash."""
        return bcrypt.check_password_hash(self._password_hash, password)

    def update_last_login(self):
        """Update last login timestamp."""
        self.last_login = datetime.utcnow()

    def to_dict(self, include_profile=False):
        """Serialize user object safely for JSON responses."""
        data = {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "approved": self.approved,
            "bio": self.bio,
            "avatar_url": self.avatar_url,
            "address": self.address,
            "phone": self.phone,
            "suspended": self.suspended,
            "first_login": self.first_login,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat(),
        }
        if include_profile:
            data["profile"] = {
                "bio": self.bio or "",
                "favourites": [],
                "playlists": []
            }
        return data
