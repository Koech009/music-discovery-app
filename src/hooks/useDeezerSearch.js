import { useState } from "react";
import { searchDeezer } from "../api/deezer.js";

function useDeezerSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchDeezer(query);
      setResults(data);
    } catch (err) {
      setError("Failed to fetch songs.");
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
}

export default useDeezerSearch;
