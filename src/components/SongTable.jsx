import { useState } from "react";
import { Link } from "react-router-dom";
import useFavorites from "../hooks/useFavourites.js";
import useLyrics from "../hooks/useLyrics.js";
import Modal from "../components/Modal.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessages from "../components/ErrorMessages.jsx";
import LyricsReader from "../components/LyricsReader.jsx";
import "../styles/songcard.css";

function SongTable({ songs }) {
  const { addFavorite } = useFavorites();
  const { lyrics, loading, error, getLyrics, clearLyrics } = useLyrics();

  const [selectedSong, setSelectedSong] = useState(null);
  const [toast, setToast] = useState(null);

  const handleLyricsClick = async (song) => {
    clearLyrics();
    setSelectedSong(song);
    await getLyrics(song.artist.name, song.title);
  };

  const handleCloseModal = () => {
    window.speechSynthesis.cancel();
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
      {toast && <div className="toast">{toast}</div>}

      <div className="song-grid">
        {songs.map((song) => (
          <div key={song.id} className="song-card">
            <div className="song-card__art">
              {song.album.cover_medium ? (
                <img src={song.album.cover_medium} alt={song.album.title} />
              ) : (
                <div className="song-card__art-placeholder">♪</div>
              )}
            </div>

            <div className="song-card__info">
              <p className="song-card__title">{song.title}</p>
              <p className="song-card__artist">{song.artist.name}</p>
              <p className="song-card__album">{song.album.title}</p>
            </div>

            {song.preview && (
              <div className="song-card__preview">
                <audio controls src={song.preview} />
              </div>
            )}

            <div className="song-card__actions">
              <Link to={`/video/${song.artist.name}/${song.title}`}>
                <button className="btn btn--secondary">Watch Video</button>
              </Link>
              <button
                className="btn btn--secondary"
                onClick={() => handleLyricsClick(song)}
              >
                Read Lyrics
              </button>
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

      {selectedSong && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <h2>
            {selectedSong.title} — {selectedSong.artist.name}
          </h2>
          {loading && <Loader />}
          {error && <ErrorMessages message={error} />}
          {!error && !loading && lyrics && <LyricsReader lyrics={lyrics} />}
        </Modal>
      )}
    </div>
  );
}

export default SongTable;
