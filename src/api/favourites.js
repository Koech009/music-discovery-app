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
  const res = await axios.get(`${API_BASE}/favorites?userId=${userId}`);
  return res.data;
}

export async function addFavorite(song, userId, genre) {
  const res = await axios.post(`${API_BASE}/favorites`, {
    ...song,
    userId,
    genre,
    addedAt: new Date().toISOString(),
  });
  return res.data;
}

export async function removeFavorite(id) {
  await axios.delete(`${API_BASE}/favorites/${id}`);
  return id;
}
