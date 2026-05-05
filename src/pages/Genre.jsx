import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [selected, setSelected] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load genres from db.json
  useEffect(() => {
    axios.get("http://localhost:3001/genres").then((res) => setGenres(res.data));
  }, []);

  // When a genre is clicked, filter trending songs by that genre
  function handleGenreClick(genre) {
    setSelected(genre);
    setLoading(true);
    axios
      .get(`http://localhost:3001/trending?genre=${genre}`)
      .then((res) => setSongs(res.data))
      .catch(() => setError("Could not load songs for this genre."))
      .finally(() => setLoading(false));
  }

  return (
    <div>
      <h2>Genres</h2>

      {/* Genre buttons */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        {genres.map((g) => (
          <button
            key={g.id}
            onClick={() => handleGenreClick(g.name)}
            style={{ fontWeight: selected === g.name ? "bold" : "normal" }}
          >
            {g.name}
          </button>
        ))}
      </div>

      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}

      {/* Songs for selected genre */}
      {songs.map((song) => (
        <div key={song.id} style={{ marginBottom: "10px" }}>
          <strong>{song.title}</strong> — {song.artist}
        </div>
      ))}
    </div>
  );
}