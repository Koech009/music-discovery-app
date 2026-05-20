# 🎵 Tunely

> Discover music instantly — search songs, watch videos, read lyrics, save favourites, create playlists, and manage accounts with role-based dashboards.

**🔗 Live Demo:** [tunely-app-henna.vercel.app](https://tunely-app-henna.vercel.app)

---

## About

Tunely is a full-stack music discovery web application built collaboratively as a group project. It integrates multiple third-party APIs, uses custom React hooks for state and data management, and connects to a Flask + PostgreSQL backend for persistent favourites, playlists, dashboards, and contact messages.

---

## Features

- 🔍 **Search songs & artists** — powered by the Deezer API
- 📝 **Read lyrics** — with built-in text-to-speech read-aloud
- 🎬 **Watch videos** — embedded YouTube music videos
- ⭐ **Save favourites** — bookmark songs stored in your account
- 🎶 **Create playlists** — organize songs into custom collections tied to your profile
- 👤 **User dashboard** — manage your profile, view favourites and playlists
- 🛡 **Admin dashboard** — suspend/unsuspend accounts, delete users, change passwords, promote to admin, approve or reject pending admin requests
- 📩 **Message management** — admins can view contact form messages, mark read/unread, and delete
- 🔎 **Detailed user view** — admins can view all user details including playlists, favourites, last login, and created date
- 📬 **Contact form** — users can send messages directly to admins
- 📄 **Pagination** — all admin views (users, messages, audit logs, pending accounts) support paginated browsing
- 🔐 **JWT audit logs** — admins can track token lifecycle events (issue, refresh, revoke) for security monitoring
- 🧩 **Custom hooks** — clean, reusable data-fetching and state logic
- ✅ **Tested** — unit and integration tests with Vitest

---

## Tech Stack

| Category   | Technology                          |
|------------|-------------------------------------|
| Frontend   | React + Vite                        |
| Backend    | Flask + SQLAlchemy + Marshmallow    |
| Database   | PostgreSQL                          |
| Testing    | Vitest + React Testing Library      |
| Deployment | Vercel                              |
| APIs       | Deezer, Lyrics.ovh, YouTube Data API |

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Koech009/music-discovery-app.git
cd music-discovery-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Start the development server

```bash
npm run dev
# → http://localhost:5173
```

---

## API Endpoints

| Resource  | Endpoint            | Purpose                            |
|-----------|---------------------|------------------------------------|
| Users     | `/api/users`        | Manage accounts & profiles         |
| Auth      | `/api/auth`         | Signup, login & token refresh      |
| Playlists | `/api/playlists`    | Create & manage playlists          |
| Favorites | `/api/favorites`    | Save & remove favourites           |
| Admin     | `/api/admin/users`  | Suspend, delete, promote users     |
| Messages  | `/api/messages`     | Manage contact form messages       |
| Audit     | `/api/admin/audit`  | JWT audit logs & security tracking |

---

## Project Structure

```
music-discovery-app/
├── api/                  # Vercel serverless proxy functions
├── backend/              # Flask + PostgreSQL backend
│   ├── models/           # SQLAlchemy models
│   ├── routes/           # Flask route blueprints
│   └── seed.py           # Database seeder
├── src/
│   ├── api/              # API call functions
│   ├── components/       # Reusable UI components (Pagination, Navbar, etc.)
│   ├── contexts/         # React context providers (Auth)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # App pages (Dashboards, Auth, Search, About, Contact)
│   ├── styles/           # CSS stylesheets
│   └── tests/            # Unit and integration tests
├── public/
├── vercel.json           # Vercel routing config
├── vite.config.js        # Vite + proxy config
└── package.json
```

---

## Testing

Tests are written with Vitest and React Testing Library, covering:

- Custom hook behaviour
- API request handling (backend + Vercel proxies)
- Component rendering
- Favourites persistence
- Playlist creation and updates
- User dashboard profile updates
- Admin dashboard user management actions
- Admin message management (mark read/unread, delete)
- Error state handling
- Pagination behaviour in admin views
- JWT audit log recording and retrieval

---

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| CORS errors on third-party APIs | Vite proxy (local) + Vercel serverless functions (production) |
| Backend integration with frontend | `VITE_API_BASE_URL` env variable with axios instance |

---

## Future Improvements

- Playlist sharing between users
- Admin analytics dashboard (user activity, song trends)
- Mobile-first UI redesign
- Real-time notifications for admin actions

---

## Contributors

- **Ian Kipchirchir**
- **Eugene Ogutu**
- **Terrence Ochieng**
- **Marshal Wayne**

---

## License

Built for educational purposes as part of a collaborative learning experience.