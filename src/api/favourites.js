import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${baseURL}/api`;

// Fetch genre name for a song via Deezer album endpoint
export async function fetchGenreForSong(song) {
  try {
    const albumId = song.album?.id;
    if (!albumId) return "Unknown";
    const res = await axios.get(`/api/deezer/album/${albumId}`);
    const genres = res.data?.genres?.data;
    if (genres && genres.length > 0) return genres[0].name;
    return "Unknown";
  } catch {
    return "Unknown";
  }
}

export async function getFavorites(userId) {
  try {
    const res = await axios.get(`${API_BASE}/favorites`, {
      params: { userId },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to fetch favorites");
  }
}

export async function addFavorite(song, userId, genre) {
  try {
    const res = await axios.post(`${API_BASE}/favorites`, {
      ...song,
      userId,
      genre,
      addedAt: new Date().toISOString(),
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to add favorite");
  }
}

export async function removeFavorite(id) {
  try {
    await axios.delete(`${API_BASE}/favorites/${id}`);
    return id;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to remove favorite");
  }
}
