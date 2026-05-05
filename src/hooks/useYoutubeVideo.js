import {useState} from "react";
import {searchYoutubeVideo} from "../api/youtube";

const useYoutubeVideo = async () => {
    const [videoId, setVideoId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchVideoId = async (artist, title) => {
        setLoading(true);
        setError(null);
        setVideoId(null);

        try {
            const id = await searchYoutubeVideo(artist, title);
            if (id) {
                setVideoId(id);
            } else {
                setError("There's no music video found for this specific song");
            }
        }   catch (err) {
             setError("Something's going wrong while fetching the video");
        } finally {
            setLoading(false);
        }
    };

    return { videoId, loading, error, fetchVideoId };
};

export default useYoutubeVideo