# 🎵 Tunely

> Discover music instantly — search songs, watch videos, read lyrics, and save your favourites all in one place.

🔗 **Live Demo:** [tunely-app-henna.vercel.app](https://tunely-app-henna.vercel.app)

---

## 📖 About

**Tunely** is a React + Vite music discovery web application built collaboratively as part of a group project. It integrates multiple third-party APIs, uses custom React hooks for state and data management, and includes automated tests for reliability.

---

## 🚀 Features

- **Search** songs and artists powered by the Deezer API
- **Read Lyrics** with built-in text-to-speech read-aloud
- **Watch Videos** — embedded YouTube music videos
- **Save Favourites** — bookmark songs you love
- **Custom Hooks** — clean, reusable data-fetching logic
- **Tested** — unit and integration tests with Vitest
- **Deployed** on Vercel with serverless API proxies

---

## 🛠️ Tech Stack

| Category        | Technology                           |
| --------------- | ------------------------------------ |
| Frontend        | React + Vite                         |
| Testing         | Vitest + React Testing Library       |
| Deployment      | Vercel                               |
| Version Control | Git & GitHub                         |
| APIs            | Deezer, Lyrics.ovh, YouTube Data API |

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Koech009/music-discovery-app.git
cd music-discovery-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

### 4. Start the Development Server

```bash
npm run dev
```

App runs on `http://localhost:5173`

### 5. Run Tests

```bash
npm test
```

---

## 🌐 API Architecture

All API calls are routed through proxies to avoid CORS issues and network restrictions.

| API              | Proxy Endpoint | Purpose                |
| ---------------- | -------------- | ---------------------- |
| Deezer           | `/api/deezer`  | Search songs & artists |
| Lyrics.ovh       | `/api/lyrics`  | Fetch song lyrics      |
| YouTube Data API | `/api/youtube` | Fetch music videos     |

- **Locally** — Vite dev server proxies requests via `vite.config.js`
- **Production** — Vercel serverless functions in `/api` handle proxying

---

## 📂 Project Structure

music-discovery-app/
│
├── api/ # Vercel serverless proxy functions
│ ├── deezer.js
│ ├── lyrics.js
│ └── youtube.js
│
├── src/
│ ├── api/ # API call functions
│ ├── components/ # Reusable UI components
│ ├── hooks/ # Custom React hooks
│ ├── pages/ # Application pages
│ ├── styles/ # CSS stylesheets
│ └── tests/ # Unit and integration tests
│
├── public/
├── vercel.json # Vercel routing config
├── vite.config.js # Vite + proxy config
├── package.json
└── README.md

---

## 🧪 Testing

Tests are written with **Vitest** and **React Testing Library**.

**Configuration:**

- Environment: `jsdom`
- Globals: `true`
- Setup file: `./src/tests/setup.js`

**Covered:**

- Custom hook behaviour
- API request handling
- Component rendering
- Favourites functionality
- Error state handling

---

## 🔀 Git Workflow

The project followed a collaborative Git workflow:

- Feature branches per developer
- Pull requests for code review
- Merge conflict resolution
- Conventional commit messages

**Example branches:**
feature/hooks-test
feature/deezer-api
feature/lyrics
fix/post-merge-integration

---

## ⚠️ Challenges & Solutions

| Challenge                            | Solution                                                      |
| ------------------------------------ | ------------------------------------------------------------- |
| CORS errors on Deezer & Lyrics APIs  | Vite proxy (local) + Vercel serverless functions (production) |
| YouTube API blocked on some networks | Serverless proxy routes requests through Vercel servers       |
| Stale lyrics showing between songs   | Added `clearLyrics()` to reset state before each fetch        |
| YouTube embedding restrictions       | Added `videoEmbeddable=true` param to API search query        |
| React Router 404 on Vercel           | Added SPA fallback rewrite in `vercel.json`                   |

---

## 🐞 Known Issues

- Some songs may not have lyrics available in the Lyrics.ovh database
- YouTube may occasionally return unrelated videos for niche songs
- Favourites are stored in memory and reset on page refresh

---

## 🔮 Future Improvements

- User authentication and persistent accounts
- Backend database for saving favourites
- Improved YouTube search accuracy
- Playlist creation and management

---

## 👥 Contributors

- **Ian Kipchirchir**
- **Eugine Ogutu**
- **Terrence Ochieng**
- **Marshal Wayne**

---

## 📜 License

This project was built for educational purposes as part of a collaborative learning experience.
