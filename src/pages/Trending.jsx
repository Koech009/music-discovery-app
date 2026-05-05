import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

export default function Trending() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch trending songs from db.json
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:3001/trending")
      .then((res) => setSongs(res.data))
      .catch(() => setError("Could not load trending songs."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h2>Trending Songs</h2>
      {songs.map((song) => (
        <div key={song.id} style={{ marginBottom: "10px" }}>
          <strong>{song.title}</strong> — {song.artist}{" "}
          <span style={{ color: "gray" }}>({song.genre})</span>
        </div>
      ))}
    </div>
  );
}