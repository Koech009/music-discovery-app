import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import "../../styles/dashboard.css";

export default function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    pendingAdmins: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, pendingRes, messagesRes] = await Promise.all([
          api.get("/users"),
          api.get("/admin/admins/pending"),
          api.get("/messages"),
        ]);

        const users = usersRes.data.users ?? [];
        const pending = pendingRes.data.pending_admins ?? [];
        const messages = messagesRes.data.messages ?? messagesRes.data ?? [];

        setStats({
          users: users.length,
          admins: users.filter((u) => u.role === "admin").length,
          pendingAdmins: pending.length,
          unreadMessages: messages.filter((m) => !m.is_read && !m.isRead).length,
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

        {/* Users */}
        <div className="dashboard-card">
          <h2>👥 Manage Users</h2>
          <p>
            {stats.users} registered user{stats.users !== 1 ? "s" : ""},{" "}
            {stats.admins} admin{stats.admins !== 1 ? "s" : ""}. View, edit,
            suspend, or remove accounts.
          </p>
          <Link to="/admin/users" className="dashboard-link">
            Manage Users →
          </Link>
        </div>

        {/* Pending Admin Accounts */}
        <div className="dashboard-card">
          <h2>🕐 Pending Accounts</h2>
          <p>
            {stats.pendingAdmins > 0 ? (
              <>
                <span style={{ color: "#e63946", fontWeight: 600 }}>
                  {stats.pendingAdmins}
                </span>{" "}
                admin account{stats.pendingAdmins !== 1 ? "s" : ""} awaiting
                approval. Approve to grant access or reject to permanently remove.
              </>
            ) : (
              "No pending admin accounts at the moment."
            )}
          </p>
          <Link to="/admin/pending-accounts" className="dashboard-link">
            Review Requests →
          </Link>
        </div>

        {/* Messages */}
        <div className="dashboard-card">
          <h2>📩 Messages</h2>
          <p>
            {stats.unreadMessages > 0 ? (
              <>
                <span style={{ color: "#e63946", fontWeight: 600 }}>
                  {stats.unreadMessages}
                </span>{" "}
                unread message{stats.unreadMessages !== 1 ? "s" : ""} from users.
                Mark as read or delete after reviewing.
              </>
            ) : (
              "All messages have been read."
            )}
          </p>
          <Link to="/admin/messages" className="dashboard-link">
            View Messages →
          </Link>
        </div>

        {/* Audit Logs */}
        <div className="dashboard-card">
          <h2>🗂 Audit Logs</h2>
          <p>
            A chronological record of every action taken on the platform —
            role changes, suspensions, deletions, and more.
          </p>
          <Link to="/admin/audit" className="dashboard-link">
            View Audit Logs →
          </Link>
        </div>

        {/* Genres */}
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

        {/* Trending */}
        <div className="dashboard-card">
          <h2>🔥 Trending</h2>
          <p>See what songs are trending across the platform.</p>
          <Link to="/admin/trending" className="dashboard-link">
            View Trending →
          </Link>
        </div>

        {/* Favourites */}
        <div className="dashboard-card">
          <h2>⭐ Favourites</h2>
          <p>View and manage your personally saved favourite songs.</p>
          <Link to="/admin/favourites" className="dashboard-link">
            View Favourites →
          </Link>
        </div>

        {/* Playlists */}
        <div className="dashboard-card">
          <h2>🎶 Playlists</h2>
          <p>Create and manage your own playlists.</p>
          <Link to="/admin/playlists" className="dashboard-link">
            View Playlists →
          </Link>
        </div>

        {/* Profile */}
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