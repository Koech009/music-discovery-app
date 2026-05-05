import usefavourites from "../hooks/usefavourites";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

export default function favourites() {
  const { favourites, loading, error, removeFavorite } = usefavourites();

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h2>My favourites</h2>

      {/* Show message if no favourites saved yet */}
      {favourites.length === 0 && <p>No favourites saved yet.</p>}

      {favourites.map((song) => (
        <div key={song.id} style={{ marginBottom: "12px" }}>
          <strong>{song.title}</strong> — {song.artist}
          {/* Remove button */}
          <button onClick={() => removeFavorite(song.id)} style={{ marginLeft: "10px" }}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}