import { useRef } from "react";
import { Link } from "react-router-dom";
import useLyrics from "../hooks/useLyrics.js";
import useFavorites from "../hooks/useFavorites.js";
import "../styles/table.css";

function SongTable({ songs }) {
  const { lyrics, loading, error, getLyrics } = useLyrics();
  const { saveFavorite } = useFavorites();
  const lyricsRef = useRef(null);

  const handleLyricsClick = async (artist, title) => {
    await getLyrics(artist, title);
    if (lyricsRef.current) {
      lyricsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
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
              <td>{song.title}</td>
              <td>{song.artist.name}</td>
              <td>{song.album.title}</td>
              <td>
                {song.preview && <audio controls src={song.preview}></audio>}
              </td>
              <td>
                {/* Redirect to VideoPage with YouTube API */}
                <Link to={`/video/${song.artist.name}/${song.title}`}>
                  <button>Watch Video</button>
                </Link>
              </td>
              <td>
                <button
                  onClick={() =>
                    handleLyricsClick(song.artist.name, song.title)
                  }
                >
                  Read Lyrics
                </button>
              </td>
              <td>
                <button onClick={() => saveFavorite(song)}>❤️ Save</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Lyrics Display */}
      {lyrics && (
        <div ref={lyricsRef} className="lyrics-box">
          <h3>Lyrics</h3>
          {loading && <p>Loading lyrics...</p>}
          {error && <p>{error}</p>}
          <pre>{lyrics}</pre>
        </div>
      )}
    </div>
  );
}

export default SongTable;
