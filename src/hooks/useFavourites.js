import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getFavorites,
  addFavorite as apiAddFavorite,
  removeFavorite as apiRemoveFavorite,
  fetchGenreForSong,
} from "../api/favourites";

export default function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load only THIS user's favorites
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getFavorites(user.id)
      .then((data) => setFavorites(data))
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

    try {
      const genre = await fetchGenreForSong(song);
      const newFav = await apiAddFavorite(song, user.id, genre);
      setFavorites((prev) => [...prev, newFav]);
    } catch {
      setError("Could not save favorite.");
    }
  }

  // Remove
  async function removeFavorite(id) {
    try {
      await apiRemoveFavorite(id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch {
      setError("Could not remove favorite.");
    }
  }

  return { favorites, loading, error, addFavorite, removeFavorite };
}
