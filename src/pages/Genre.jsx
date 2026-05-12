import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import ErrorMessages from "../components/ErrorMessages";

export default function Genres() {

  // ─── STATE ───────────────────────────────────────────────────────────────
  // genres    → the full list of genre buttons fetched from Deezer on page load
  // selected  → the name of whichever genre button the user last clicked
  // songs     → the list of songs returned for the selected genre
  // loading   → true while waiting for an API response (shows a spinner)
  // error     → holds an error message string if any API call fails
  const [genres, setGenres] = useState([]);
  const [selected, setSelected] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── FETCH GENRES ON MOUNT ───────────────────────────────────────────────
  // useEffect with an empty [] runs once when the component first appears.
  // It calls the Deezer genre endpoint and stores the list in `genres`.
  // If the request fails, it sets an error message instead.
  useEffect(() => {
    axios
      .get("/api/deezer/genre")
      .then((res) => setGenres(res.data.data))
      .catch(() => setError("Could not load genres."));
  }, []);

  // ─── HANDLE GENRE BUTTON CLICK ───────────────────────────────────────────
  // Called whenever the user clicks one of the genre buttons.
  // 1. Marks that genre as "selected" (so its button gets the active style).
  // 2. Shows the spinner and clears any previous error.
  // 3. Fetches the top chart songs for that genre ID from Deezer.
  // 4. Stores the returned songs in state, or sets an error if it fails.
  // 5. Always hides the spinner when done (the `finally` block).
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

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="page-container">

      {/* Page title and subtitle */}
      <div className="page-header">
        <h1>🎸 Genres</h1>
        <p>Browse music by genre.</p>
      </div>

      {/* Show an error banner if any API call failed */}
      {error && <ErrorMessages message={error} />}

      {/* Row of genre buttons — one per genre returned by the API.
          The clicked button gets the "active" CSS class so it looks highlighted. */}
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

      {/* Spinner — only visible while a chart request is in flight */}
      {loading && <Loader />}

      {/* Song list — only rendered once we have songs to show.
          Each card displays the song title and the artist name. */}
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