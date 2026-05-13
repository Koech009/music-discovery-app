import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { usePlaylists } from "../hooks/usePlaylists.js";
import Modal from "../components/Modal.jsx";
import Loader from "../components/Loader.jsx";
import LyricsReader from "../components/LyricsReader.jsx";
import ErrorMessages from "../components/ErrorMessages.jsx";
import useLyrics from "../hooks/useLyrics.js";
import "../styles/playlist.css";

export default function Playlists() {
  const {
    playlists,
    deletePlaylist,
    renamePlaylist,
    removeSongFromPlaylist,
    updatePlaylistDescription,
  } = usePlaylists();

  const {
    lyrics,
    loading: lyricsLoading,
    error: lyricsError,
    getLyrics,
    clearLyrics,
  } = useLyrics();

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  // Lyrics modal
  const [lyricsSong, setLyricsSong] = useState(null);

  // Track which audio is currently playing — store the <audio> DOM element
  const currentAudioRef = useRef(null);

  /* =========================
     TOAST
  ========================= */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  /* =========================
     EDIT
  ========================= */
  const handleStartEdit = (pl) => {
    setEditingId(pl.id);
    setEditName(pl.name);
    setEditDescription(pl.description || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleSaveEdit = async (playlistId) => {
    if (!editName.trim()) {
      showToast("⚠️ Playlist name cannot be empty.");
      return;
    }
    try {
      setSavingId(playlistId);
      await renamePlaylist(playlistId, editName.trim());
      await updatePlaylistDescription(playlistId, editDescription.trim());
      setEditingId(null);
      showToast("✅ Playlist updated!");
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to update playlist.");
    } finally {
      setSavingId(null);
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (playlistId, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deletePlaylist(playlistId);
      if (expandedId === playlistId) setExpandedId(null);
      showToast("🗑️ Playlist deleted.");
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to delete playlist.");
    }
  };

  /* =========================
     REMOVE SONG
  ========================= */
  const handleRemoveSong = async (playlistId, songId, songTitle) => {
    try {
      await removeSongFromPlaylist(songId, playlistId);
      showToast(`🎵 "${songTitle}" removed.`);
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to remove song.");
    }
  };

  /* =========================
     LYRICS
  ========================= */
  const handleOpenLyrics = async (song) => {
    clearLyrics();
    setLyricsSong(song);
    await getLyrics(song.artist?.name, song.title);
  };

  const handleCloseLyrics = () => {
    window.speechSynthesis.cancel();
    setLyricsSong(null);
  };

  /* =========================
     PREVIEW — only one plays at a time
  ========================= */
  const handleAudioPlay = (audioEl) => {
    // Pause the previously playing audio if it's a different element
    if (currentAudioRef.current && currentAudioRef.current !== audioEl) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    currentAudioRef.current = audioEl;
  };

  /* =========================
     LOADING STATE
  ========================= */
  if (playlists === undefined) {
    return (
      <div className="page-container">
        <Loader />
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="page-container">
        <h1 className="page-title">My Playlists</h1>
        <p className="page-empty">
          No playlists yet. Go to Search and click ➕ Add to Playlist!
        </p>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="page-container">
      {toast && <div className="toast">{toast}</div>}

      <h1 className="page-title">My Playlists</h1>
      <p className="page-subtitle">
        {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
      </p>

      <div className="playlist-list">
        {playlists.map((pl) => (
          <div key={pl.id} className="playlist-card">
            <div className="playlist-card__header">
              {/* ── Edit mode ── */}
              {editingId === pl.id ? (
                <div className="playlist-edit-form">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="playlist-input"
                    autoFocus
                  />
                  <label>Description</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="playlist-input"
                    placeholder="Optional description"
                  />
                  <div className="playlist-edit-actions">
                    <button
                      className="btn btn--primary"
                      onClick={() => handleSaveEdit(pl.id)}
                      disabled={savingId === pl.id}
                    >
                      {savingId === pl.id ? "Saving…" : "💾 Save"}
                    </button>
                    <button
                      className="btn btn--secondary"
                      onClick={handleCancelEdit}
                      disabled={savingId === pl.id}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <>
                  <div className="playlist-card__info">
                    <h2 className="playlist-card__name">{pl.name}</h2>
                    <span className="playlist-card__meta">
                      {pl.songs.length} song{pl.songs.length !== 1 ? "s" : ""}
                    </span>
                    {pl.description && (
                      <p className="playlist-card__description">
                        {pl.description}
                      </p>
                    )}
                  </div>

                  <div className="playlist-card__actions">
                    <button
                      className="btn btn--secondary"
                      onClick={() =>
                        setExpandedId(expandedId === pl.id ? null : pl.id)
                      }
                    >
                      {expandedId === pl.id ? "▲ Hide Songs" : "▼ Show Songs"}
                    </button>
                    <button
                      className="btn btn--secondary"
                      onClick={() => handleStartEdit(pl)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn--danger"
                      onClick={() => handleDelete(pl.id, pl.name)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ── Songs list ── */}
            {expandedId === pl.id && (
              <div className="playlist-songs">
                {pl.songs.length === 0 ? (
                  <p className="playlist-empty">
                    No songs in this playlist yet.
                  </p>
                ) : (
                  <ul>
                    {pl.songs.map((song) => (
                      <li key={song.id} className="playlist-song-item">
                        {/* Album art */}
                        {song.album?.cover_small && (
                          <img
                            src={song.album.cover_small}
                            alt={song.title}
                            className="playlist-song-item__art"
                          />
                        )}

                        {/* Title + artist */}
                        <div className="playlist-song-item__info">
                          <p className="playlist-song-item__title">
                            {song.title}
                          </p>
                          <p className="playlist-song-item__artist">
                            {song.artist?.name}
                          </p>
                        </div>

                        {/* ── Inline preview player ── */}
                        {song.preview && (
                          <audio
                            className="playlist-song-item__audio"
                            controls
                            src={song.preview}
                            onPlay={(e) => handleAudioPlay(e.currentTarget)}
                          />
                        )}

                        {/* ── Action buttons ── */}
                        <div className="playlist-song-item__actions">
                          {/* Lyrics */}
                          <button
                            className="btn btn--secondary btn--sm"
                            onClick={() => handleOpenLyrics(song)}
                          >
                            📄 Lyrics
                          </button>

                          {/* Video */}
                          <Link
                            to={`/dashboard/video/${song.artist?.name}/${song.title}`}
                            className="btn btn--secondary btn--sm"
                          >
                            🎬 Video
                          </Link>

                          {/* Remove */}
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() =>
                              handleRemoveSong(pl.id, song.id, song.title)
                            }
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Lyrics Modal ── */}
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
