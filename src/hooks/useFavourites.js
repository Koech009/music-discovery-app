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

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    getFavorites()
      .then((data) => setFavorites(data.favorites ?? data))
      .catch(() => setError("Could not load favorites."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  async function addFavorite(song) {
    if (!user?.id) return { notLoggedIn: true };

    const alreadyExists = favorites.some(
      (fav) =>
        (fav.isrc && song.isrc && fav.isrc === song.isrc) ||
        (fav.title === song.title && fav.artist?.name === song.artist?.name)
    );
    if (alreadyExists) return { duplicate: true };

    setError(null);
    try {
      const genre = await fetchGenreForSong(song);
      const newFav = await apiAddFavorite(song, user.id, genre);
      setFavorites((prev) => [...prev, newFav.favorite ?? newFav]);
    } catch (err) {
      setError("Could not save favorite.");
      throw err;
    }
  }

  async function removeFavorite(id) {
    setError(null);
    try {
      await apiRemoveFavorite(id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError("Could not remove favorite.");
      throw err;
    }
  }

  return { favorites, loading, error, addFavorite, removeFavorite };
}