import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useYoutubeVideo from "../hooks/useYoutubeVideo.js";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader.jsx";
import ErrorMessages from "../components/ErrorMessages.jsx";
import "../styles/index.css";

function VideoPage() {
  const { artist, title } = useParams();
  const { videoId, loading, error, fetchVideoId } = useYoutubeVideo();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideoId(artist, title);
  }, [artist, title]);

  const handleBack = () => {
    if (!user) return navigate("/dashboard/search"); // not logged in
    if (user.role === "admin") return navigate("/admin/dashboard");
    return navigate("/dashboard/search"); // regular user
  };

  return (
    <div className="page-container">
      {/* Smart back button */}
      <button className="back-btn" onClick={handleBack}>
        ← Back to {user?.role === "admin" ? "Admin Dashboard" : "Search"}
      </button>

      <div className="page-header">
        <h1>{decodeURIComponent(title)}</h1>
        <p>{decodeURIComponent(artist)}</p>
      </div>

      {loading && <Loader />}
      {error && <ErrorMessages message={error} />}

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
