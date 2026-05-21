from app import create_app
from extensions import db
from models.user import User


def seed_data():
    # Don't drop tables in production
    if User.query.filter_by(role='admin').first():
        print("Admins already seeded, skipping.")
        return

    admin1 = User(
        username="TunelyAdmin",
        email="tunelyadmin@tunely.com",
        role="admin",
        suspended=False,
        first_login=True,
        approved=True,
        password_hash="Tunely@123"
    )

    admin2 = User(
        username="Admin04",
        email="admin4@tunely.com",
        role="admin",
        suspended=False,
        bio="rnb lover",
        address="46 ELDORET",
        phone="0741448335",
        approved=True,
        password_hash="Admin4@123"
    )

    db.session.add_all([admin1, admin2])
    db.session.commit()
    print("Admins seeded successfully!")


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        seed_data()
