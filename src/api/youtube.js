const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const searchYoutubeVideo = async (artist, title) => {
    const query = `${artist} ${title} Official Music Video`;
    const response = await fetch(`${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&key=${API_KEY}&type=video&maxResults=1&key=${API_KEY}`);
    const data = await response.json();

    if (data.items && data.items.length > 0) {return data.items[0].videoId.videoId;}

    return null;
}