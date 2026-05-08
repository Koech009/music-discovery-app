import { useState } from "react";
import { Link } from "react-router-dom";
import useFavorites from "../hooks/useFavourites.js";
import useLyrics from "../hooks/useLyrics.js";
import Modal from "../components/Modal.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessages from "../components/ErrorMessages.jsx";
import "../styles/songcard.css";

function SongTable({ songs }) {
  const { addFavorite } = useFavorites();
  const { lyrics, loading, error, getLyrics } = useLyrics();

  // Tracks which song's lyrics modal is open
  const [selectedSong, setSelectedSong] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Opens modal and fetches lyrics for the clicked song
  const handleLyricsClick = async (song) => {
    setSelectedSong(song);
    await getLyrics(song.artist.name, song.title);
  };

  // Closes modal and clears selected song
  const handleCloseModal = () => {
    setSelectedSong(null);
  };

  const handleSave = async (song) => {
    const result = await addFavorite(song);

    if (result?.duplicate) {
      setToast(`⚠️ "${song.title}" is already in your Favourites!`);
    } else {
      setToast(`❤️ "${song.title}" added to Favorites!`);
    }

    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      {/* Toast notification — slides up from bottom-right for 3 seconds */}
      {toast && <div className="toast">{toast}</div>}

      {/* Card grid — one card per song result */}
      <div className="song-grid">
        {songs.map((song) => (
          <div key={song.id} className="song-card">
            {/* Album art — falls back to a musical note placeholder if no cover */}
            <div className="song-card__art">
              {song.album.cover_medium ? (
                <img src={song.album.cover_medium} alt={song.album.title} />
              ) : (
                <div className="song-card__art-placeholder">♪</div>
              )}
            </div>

            {/* Song metadata: title, artist, album */}
            <div className="song-card__info">
              <p className="song-card__title">{song.title}</p>
              <p className="song-card__artist">{song.artist.name}</p>
              <p className="song-card__album">{song.album.title}</p>
            </div>

            {/* 30-second audio preview — only renders if preview URL exists */}
            {song.preview && (
              <div className="song-card__preview">
                <audio controls src={song.preview} />
              </div>
            )}

            {/* Action buttons */}
            <div className="song-card__actions">
              {/* Redirects to VideoPage which fetches a YouTube embed */}
              <Link to={`/video/${song.artist.name}/${song.title}`}>
                <button className="btn btn--secondary">Watch Video</button>
              </Link>

              {/* Opens the lyrics modal and fetches lyrics for this song */}
              <button
                className="btn btn--secondary"
                onClick={() => handleLyricsClick(song)}
              >
                Read Lyrics
              </button>

              {/* Saves song to favourites via useFavorites hook */}
              <button
                className="btn btn--favorite"
                onClick={() => handleSave(song)}
              >
                ❤️ Save
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lyrics Modal — mounts when a song is selected, unmounts on close */}
      {selectedSong && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <h2>
            {selectedSong.title} — {selectedSong.artist.name}
          </h2>
          {loading && <Loader />}
          {error && <ErrorMessages message={error} />}
          {lyrics && <pre className="lyrics-box">{lyrics}</pre>}
        </Modal>
      )}
    </div>
  );
}

export default SongTable;
