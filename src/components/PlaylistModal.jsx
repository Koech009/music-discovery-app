import { useState } from "react";
import Modal from "./Modal.jsx";
import "../styles/ui.css";
//component that renders a modal dialog for adding a song to an existing playlist or creating a new playlist. It takes the following props: song (the song object to be added), playlists (an array of existing playlists), onSave (a callback function to handle saving the song to the selected or new playlist), and onClose (a callback function to handle closing the modal). The component manages its own state for the selected playlist, new playlist name, description, loading status, and error messages. It validates user input and provides feedback for errors such as missing selection or duplicate songs in a playlist.
export default function PlaylistModal({ song, playlists, onSave, onClose }) {
  // State variables to manage user input and feedback
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [newName, setNewName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //validation checks to ensure that the user has either selected an existing playlist or entered a new name before allowing submission. It also checks if the song is already in the selected playlist and shows appropriate error messages.
  const isExistingSelected = selectedPlaylist !== "";
  const isNewNameEntered = newName.trim() !== "";

  // SUBMIT logic that handles the form submission when the user clicks the save button. It  validation inputs(must choose or create)

  const handleSubmit = async () => {
    setError(null);

    if (!isExistingSelected && !isNewNameEntered) {
      setError("Please select a playlist or enter a new name.");
      return;
    }

    try {
      setLoading(true);

      if (isExistingSelected) {
        // string ID passed directly
        await onSave(song, selectedPlaylist, null, null);
      } else {
        await onSave(song, null, newName.trim(), description.trim());
      }

      onClose();
    } catch (err) {
      // Show duplicate message if thrown from addSongToPlaylist
      if (err?.duplicate) {
        setError(`"${song.title}" is already in that playlist.`);
      } else {
        console.error("Failed to save playlist:", err);
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  //Rennder ui

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="pm-inner">
        <h2 className="pm-title">
          Add <span className="pm-song-name">"{song.title}"</span> to Playlist
        </h2>

        {/* ── Existing playlist ── */}
        <div className="pm-field">
          <label className="pm-label">Choose Existing Playlist</label>
          <select
            className="pm-select"
            value={selectedPlaylist}
            onChange={(e) => {
              setSelectedPlaylist(e.target.value);
              setNewName("");
              setDescription("");
              setError(null);
            }}
          >
            <option value="">-- Select --</option>
            {(playlists ?? []).map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pm-divider">
          <span>or create new</span>
        </div>

        {/* ── New playlist ── */}
        <div className="pm-field">
          <label className="pm-label">Playlist Name</label>
          <input
            className="pm-input"
            type="text"
            placeholder="e.g. Late Night Vibes"
            value={newName}
            disabled={isExistingSelected}
            onChange={(e) => {
              setNewName(e.target.value);
              setSelectedPlaylist("");
              setError(null);
            }}
          />
        </div>

        <div className="pm-field">
          <label className="pm-label">
            Description <span className="pm-optional">(optional)</span>
          </label>
          <input
            className="pm-input"
            type="text"
            placeholder="What's this playlist about?"
            value={description}
            disabled={isExistingSelected}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* ── Error ── */}
        {error && <p className="pm-error">{error}</p>}

        {/* ── Actions ── */}
        <div className="pm-actions">
          <button
            className="pm-btn pm-btn--save"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving…" : "💾 Save"}
          </button>
          <button
            className="pm-btn pm-btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
