import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

<<<<<<< HEAD
  server: {
    proxy: {
      // Proxy for Deezer API 
=======

  // Disable OXC transformer so React plugin handles JSX in .js test files
  oxc: false,

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/__tests__/setup.js",
  },


  server: {
    proxy: {
>>>>>>> 51c42cd6fe62368de6d8608cd11561def4848507
      "/api/deezer": {
        target: "https://api.deezer.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deezer/, ""),
      },
<<<<<<< HEAD
      // Proxy for Lyrics.ovh API 
=======
>>>>>>> 51c42cd6fe62368de6d8608cd11561def4848507
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

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});