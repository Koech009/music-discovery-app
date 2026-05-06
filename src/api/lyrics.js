import axios from "axios";

const BASE_URL = "/api/lyrics";

/**
 * Fetch lyrics via Vite proxy
 * @param {string} artist - Artist name
 * @param {string} title - Song title
 * @returns {Object} { lyrics: string } or throws on error
 */
export const SearchForLyric = async (artist, title) => {
  try {
    const res = await axios.get(`${BASE_URL}/${artist}/${title}`, {
      timeout: 5000,
    });
    return res.data;
  } catch (err) {
    console.error("Lyrics fetch error:", err.message);
    throw new Error("Lyrics service is currently unavailable.");
  }
};
