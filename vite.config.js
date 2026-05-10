import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Disable OXC transformer so React plugin handles JSX in .js test files
  oxc: false,

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.js",
  },

  server: {
    proxy: {
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
