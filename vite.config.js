import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test:{
    //Added test configuration
    environment: "jsdom",
    globals:true,
    setupFiles: "./src/__tests__/setup.js"
  },
  server: {
    proxy: {
      // Proxy for Deezer API
      "/api/deezer": {
        target: "https://api.deezer.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deezer/, ""),
      },
      // Proxy for Lyrics.ovh API
      "/api/lyrics": {
        target: "https://api.lyrics.ovh/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/lyrics/, ""),
      },
      // Proxy for YouTube Data API
      "/api/youtube": {
        target: "https://www.googleapis.com/youtube/v3",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/youtube/, ""),
      },
    },
  },
});
