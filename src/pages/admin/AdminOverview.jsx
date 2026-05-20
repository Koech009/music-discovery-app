import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUsers } from "../../api/user";
import "../../styles/dashboard.css";

export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, admins: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await getUsers(); // ← uses api/user.js with JWT attached
        setStats({
          users: users.length,
          admins: users.filter((u) => u.role === "admin").length,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Welcome back, {user?.username || "Admin"}</h1>
      <p className="dashboard-sub">
        Manage users, content, and platform settings from here.
      </p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>👥 Manage Users</h2>
          <p>
            {stats.users} registered user{stats.users !== 1 ? "s" : ""},{" "}
            {stats.admins} admin{stats.admins !== 1 ? "s" : ""}. View, edit, or
            remove accounts.
          </p>
          <Link to="/admin/manage-users" className="dashboard-link">
            Manage Users →
          </Link>
        </div>

        <div className="dashboard-card">
          <h2>🎵 Genres</h2>
          <p>
            Browse genres pulled from Deezer. Use them to filter and explore
            music across the catalogue.
          </p>
          <Link to="/admin/genres" className="dashboard-link">
            Manage Genres →
          </Link>
        </div>

        <div className="dashboard-card">
          <h2>🔥 Trending</h2>
          <p>See what songs are trending across the platform.</p>
          <Link to="/admin/trending" className="dashboard-link">
            View Trending →
          </Link>
        </div>

        <div className="dashboard-card">
          <h2>⭐ Favourites</h2>
          <p>View and manage your personally saved favourite songs.</p>
          <Link to="/admin/favourites" className="dashboard-link">
            View Favourites →
          </Link>
        </div>

        <div className="dashboard-card">
          <h2>🎶 Playlists</h2>
          <p>Create and manage your own playlists.</p>
          <Link to="/admin/playlists" className="dashboard-link">
            View Playlists →
          </Link>
        </div>

        <div className="dashboard-card">
          <h2>👤 Profile</h2>
          <p>Update your admin account details and change your password.</p>
          <Link to="/admin/profile" className="dashboard-link">
            Manage Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}