import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import ErrorMessages from "../components/ErrorMessages";

export default function Trending() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrending() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/deezer/chart");
        setSongs(res.data.tracks.data);
      } catch {
        setError("Could not load trending songs.");
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessages message={error} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🔥 Trending Now</h1>
        <p>The most popular songs on Deezer right now.</p>
      </div>

      <div className="trending-list">
        {songs.map((song, index) => (
          <div key={song.id} className="trending-card">
            <span className="trending-rank">#{index + 1}</span>
            <div className="trending-info">
              <span className="trending-title">{song.title}</span>
              <span className="trending-artist">{song.artist.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
