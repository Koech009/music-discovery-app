import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")

    DEBUG = False

    @classmethod
    def validate(cls):
        missing = [
            key for key in ("SECRET_KEY", "JWT_SECRET_KEY", "DATABASE_URL")
            if not os.getenv(key)
        ]
        if missing:
            raise RuntimeError(
                f"Missing required environment variables: {', '.join(missing)}")


class DevelopmentConfig(Config):
    DEBUG = True


class TestConfig(Config):
    TESTING = True
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "TEST_DATABASE_URL", "sqlite:///test.db")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(minutes=10)

    @classmethod
    def validate(cls):
        # Skip strict validation in test environment
        pass


class ProductionConfig(Config):
    DEBUG = False

    @classmethod
    def validate(cls):
        super().validate()
        if os.getenv("SECRET_KEY") == "dev-secret-key":
            raise RuntimeError(
                "Insecure SECRET_KEY detected — do not use default keys in production")


# Map FLASK_ENV values to config classes
config_map = {
    "development": DevelopmentConfig,
    "testing": TestConfig,
    "production": ProductionConfig,
}


def get_config():
    env = os.getenv("FLASK_ENV", "development")
    cfg = config_map.get(env, DevelopmentConfig)
    cfg.validate()
    return cfg
