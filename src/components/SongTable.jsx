import { useState } from "react";
import { Link } from "react-router-dom";
import useFavorites from "../hooks/useFavourites.js";
import useLyrics from "../hooks/useLyrics.js";
import Modal from "../components/Modal.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessages from "../components/ErrorMessages.jsx";
import "../styles/table.css";

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

  // Saves song to favourites and shows toast confirmation
  const handleSave = async (song) => {
    await addFavorite(song);
    setToast(` "${song.title}" added to Favorites!`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      {/* Toast notification — appears bottom right for 3 seconds */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#a78bfa",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {toast}
        </div>
      )}

      <table className="song-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Album</th>
            <th>Preview</th>
            <th>Video</th>
            <th>Lyrics</th>
            <th>Favorites</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
            <tr key={song.id}>
              {/* Basic song info from Deezer API */}
              <td>{song.title}</td>
              <td>{song.artist.name}</td>
              <td>{song.album.title}</td>

              {/* 30-second audio preview — only renders if preview URL exists */}
              <td>
                {song.preview && <audio controls src={song.preview}></audio>}
              </td>

              {/* Redirect to VideoPage with YouTube API */}
              <td>
                <Link to={`/video/${song.artist.name}/${song.title}`}>
                  <button>Watch Video</button>
                </Link>
              </td>

              {/* Opens lyrics modal for this song */}
              <td>
                <button onClick={() => handleLyricsClick(song)}>
                  Read Lyrics
                </button>
              </td>

              {/* Save song to favourites via useFavorites hook */}
              <td>
                <button onClick={() => handleSave(song)}>❤️ Save</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Lyrics Modal — opens when Read Lyrics is clicked */}
      {selectedSong && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <h2>
            {selectedSong.title} — {selectedSong.artist.name}
          </h2>
          {loading && <Loader />}
          {error && <ErrorMessages message={error} />}
          {lyrics && <pre>{lyrics}</pre>}
        </Modal>
      )}
    </div>
  );
}

export default SongTable;
