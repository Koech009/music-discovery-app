import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Pagination from "../../components/Pagination";
import "../../styles/dashboard.css";

export default function UserDashboard() {
  const { user } = useAuth();

  const [playlistPage, setPlaylistPage] = useState(1);
  const [playlists, setPlaylists] = useState([]);
  const [playlistMeta, setPlaylistMeta] = useState(null);

  const [favouritePage, setFavouritePage] = useState(1);
  const [favourites, setFavourites] = useState([]);
  const [favouriteMeta, setFavouriteMeta] = useState(null);


  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem("token");
    fetch(`/api/playlists?userId=${user.id}&page=${playlistPage}&limit=3`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setPlaylists(resData.playlists);
          setPlaylistMeta(resData.metadata);
        }
      })
      .catch((err) => console.error("Error fetching playlists:", err));
  }, [user?.id, playlistPage]);

  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem("token");
    fetch(`/api/favorites?userId=${user.id}&page=${favouritePage}&limit=3`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setFavourites(resData.favorites);
          setFavouriteMeta(resData.metadata);
        }
      })
      .catch((err) => console.error("Error fetching favourites:", err));
  }, [user?.id, favouritePage]);

  return (
    <div className="dashboard-page">
      <h1>Welcome back, {user?.username || "User"} </h1>
      <p className="dashboard-sub">
        Explore music, manage your playlists, and enjoy your favourites.
      </p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Search Music</h2>
          <p>Find songs and artists using Deezer search.</p>
          <Link to="/dashboard/search" className="dashboard-link">
            Go to Search →
          </Link>
        </div>

        <div className="dashboard-card">
          <h2>My Playlists</h2>
          {playlists.length === 0 ? (
            <p>Create and manage your personal playlists.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 text-left' }}>
              {playlists.map(pl => (
                <li key={pl.id} style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>• {pl.name}</li>
              ))}
            </ul>
          )}
          <Pagination metadata={playlistMeta} onPageChange={setPlaylistPage} />
          <Link to="/dashboard/playlists" className="dashboard-link" style={{ marginTop: '10px', display: 'inline-block' }}>
            Full View →
          </Link>
        </div>

  
        <div className="dashboard-card">
          <h2>Favourites</h2>
          {favourites.length === 0 ? (
            <p>See all songs you’ve saved to your library.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 text-left' }}>
              {favourites.map(fav => (
                <li key={fav.id} style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>• {fav.title || `Track #${fav.id}`}</li>
              ))}
            </ul>
          )}
          <Pagination metadata={favouriteMeta} onPageChange={setFavouritePage} />
          <Link to="/dashboard/favourites" className="dashboard-link" style={{ marginTop: '10px', display: 'inline-block' }}>
            Full View →
          </Link>
        </div>

        <div className="dashboard-card">
          <h2>Profile</h2>
          <p>Update your account details and password.</p>
          <Link to="/dashboard/profile" className="dashboard-link">
            Manage Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}