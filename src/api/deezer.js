import axios from "axios";

// Base URL points to Vite proxy, which forwards requests to Deezer API.
const BASE_URL = "/api/deezer";

/**
 * Search Deezer by query (artist or song).
 * Deezer's search endpoint accepts both song titles and artist names.
 * @param {string} query - Artist name or song title to search.
 * @returns {Array} List of songs (or empty array if error).
 */
export const searchDeezer = async (query) => {
  try {
    const res = await axios.get(`${BASE_URL}/search?q=${query}`);
    // Deezer returns { data: [...] }
    return res.data.data || [];
  } catch (err) {
    console.error("Deezer search error:", err);
    return [];
  }
};

/**
 * Get details for a specific artist.
 * @param {number|string} id - Deezer artist ID.
 * @returns {Object|null} Artist details (or null if error).
 */
export const getArtist = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/artist/${id}`);
    return res.data;
  } catch (err) {
    console.error("Artist fetch error:", err);
    return null;
  }
};
