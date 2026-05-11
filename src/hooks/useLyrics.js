import { useState } from "react";
import { SearchForLyric } from "../api/lyrics";

function useLyrics() {
  const [lyrics, setLyrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearLyrics = () => {
    setLyrics(null);
    setError(null);
  };

  // Fetches lyrics for a given artist and title
  const getLyrics = async (artist, title) => {
    try {
      setLoading(true);
      setError(null);
      const data = await SearchForLyric(artist, title);
      // lyrics.ovh returns { lyrics: "..." }
      if (data?.lyrics) {
        setLyrics(data.lyrics);
      } else {
        setError("Lyrics not found.");
      }
    } catch {
      setError("Could not fetch lyrics.");
    } finally {
      setLoading(false);
    }
  };

  return { lyrics, loading, error, getLyrics, clearLyrics };
}

export default useLyrics;
