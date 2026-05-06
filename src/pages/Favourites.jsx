import useFavorites from "../hooks/useFavourites";
import Loader from "../components/Loader";
import ErrorMessages from "../components/ErrorMessages";

export default function Favourites() {
  const { favorites, loading, error, removeFavorite } = useFavorites();

  if (loading) return <Loader />;
  if (error) return <ErrorMessages message={error} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Favourites</h1>
        <p>Songs you've saved to your personal library.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <span>💔</span>
          <p>No favourites saved yet.</p>
          <small>Search for songs and click ❤️ to save them here.</small>
        </div>
      ) : (
        <div className="favourites-list">
          {favorites.map((song) => (
            <div key={song.id} className="favourite-card">
              <div className="favourite-info">
                <span className="favourite-title">{song.title}</span>
                <span className="favourite-artist">{song.artist.name}</span>
              </div>
              <button
                className="remove-btn"
                onClick={() => removeFavorite(song.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
