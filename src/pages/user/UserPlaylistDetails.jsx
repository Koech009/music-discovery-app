import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getPlaylistById,
  removeSongFromPlaylist,
  addSongToPlaylist,
} from "../../api/playlists.js";
import useDeezerSearch from "../../hooks/useDeezerSearch.js";
import SearchBar from "../../components/SearchBar.jsx";
import "../../styles/index.css";

export default function UserPlaylistDetails() {
  const { id } = useParams(); // playlist id from route
  const [playlist, setPlaylist] = useState(null);

  const { results, search, loading, error } = useDeezerSearch();

  useEffect(() => {
    getPlaylistById(id).then(setPlaylist);
  }, [id]);

  const handleRemoveSong = async (songId) => {
    await removeSongFromPlaylist(id, songId);
    setPlaylist({
      ...playlist,
      songs: playlist.songs.filter((s) => s.id !== songId),
    });
  };

  const handleAddSong = async (song) => {
    await addSongToPlaylist(id, song);
    setPlaylist({
      ...playlist,
      songs: [...playlist.songs, song],
    });
  };

  return (
    <div className="playlist-details">
      <h1>{playlist?.name}</h1>

      {/* Songs in playlist */}
      <section className="playlist-songs">
        <h2>Songs</h2>
        {playlist?.songs.length === 0 ? (
          <p>No songs yet. Add some below!</p>
        ) : (
          <ul>
            {playlist.songs.map((song) => (
              <li key={song.id} className="song-card">
                {song.title} — {song.artist}
                <button onClick={() => handleRemoveSong(song.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Search to add songs */}
      <section className="add-songs">
        <h2>Add Songs from Search</h2>
        <SearchBar placeholder="Search songs..." onSearch={search} />

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {results.length > 0 && (
          <ul className="search-results">
            {results.map((song) => (
              <li key={song.id} className="song-card">
                {song.title} — {song.artist.name}
                <button onClick={() => handleAddSong(song)}>
                  Add to Playlist
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
