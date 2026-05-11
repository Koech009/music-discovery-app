import { useState, useEffect } from "react";
import axios from "axios";

// const BASE_URL = "http://localhost:3001/favorites";

const BASE_URL = "https://tunely-api.onrender.com/favorites";

export default function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load favorites from db.json on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get(BASE_URL)
      .then((res) => setFavorites(res.data))
      .catch(() => setError("Could not load favorites."))
      .finally(() => setLoading(false));
  }, []);

  // Add a favorite to db.json
  async function addFavorite(song) {
    const alreadyExists = favorites.some(
      (fav) =>
        (fav.isrc && song.isrc && fav.isrc === song.isrc) ||
        (fav.title === song.title && fav.artist.name === song.artist.name),
    );

    if (alreadyExists) {
      return { duplicate: true };
    }

    try {
      const res = await axios.post(BASE_URL, song);
      setFavorites((prev) => [...prev, res.data]);
    } catch {
      setError("Could not save favorite.");
    }
  }

  // Remove a favorite from db.json
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
