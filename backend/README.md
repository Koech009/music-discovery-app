# 🎵 Tunely — Backend

> RESTful API powering the Tunely Music Discovery App — user management, authentication, playlists, favourites, messages, and role-based dashboards.

Built with **Flask**, **SQLAlchemy**, **Marshmallow**, and **PostgreSQL**.

**🔗 Live API:** [tunely-backend.onrender.com](https://tunely-backend.onrender.com)

---

## Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Framework  | Flask                       |
| ORM        | Flask-SQLAlchemy            |
| Migrations | Flask-Migrate (Alembic)     |
| Validation | Marshmallow                 |
| Database   | PostgreSQL                  |
| Security   | JWT (Flask-JWT-Extended)    |
| Testing    | Pytest                      |

---

## Features

- 🔐 **JWT authentication** — secure login with access & refresh tokens
- 🔄 **Token refresh & revocation** — full token lifecycle with blocklist support
- 🗂 **JWT audit logs** — admins can track token events (issue, refresh, revoke)
- 📄 **Pagination** — user and message endpoints support paginated responses
- 🛡 **Role-based access control** — separate routes and guards for users and admins
- 👤 **User management** — CRUD operations, password hashing, profile updates
- 🎶 **Playlist management** — create, update, delete playlists tied to user accounts
- ⭐ **Favourites** — save and remove favourite songs per user
- 📩 **Message management** — contact form persistence, mark read/unread, delete
- 🔧 **Admin actions** — suspend/unsuspend, promote to admin, approve/reject pending admins, reset passwords

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
JWT_SECRET_KEY=your_jwt_secret
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 5. Initialize the database

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 6. Seed the database

```bash
python seed.py
```

### 7. Run the server

```bash
flask run
# → http://localhost:5000
```

---

## API Endpoints

### Auth

| Method | Endpoint        | Description          | Auth |
|--------|-----------------|----------------------|------|
| POST   | `/auth/signup`  | Register new user    | —    |
| POST   | `/auth/login`   | Login and get tokens | —    |
| POST   | `/auth/refresh` | Refresh access token | JWT  |
| POST   | `/auth/logout`  | Revoke current token | JWT  |

### Users

| Method | Endpoint                     | Description           | Auth  |
|--------|------------------------------|-----------------------|-------|
| GET    | `/users`                     | List all users        | Admin |
| GET    | `/users/:id`                 | Get user profile      | JWT   |
| PATCH  | `/users/:id`                 | Update profile fields | JWT   |
| PATCH  | `/users/:id/change-password` | Change own password   | JWT   |
| DELETE | `/users/:id`                 | Delete account        | JWT   |

### Admin

| Method | Endpoint                           | Description                     | Auth  |
|--------|------------------------------------|---------------------------------|-------|
| GET    | `/admin/users`                     | List all users with details     | Admin |
| PATCH  | `/admin/users/:id/suspend`         | Toggle suspend/unsuspend        | Admin |
| PATCH  | `/admin/users/:id/promote`         | Promote user to admin           | Admin |
| PATCH  | `/admin/users/:id/change-password` | Reset a user's password         | Admin |
| DELETE | `/admin/users/:id`                 | Delete a user                   | Admin |
| GET    | `/admin/admins/pending`            | List pending admin accounts     | Admin |
| PATCH  | `/admin/admins/:id/approve`        | Approve a pending admin         | Admin |
| DELETE | `/admin/admins/:id/reject`         | Reject and remove pending admin | Admin |
| GET    | `/admin/audit`                     | View JWT audit logs (paginated) | Admin |

### Playlists

| Method | Endpoint         | Description          | Auth |
|--------|------------------|----------------------|------|
| GET    | `/playlists`     | Get user's playlists | —    |
| POST   | `/playlists`     | Create a playlist    | —    |
| PATCH  | `/playlists/:id` | Update playlist      | —    |
| DELETE | `/playlists/:id` | Delete playlist      | —    |

### Favourites

| Method | Endpoint         | Description           | Auth |
|--------|------------------|-----------------------|------|
| GET    | `/favorites`     | Get user's favourites | —    |
| POST   | `/favorites`     | Add a favourite song  | —    |
| DELETE | `/favorites/:id` | Remove a favourite    | —    |

### Messages

| Method | Endpoint         | Description                   | Auth  |
|--------|------------------|-------------------------------|-------|
| GET    | `/messages`      | List all messages (paginated) | Admin |
| GET    | `/messages/:id`  | View a single message         | Admin |
| POST   | `/messages`      | Submit via contact form       | —     |
| PATCH  | `/messages/:id`  | Mark as read/unread           | Admin |
| DELETE | `/messages/:id`  | Delete a message              | Admin |

---

## Testing

```bash
pytest
```

Covers:

- User CRUD and authentication flows
- Password hashing and verification with bcrypt
- JWT issue, refresh, revoke and audit log recording
- Playlist creation and updates
- Favourite persistence
- Admin actions (suspend, delete, promote, reset password, approve/reject)
- Message management (mark read/unread, delete)
- Pagination behaviour for users, messages, and audit logs
- Role-based access control enforcement

---

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Consistent API responses | Standardised JSON output using Marshmallow schemas |
| Security monitoring | JWT audit logs track full token lifecycle per user |

---

## Future Improvements


- Admin analytics dashboard (user activity, song trends)
- Email notifications for new contact form messages
- Rate limiting on auth endpoints

---

## License

Built for educational purposes as part of a collaborative learning experience.