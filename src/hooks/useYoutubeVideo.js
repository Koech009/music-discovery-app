import { useState } from "react";
import { searchYoutubeVideo } from "../api/youtube";

// Hook to fetch a YouTube video ID for a given artist and song title
function useYoutubeVideo() {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Searches YouTube for an official music video and stores the video ID
  const fetchVideoId = async (artist, title) => {
    // Reset all state before each new fetch
    setLoading(true);
    setError(null);
    setVideoId(null);

    try {
      const id = await searchYoutubeVideo(artist, title);
      if (id) {
        // Store the video ID to be used for embedding or linking
        setVideoId(id);
      } else {
        // API returned successfully but no video was found
        setError("No music video found for this song.");
      }
    } catch {
      // Network or API failure
      setError("Something went wrong while fetching the video.");
    } finally {
      // Always reset loading regardless of outcome
      setLoading(false);
    }
  };

  return { videoId, loading, error, fetchVideoId };
}

export default useYoutubeVideo;
