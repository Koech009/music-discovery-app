from app import create_app
from models import db
from models.user import User

app = create_app()

with app.app_context():
    existing = User.query.filter_by(email='admin@tunely.com').first()
    if not existing:
        admin = User(
            username='admin',
            email='admin@tunely.com',
            password='Admin123',
            role='admin',
            first_login=True
        )
        db.session.add(admin)
        db.session.commit()
        print('First admin created: admin@tunely.com / Admin123')
    else:
        print('Admin already exists.')
