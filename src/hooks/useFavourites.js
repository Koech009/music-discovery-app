import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL = "http://localhost:3002/favorites";

// const BASE_URL = "https://tunely-api.onrender.com/favorites";

// Fetch genre name for a song via Deezer album endpoint
async function fetchGenreForSong(song) {
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

export default function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load only THIS user's favorites
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    axios
      .get(`${BASE_URL}?userId=${user.id}`)
      .then((res) => setFavorites(res.data))
      .catch(() => setError("Could not load favorites."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Add favorite — fetches + saves genre automatically
  async function addFavorite(song) {
    if (!user?.id) return { notLoggedIn: true };

    const alreadyExists = favorites.some(
      (fav) =>
        (fav.isrc && song.isrc && fav.isrc === song.isrc) ||
        (fav.title === song.title && fav.artist?.name === song.artist?.name),
    );
    if (alreadyExists) return { duplicate: true };

    // Fetch genre before saving
    const genre = await fetchGenreForSong(song);

    try {
      const res = await axios.post(BASE_URL, {
        ...song,
        userId: user.id,
        genre, //  saved with the song
        addedAt: new Date().toISOString(),
      });
      setFavorites((prev) => [...prev, res.data]);
    } catch {
      setError("Could not save favorite.");
    }
  }

  // Remove
  async function removeFavorite(id) {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch {
      setError("Could not remove favorite.");
    }
  }

  return { favorites, loading, error, addFavorite, removeFavorite };
}
