import api from "../utils/api";
import { getAlbum } from "./deezer";

const API_BASE = "/favorites";

// Fetch genre name for a song via Vite proxy → Deezer
export async function fetchGenreForSong(song) {
  try {
    const albumId = song.album?.id;
    if (!albumId) return "Unknown";
    const data = await getAlbum(albumId);
    const genres = data?.genres?.data;
    if (genres && genres.length > 0) return genres[0].name;
    return "Unknown";
  } catch {
    return "Unknown";
  }
}

// Get favorites
export async function getFavorites(userId) {
  try {
    const res = await api.get(API_BASE, {
      params: userId ? { userId } : {},
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to fetch favorites");
  }
}

// Add a favorite
export async function addFavorite(song, userId, genre) {
  try {
    const payload = {
      title: song.title,
      artist_name: song.artist?.name || song.artist_name || "Unknown",
      album_title: song.album?.title || song.album_title || "",
      album_cover: song.album?.cover_small || song.album_cover || "",
      preview_url: song.preview || song.preview_url || "",
      isrc: song.isrc || "",
      genre: genre || "Unknown",
      userId,
    };
    const res = await api.post(API_BASE, payload);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to add favorite");
  }
}

// Remove a favorite
export async function removeFavorite(id) {
  try {
    await api.delete(`${API_BASE}/${id}`);
    return id;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to remove favorite");
  }
}