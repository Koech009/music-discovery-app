import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import ErrorMessages from "../components/ErrorMessages";
import useFavorites from "../hooks/useFavourites";
import { usePlaylists } from "../hooks/usePlaylists";
import "../styles/trending-genres.css";

export default function Genres() {
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

  return (
    <div className="page-container">
      {toast && <div className="toast">{toast}</div>}

      <div className="page-header">
        <h1 className="page-title">🎸 Genres</h1>
        <p className="page-subtitle">Browse music by genre.</p>
      </div>

      {error && <ErrorMessages message={error} />}

      {/* Genre pills */}
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

      {/* Songs list */}
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
    </div>
  );
}
