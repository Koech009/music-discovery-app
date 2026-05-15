import { useState } from "react";
import { Link } from "react-router-dom";
import useFavorites from "../hooks/useFavourites.js";
import useLyrics from "../hooks/useLyrics.js";
import { usePlaylists } from "../hooks/usePlaylists.js";
import PlaylistModal from "../components/PlaylistModal.jsx";
import Modal from "../components/Modal.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessages from "../components/ErrorMessages.jsx";
import LyricsReader from "../components/LyricsReader.jsx";
import "../styles/songcard.css";

function SongTable({ songs }) {
  const { addFavorite } = useFavorites(); //enables users to save songs to favouites
  const { lyrics, loading, error, getLyrics, clearLyrics } = useLyrics(); //enables users to fetch and display lyrics for a selected song, as well as manage loading and error states related to lyrics fetching.
  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylists(); //enables users to view their existing playlists, create new playlists, and add songs to playlists. It provides the necessary functions and data for managing playlists within the app.

  const [selectedSong, setSelectedSong] = useState(null); //
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [playlistSong, setPlaylistSong] = useState(null);
  const [toast, setToast] = useState(null);

  // Track currently playing audio
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  /* =========================
     TOAST shows temporary messages for a user action eg saving to favs
  ========================= */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // AUDIO CONTROL
  //ensures that only one song preview can play at a time
  const handlePlay = (id) => {
    if (currentPlayingId && currentPlayingId !== id) {
      const prevAudio = document.getElementById(`audio-${currentPlayingId}`);
      if (prevAudio) prevAudio.pause();
    }
    setCurrentPlayingId(id);
  };
  //clears the current playing state when a song is paused or ends allowing another song to be played
  const handlePause = (id) => {
    if (currentPlayingId === id) {
      setCurrentPlayingId(null);
    }
  };

  /* =========================
     LYRICS
  ========================= */
  //handles the click event when a user wants to view the lyrics of a song
  const handleLyricsClick = async (song) => {
    clearLyrics(); //clears any old lyrics and resets error/loading states before fetching new lyrics
    setSelectedSong(song); //sets the selected song in state to trigger the lyrics modal to open
    await getLyrics(song.artist.name, song.title);
  };
  //cancels the speech synthesis and closes the modal
  const handleCloseLyricsModal = () => {
    window.speechSynthesis.cancel();
    setSelectedSong(null);
  };

  /* =========================
     FAVOURITES
  ========================= */
  //handles the click event when a user wants to save a song to fav
  const handleSaveFavorite = async (song) => {
    try {
      const result = await addFavorite(song);
      if (result?.duplicate) {
        showToast(`⚠️ "${song.title}" is already in your Favourites!`);
      } else {
        showToast(`❤️ "${song.title}" added to Favorites!`);
      }
    } catch (err) {
      console.error(err);
      showToast("❌ Failed to save to Favorites.");
    }
  };

  /* =========================
     PLAYLIST
  ========================= */
  //opens the modal for adding a song to a playlist
  const handleOpenPlaylistModal = (song) => {
    setPlaylistSong(song);
    setPlaylistModalOpen(true);
  };
  //closes the playlist modal and clears the selected song for playlist
  const handleClosePlaylistModal = () => {
    setPlaylistModalOpen(false);
    setPlaylistSong(null);
  };
  //handles adding a song to an exixting playlist or creating a new playlistand adding the song to it
  const handleSavePlaylist = async (song, playlistId, newName, description) => {
    try {
      if (playlistId) {
        await addSongToPlaylist(song, playlistId);
      } else if (newName) {
        const newId = await createPlaylist(newName, description);
        await addSongToPlaylist(song, newId);
      } else {
        showToast("⚠️ Please select or create a playlist.");
        return;
      }
      showToast(`🎶 "${song.title}" added to playlist!`);
    } catch (err) {
      if (err?.duplicate) {
        showToast(`⚠️ "${song.title}" is already in that playlist!`);
      } else {
        console.error(err);
        showToast("❌ Failed to save to playlist.");
      }
    }
  };

  /* =========================
     RENDER Ui
  ========================= */
  return (
    <div className="st-root">
      {toast && <div className="st-toast">{toast}</div>}

      <div className="st-grid">
        {songs.map((song, i) => (
          <div
            key={song.id}
            className="st-card"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Album Art */}
            <div className="st-card__art">
              {song.album.cover_medium ? (
                <img
                  src={song.album.cover_medium}
                  alt={song.album.title}
                  className="st-card__art-img"
                />
              ) : (
                <div className="st-card__art-placeholder">♪</div>
              )}
              <div className="st-card__art-overlay" />
            </div>

            {/* Info */}
            <div className="st-card__info">
              <p className="st-card__title" title={song.title}>
                {song.title}
              </p>
              <p className="st-card__artist" title={song.artist.name}>
                {song.artist.name}
              </p>
              <p className="st-card__album" title={song.album.title}>
                {song.album.title}
              </p>
            </div>

            {/* Preview */}
            {song.preview && (
              <div className="st-card__preview">
                <audio
                  id={`audio-${song.id}`}
                  controls
                  src={song.preview}
                  className="st-audio"
                  onPlay={() => handlePlay(song.id)}
                  onPause={() => handlePause(song.id)}
                  onEnded={() => handlePause(song.id)}
                />
              </div>
            )}

            {/* Actions */}
            <div className="st-card__actions">
              <Link
                to={`/dashboard/video/${song.artist.name}/${song.title}`}
                className="st-btn st-btn--ghost"
              >
                🎬 Video
              </Link>
              <button
                className="st-btn st-btn--ghost"
                onClick={() => handleLyricsClick(song)}
              >
                📄 Lyrics
              </button>
              <button
                className="st-btn st-btn--fave"
                onClick={() => handleSaveFavorite(song)}
              >
                ❤️ Save
              </button>
              <button
                className="st-btn st-btn--playlist"
                onClick={() => handleOpenPlaylistModal(song)}
              >
                ➕ Add to Playlist
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lyrics Modal-lets you view the lyrics of a song */}
      {selectedSong && (
        <Modal isOpen={true} onClose={handleCloseLyricsModal}>
          <h2>
            {selectedSong.title} — {selectedSong.artist.name}
          </h2>
          {loading && <Loader />}
          {error && <ErrorMessages message={error} />}
          {!error && !loading && lyrics && <LyricsReader lyrics={lyrics} />}
        </Modal>
      )}

      {/* Playlist Modal-lets you add songs to your playlists */}
      {playlistModalOpen && playlistSong && (
        <PlaylistModal
          song={playlistSong}
          playlists={playlists ?? []}
          onSave={handleSavePlaylist}
          onClose={handleClosePlaylistModal}
        />
      )}
    </div>
  );
}

export default SongTable;
