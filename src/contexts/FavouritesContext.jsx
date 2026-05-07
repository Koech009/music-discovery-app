import { createContext, useContext, useState } from "react";

//Create the context
const favouritesContext = createContext();

export function favouritesProvider({ children }) {
  const [favourites, setfavourites] = useState([]);

  //Adds a song to favourites
  function addFavorite(song) {
    const alreadyAdded = favourites.find((f) => f.id === song.id);
    if (!alreadyAdded) {
      setfavourites([...favourites, song]);
    }
  }

  //Removes a song from favourites
  function removeFavorite(songId) {
    setfavourites(favourites.filter((f) => f.id !== songId));
  }

  return (
    <favouritesContext.Provider value={{ favourites, addFavorite, removeFavorite }}>
      {children}
    </favouritesContext.Provider>
  );
}

// Custom hook to use favourites anywhere
export function usefavouritesContext() {
  return useContext(favouritesContext);
}