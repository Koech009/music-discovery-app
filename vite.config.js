import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const backendUrl = env.VITE_API_BASE_URL || "http://localhost:5000";

  return {
    plugins: [react()],
    oxc: false,
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/tests/setup.js",
    },
    server: {
      proxy: {
        "/api/auth": { target: backendUrl, changeOrigin: true },
        "/api/users": { target: backendUrl, changeOrigin: true },
        "/api/playlists": { target: backendUrl, changeOrigin: true },
        "/api/favorites": { target: backendUrl, changeOrigin: true },
        "/api/messages": { target: backendUrl, changeOrigin: true },
        "/api/admin": { target: backendUrl, changeOrigin: true },
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
<<<<<<< HEAD
  },
});
=======
  };
});
>>>>>>> c604434442535f8d6a756937f015191153723774
