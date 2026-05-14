import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  oxc: false,

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.js",
  },

  server: {
    proxy: {
      // Flask backend
      "/api/auth": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/api/users": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/api/playlists": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/api/favorites": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/api/messages": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/api/admin": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },

      // External APIs
      "/api/deezer": {
        target: "https://api.deezer.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deezer/, ""),
      },
      "/api/lyrics": {
        target: "https://api.lyrics.ovh/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/lyrics/, ""),
      },
      "/api/youtube": {
        target: "https://www.googleapis.com/youtube/v3",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/youtube/, ""),
      },
    },
  },
});
