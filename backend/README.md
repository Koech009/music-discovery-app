# 🎵 Tunely — Backend

RESTful API powering the Tunely Music Discovery App — user management, authentication, playlists, favourites, messages, and role-based dashboards.

Built with Flask, SQLAlchemy, Marshmallow, and PostgreSQL.

---

## Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Framework  | Flask                   |
| ORM        | Flask-SQLAlchemy        |
| Migrations | Flask-Migrate (Alembic) |
| Validation | Marshmallow             |
| Database   | PostgreSQL              |
| Testing    | Pytest                  |

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Koech009/music-discovery-app.git
cd music-discovery-app/backend
```

### 2. Create a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the `backend/` directory:

```env
FLASK_APP=app.py
FLASK_ENV=development
SQLALCHEMY_DATABASE_URI=postgresql://postgres:yourpassword@localhost/tunely_db
SECRET_KEY=your_secret_key
```

### 5. Initialize the database

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 6. Run the server

```bash
flask run
# → http://localhost:5000
```

---

## API Endpoints

### Auth

| Method | Endpoint       | Description       |
| ------ | -------------- | ----------------- |
| POST   | `/auth/signup` | Register new user |
| POST   | `/auth/login`  | Login user        |

### Users

| Method | Endpoint                     | Description                                       |
| ------ | ---------------------------- | ------------------------------------------------- |
| GET    | `/users`                     | List all users                                    |
| GET    | `/users/:id`                 | Get user (with playlists, favourites, last login) |
| POST   | `/users`                     | Create user                                       |
| PATCH  | `/users/:id`                 | Update profile                                    |
| PATCH  | `/users/:id/change-password` | Change password                                   |
| DELETE | `/users/:id`                 | Delete user                                       |

### Admin dashboard

| Method | Endpoint                           | Description                                           |
| ------ | ---------------------------------- | ----------------------------------------------------- |
| GET    | `/admin/users`                     | List all users with details                           |
| GET    | `/admin/users/:id`                 | Full user profile (playlists, favourites, last login) |
| PATCH  | `/admin/users/:id/suspend`         | Suspend or unsuspend user                             |
| PATCH  | `/admin/users/:id/promote`         | Promote user to admin                                 |
| PATCH  | `/admin/users/:id/change-password` | Reset user password                                   |
| DELETE | `/admin/users/:id`                 | Delete user                                           |

### Playlists

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/playlists?userId=1` | Get user playlists  |
| GET    | `/playlists/:id`      | Get single playlist |
| POST   | `/playlists`          | Create playlist     |
| PATCH  | `/playlists/:id`      | Update playlist     |
| DELETE | `/playlists/:id`      | Delete playlist     |

### Favourites

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/favorites?userId=1` | Get user favourites |
| POST   | `/favorites`          | Add favourite song  |
| DELETE | `/favorites/:id`      | Remove favourite    |

### Messages

| Method | Endpoint        | Description                     |
| ------ | --------------- | ------------------------------- |
| GET    | `/messages`     | List all messages (admin only)  |
| GET    | `/messages/:id` | View single message             |
| POST   | `/messages`     | Submit message via contact form |
| PATCH  | `/messages/:id` | Mark as read/unread             |
| DELETE | `/messages/:id` | Delete message                  |

---

## Project Structure

backend/
├── app.py # Flask app entry point
├── config.py # Configuration settings
├── extensions.py # db, ma, migrate instances
├── models/ # SQLAlchemy models (User, Playlist, Favorite, Message)
├── routes/ # Blueprints for API endpoints
├── schemas/ # Marshmallow schemas
├── migrations/ # Alembic migration files
├── tests/ # Pytest test cases
└── README.md

---

## Testing

```bash
pytest
```

Covers:

- User CRUD and authentication
- Playlist creation and updates
- Favourite persistence
- Admin dashboard actions (suspend, delete, promote, reset password)
- Message management (mark read/unread, delete)

---

## Challenges & Solutions

| Challenge                          | Solution                                                      |
| ---------------------------------- | ------------------------------------------------------------- |
| Syncing frontend with backend APIs | Standardised JSON responses using Marshmallow schemas         |
| Role-based access control          | Added admin-specific routes with protected actions            |
| Contact form message persistence   | Implemented `Message` model with read/unread toggle           |
| Admin user detail view             | Extended `/admin/users/:id` to include playlists & favourites |

---

## Future Improvements

- JWT authentication for secure sessions
- Role-based route protection in the frontend
- Admin analytics dashboard (user activity, song trends)
- Email notifications for new contact form messages

---

## License

Built for educational purposes as part of a collaborative learning experience.
