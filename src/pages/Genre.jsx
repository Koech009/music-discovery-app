import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import ErrorMessages from "../components/ErrorMessages";

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [selected, setSelected] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("/api/deezer/genre")
      .then((res) => setGenres(res.data.data))
      .catch(() => setError("Could not load genres."));
  }, []);

  async function handleGenreClick(genreId, genreName) {
    setSelected(genreName);
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/deezer/chart/${genreId}`);
      setSongs(res.data.tracks.data);
    } catch {
      setError("Could not load songs for this genre.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎸 Genres</h1>
        <p>Browse music by genre.</p>
      </div>

      {error && <ErrorMessages message={error} />}

      <div className="genre-buttons">
        {genres.map((g) => (
          <button
            key={g.id}
            onClick={() => handleGenreClick(g.id, g.name)}
            className={`genre-btn ${selected === g.name ? "active" : ""}`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {loading && <Loader />}

      {songs.length > 0 && (
        <div className="trending-list" style={{ marginTop: "2rem" }}>
          {songs.map((song) => (
            <div key={song.id} className="trending-card">
              <div className="trending-info">
                <span className="trending-title">{song.title}</span>
                <span className="trending-artist">{song.artist.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}