import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/dashboard.css";

export default function UserDashboard() {
  const { user } = useAuth();

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
          <p>Create and manage your personal playlists.</p>
          <Link to="/dashboard/playlists" className="dashboard-link">
            View Playlists →
          </Link>
        </div>

        <div className="dashboard-card">
          <h2>Favourites</h2>
          <p>See all songs you’ve saved to your library.</p>
          <Link to="/dashboard/favourites" className="dashboard-link">
            View Favourites →
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
