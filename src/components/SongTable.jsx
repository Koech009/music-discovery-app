import { Link } from "react-router-dom";
import "../styles/table.css";

function SongTable({ songs }) {
  // Temporary placeholders for lyrics state
  const lyrics = null;
  const loading = false;
  const error = null;

  // Temporary placeholder for favorites
  const saveFavorite = (song) => {
    console.log(`Favorite requested for ${song.title} by ${song.artist.name}`);
  };

  const handleLyricsClick = (artist, title) => {
    console.log(`Lyrics requested for ${artist} - ${title}`);
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

      {/* Lyrics Display (placeholder) */}
      {lyrics && (
        <div className="lyrics-box">
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
