# 🎵 Tunely App

## 📖 Project Description

The **Music Discovery App** is a React + Vite web application that allows users to search for songs, discover artists, view lyrics, and watch related music videos in one place.

The application integrates multiple third-party APIs and uses custom React hooks to manage data fetching and state efficiently. It also includes automated testing using Vitest and React Testing Library to ensure reliability and maintainable code.

This project was built collaboratively using GitHub workflows, feature branches, pull requests, and conflict resolution practices.

---

# 🚀 Features

- 🎶 Search songs and artists using the Deezer API
- 📜 Fetch and display song lyrics
- ▶️ Watch related YouTube music videos
- ❤️ Save favorite songs
- 🪝 Custom React hooks for API handling
- 🧪 Unit and integration testing with Vitest
- ⚡ Fast development environment powered by Vite

---

# 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Testing:** Vitest + React Testing Library
- **Version Control:** Git & GitHub
- **APIs:** Deezer API, Lyrics.ovh API, YouTube Data API

---

# ⚙️ Setup Instructions

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Koech009/music-discovery-app.git
cd music-discovery-app
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Run the Development Server

```bash
npm run dev
```

The app will start on:

```bash
http://localhost:5173
```

---

## 4️⃣ Run Tests

```bash
npm test
```

---

# 🌐 APIs Used & Endpoints

## 🎧 Deezer API

Used for searching songs, artists, and albums.

### Proxy Endpoint

```bash
/api/deezer
```

### Target API

```bash
https://api.deezer.com
```

---

## 📜 Lyrics.ovh API

Used for retrieving song lyrics.

### Proxy Endpoint

```bash
/api/lyrics
```

### Target API

```bash
https://api.lyrics.ovh/v1
```

---

## ▶️ YouTube Data API

Used for fetching related music videos.

### Proxy Endpoint

```bash
/api/youtube
```

### Target API

```bash
https://www.googleapis.com/youtube/v3
```

---

# 📂 Project Structure

```bash
music-discovery-app/
│
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Application pages
│   ├── tests/            # Unit and integration tests
│   ├── __tests__/        # Test setup files
│   └── assets/           # Images and static assets
│
├── public/
├── vite.config.js
├── package.json
└── README.md
```

---

# 🧪 Testing

The project uses **Vitest** and **React Testing Library** for testing.

### Test Configuration

- `environment: "jsdom"`
- `globals: true`
- `setupFiles: "./src/__tests__/setup.js"`

### Tested Features

- Custom hooks
- API requests
- Component rendering
- Favorites functionality
- Error handling

---

# 🔀 GitHub Workflow

The project followed a collaborative Git workflow:

- Feature branches for development
- Pull requests for code review
- Merge conflict resolution in `vite.config.js`
- Local and GitHub-based merging
- Conventional commit practices

Example branches:

```bash
feature/Hooks-test
feature/deezer-api
feature/lyrics
fix/post-merge-integration
```

---

# ⚠️ Challenges Faced

## Merge Conflicts

Conflicts occurred while merging branches

### Resolution

The conflicts were resolved by manually combining:

---

## API Rate Limits

Some APIs, especially YouTube Data API, may temporarily block requests if too many requests are sent within a short period.

---

## Error Handling

Some API responses occasionally return:

- Missing lyrics
- Empty search results
- Delayed responses

---

# 🐞 Known Bugs

- Some songs may not return lyrics from the Lyrics API.
- YouTube results may occasionally return unrelated videos.
- Favorites are not yet persisted after page refresh.
- Some API requests may fail if rate limits are exceeded.

---

# 🔮 Future Improvements

- Add user authentication
- Persist favorites using a backend/database
- Deploy the application online

---

# 👥 Contributors

- Ian Kipchirchir
- Team Members / Collaborators(Eugine,Terrence,Marshal)

---

# 📜 License

This project is for educational purposes and was built as part of a collaborative learning experience.

---

# Running Summary

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test


```
