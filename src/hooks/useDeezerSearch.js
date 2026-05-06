import { useState } from "react";
import { searchDeezer } from "../api/deezer.js";

// Custom hook to search for songs via the Deezer API
function useDeezerSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Triggers a Deezer search and updates state with results
  const search = async (query) => {
    try {
      setLoading(true);
      // Clear previous errors before each new search
      setError(null);
      const data = await searchDeezer(query);
      // If no results returned, inform the user
      if (data.length === 0) {
        setError("No songs found.");
      }
      setResults(data);
    } finally {
      // Always reset loading regardless of success or failure
      setLoading(false);
    }
  };

  return { results, loading, error, search };
}

export default useDeezerSearch;
