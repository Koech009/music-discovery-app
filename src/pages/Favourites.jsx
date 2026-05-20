import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import useFavorites from "../hooks/useFavourites";
import Loader from "../components/Loader";
import ErrorMessages from "../components/ErrorMessages";
import Modal from "../components/Modal";
import LyricsReader from "../components/LyricsReader";
import useLyrics from "../hooks/useLyrics";
import "../styles/favourite.css";

export default function Favourites() {
  const { favorites, loading, error, removeFavorite } = useFavorites();
  const {
    lyrics,
    loading: lyricsLoading,
    error: lyricsError,
    getLyrics,
    clearLyrics,
  } = useLyrics();

  const [lyricsSong, setLyricsSong] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeGenre, setActiveGenre] = useState("All");
  const currentAudioRef = useRef(null);

  /* ── Genres that actually appear in THIS user's favorites ── */
  const presentGenres = [
    "All",
    ...new Set(favorites.map((f) => f.genre).filter(Boolean)),
  ];

  /* ── Filtered list ── */
  const displayed =
    activeGenre === "All"
      ? favorites
      : favorites.filter((f) => f.genre === activeGenre);

  /* ── Toast ── */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Audio: only one plays at a time ── */
  const handleAudioPlay = (audioEl) => {
    if (currentAudioRef.current && currentAudioRef.current !== audioEl) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    currentAudioRef.current = audioEl;
  };

  /* ── Lyrics ── */
  const handleOpenLyrics = async (song) => {
    clearLyrics();
    setLyricsSong(song);
    await getLyrics(song.artist?.name, song.title);
  };

  const handleCloseLyrics = () => {
    window.speechSynthesis.cancel();
    setLyricsSong(null);
  };

  /* ── Remove ── */
  const handleRemove = async (song) => {
    try {
      await removeFavorite(song.id);
      showToast(`💔 "${song.title}" removed from favourites.`);
    } catch {
      showToast(`Could not remove "${song.title}". Please try again.`);
    }
  };

  if (loading)
    return (
      <div className="page-container">
        <Loader />
      </div>
    );

  return (
    <div className="page-container">
      {toast && <div className="toast">{toast}</div>}
      {error && <ErrorMessages message={error} />}

      <div className="page-header">
        <h1 className="page-title">My Favourites</h1>
        <p className="page-subtitle">
          Songs you've saved to your personal library.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <span>💔</span>
          <p>No favourites saved yet.</p>
          <small>Search for songs and click ❤️ to save them here.</small>
        </div>
      ) : (
        <>
          {/* ── Genre filter bar — only shows if user has 2+ genres ── */}
          {presentGenres.length > 1 && (
            <div className="fav-genre-bar">
              {presentGenres.map((g) => (
                <button
                  key={g}
                  className={`fav-genre-btn ${activeGenre === g ? "active" : ""}`}
                  onClick={() => setActiveGenre(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          <p className="page-subtitle">
            {displayed.length} song{displayed.length !== 1 ? "s" : ""}
            {activeGenre !== "All" && ` in ${activeGenre}`}
          </p>

          {displayed.length === 0 ? (
            <div className="empty-state">
              <span>🎵</span>
              <p>
                No favourites in <strong>{activeGenre}</strong> yet.
              </p>
            </div>
          ) : (
            <div className="favourites-list">
              {displayed.map((song) => (
                <div key={song.id} className="favourite-card">
                  {song.album?.cover_small && (
                    <img
                      src={song.album.cover_small}
                      alt={song.title}
                      className="favourite-card__art"
                    />
                  )}

                  <div className="favourite-card__info">
                    <span className="favourite-title">{song.title}</span>
                    <span className="favourite-artist">
                      {song.artist?.name}
                    </span>
                    {song.genre && song.genre !== "Unknown" && (
                      <span className="favourite-genre-badge">
                        {song.genre}
                      </span>
                    )}
                  </div>

                  {song.preview && (
                    <audio
                      className="favourite-card__audio"
                      controls
                      src={song.preview}
                      onPlay={(e) => handleAudioPlay(e.currentTarget)}
                    />
                  )}

                  <div className="favourite-card__actions">
                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={() => handleOpenLyrics(song)}
                    >
                      📄 Lyrics
                    </button>
                    <Link
                      to={`/dashboard/video/${song.artist?.name}/${song.title}`}
                      className="btn btn--secondary btn--sm"
                    >
                      🎬 Video
                    </Link>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => handleRemove(song)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {lyricsSong && (
        <Modal isOpen={true} onClose={handleCloseLyrics}>
          <h2>
            {lyricsSong.title} — {lyricsSong.artist?.name}
          </h2>
          {lyricsLoading && <Loader />}
          {lyricsError && <ErrorMessages message={lyricsError} />}
          {!lyricsError && !lyricsLoading && lyrics && (
            <LyricsReader lyrics={lyrics} />
          )}
        </Modal>
      )}
    </div>
  );
}
