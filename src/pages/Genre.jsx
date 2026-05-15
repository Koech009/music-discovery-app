import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import ErrorMessages from "../components/ErrorMessages";
import useFavorites from "../hooks/useFavourites";
import { usePlaylists } from "../hooks/usePlaylists";
import "../styles/trending-genres.css";

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
  const [toast, setToast] = useState(null);

  // Playlist modal
  const [playlistSong, setPlaylistSong] = useState(null);

  const { addFavorite } = useFavorites();
  const { playlists, addSongToPlaylist } = usePlaylists();
  const currentAudioRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAudioPlay = (audioEl) => {
    if (currentAudioRef.current && currentAudioRef.current !== audioEl) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    currentAudioRef.current = audioEl;
  };

  const handleAddFavourite = async (song) => {
    const result = await addFavorite(song);
    if (result?.duplicate) return showToast("⚠️ Already in favourites!");
    if (result?.notLoggedIn) return showToast("⚠️ Please log in first.");
    showToast(`❤️ "${song.title}" added to favourites!`);
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!playlistSong) return;
    try {
      await addSongToPlaylist(playlistSong, playlistId);
      showToast(`✅ "${playlistSong.title}" added to playlist!`);
    } catch {
      showToast("❌ Failed to add to playlist.");
    } finally {
      setPlaylistSong(null);
    }
  };

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
    setSongs([]);
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
<<<<<<< HEAD

      {/* Page title and subtitle */}
=======
      {toast && <div className="toast">{toast}</div>}

>>>>>>> 7f09d01f60e8640f6734a827545997eda38bf4b9
      <div className="page-header">
        <h1 className="page-title">🎸 Genres</h1>
        <p className="page-subtitle">Browse music by genre.</p>
      </div>

      {/* Show an error banner if any API call failed */}
      {error && <ErrorMessages message={error} />}

<<<<<<< HEAD
      {/* Row of genre buttons — one per genre returned by the API.
          The clicked button gets the "active" CSS class so it looks highlighted. */}
=======
      {/* Genre pills */}
>>>>>>> 7f09d01f60e8640f6734a827545997eda38bf4b9
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

<<<<<<< HEAD
      {/* Song list — only rendered once we have songs to show.
          Each card displays the song title and the artist name. */}
=======
      {/* Songs list */}
>>>>>>> 7f09d01f60e8640f6734a827545997eda38bf4b9
      {songs.length > 0 && (
        <div className="trending-list" style={{ marginTop: "1.5rem" }}>
          {songs.map((song) => (
            <div key={song.id} className="trending-card">
              {/* Album art */}
              {song.album?.cover_small && (
                <img
                  src={song.album.cover_small}
                  alt={song.title}
                  className="trending-art"
                />
              )}

              {/* Title + artist */}
              <div className="trending-info">
                <span className="trending-title">{song.title}</span>
                <span className="trending-artist">{song.artist.name}</span>
              </div>

              {/* Audio preview */}
              {song.preview && (
                <audio
                  className="trending-audio"
                  controls
                  src={song.preview}
                  onPlay={(e) => handleAudioPlay(e.currentTarget)}
                />
              )}

              {/* Actions */}
              <div className="trending-actions">
                <button
                  className="btn btn--heart btn--sm"
                  onClick={() => handleAddFavourite(song)}
                  title="Add to Favourites"
                >
                  ❤️
                </button>
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => setPlaylistSong(song)}
                  title="Add to Playlist"
                >
                  ➕
                </button>
                <Link
                  to={`/dashboard/video/${song.artist.name}/${song.title}`}
                  className="btn btn--secondary btn--sm"
                  title="Watch Video"
                >
                  🎬
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

<<<<<<< HEAD
=======
      {/* Playlist picker modal */}
      {playlistSong && (
        <div className="modal-overlay" onClick={() => setPlaylistSong(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Add to Playlist</h3>
            <p className="modal-song-name">"{playlistSong.title}"</p>
            {playlists.length === 0 ? (
              <p className="modal-empty">No playlists yet. Create one first!</p>
            ) : (
              <ul className="modal-playlist-list">
                {playlists.map((pl) => (
                  <li key={pl.id}>
                    <button
                      className="modal-playlist-btn"
                      onClick={() => handleAddToPlaylist(pl.id)}
                    >
                      🎵 {pl.name}
                      <span>{pl.songs.length} songs</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="btn btn--secondary btn--sm modal-close"
              onClick={() => setPlaylistSong(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
>>>>>>> 7f09d01f60e8640f6734a827545997eda38bf4b9
    </div>
  );
}