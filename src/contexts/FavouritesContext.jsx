import { createContext, useContext, useState } from "react";

//Create the context
const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  //Adds a song to favorites
  function addFavorite(song) {
    const alreadyAdded = favorites.find((f) => f.id === song.id);
    if (!alreadyAdded) {
      setFavorites([...favorites, song]);
    }
  }

  //Removes a song from favorites
  function removeFavorite(songId) {
    setFavorites(favorites.filter((f) => f.id !== songId));
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Custom hook to use favorites anywhere
export function useFavoritesContext() {
  return useContext(FavoritesContext);
}