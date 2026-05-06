import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useYoutubeVideo from "../hooks/useYoutubeVideo.js";
import Loader from "../components/Loader.jsx";
import ErrorMessages from "../components/ErrorMessages.jsx";

function VideoPage() {
  const { artist, title } = useParams();
  const { videoId, loading, error, fetchVideoId } = useYoutubeVideo();
  const navigate = useNavigate();

  // Fetch YouTube video ID on mount using artist and title from URL params
  useEffect(() => {
    fetchVideoId(artist, title);
  }, [artist, title]);

  return (
    <div className="page-container">
      {/* Back button */}
      <button className="back-btn" onClick={() => navigate("/search")}>
        ← Back to Search
      </button>

      {/* Song title and artist — decode URL encoded characters */}
      <div className="page-header">
        <h1>{decodeURIComponent(title)}</h1>
        <p>{decodeURIComponent(artist)}</p>
      </div>

      {/* Loading and error states */}
      {loading && <Loader />}
      {error && <ErrorMessages message={error} />}

      {/* Responsive 16:9 YouTube embed */}
      {videoId && (
        <div className="video-wrapper">
          <iframe
            className="video-iframe"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={`${title} by ${artist}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

export default VideoPage;
