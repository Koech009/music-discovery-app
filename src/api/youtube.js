import axios from "axios";

// const BASE_URL = "https://www.googleapis.com/youtube/v3";
const BASE_URL = "/api/youtube";
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Named export matches import in useYoutubeVideo.js
export const searchYoutubeVideo = async (artist, title) => {
  try {
    const res = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: "snippet",
        q: `${artist} ${title} Official Music Video`,
        type: "video",
        maxResults: 1,
        key: API_KEY,
        videoEmbeddable: "true",
      },
    });
    // Return the video ID string directly
    return res.data.items?.[0]?.id?.videoId || null;
  } catch (err) {
    console.error("YouTube search error:", err);
    return null;
  }
};
