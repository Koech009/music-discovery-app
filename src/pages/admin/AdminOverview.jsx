import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Pagination from "../../components/Pagination";
import axios from "axios";
import "../../styles/dashboard.css";

const API_BASE = "http://localhost:5174/api";

export default function AdminOverview() {
  const { user } = useAuth();

  const [stats, setStats] = useState({ users: 0, admins: 0 });

  const [userPage, setUserPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [userMeta, setUserMeta] = useState(null);

  const [messagePage, setMessagePage] = useState(1);
  const [messages, setMessages] = useState([]);
  const [messageMeta, setMessageMeta] = useState(null);

  // Fetch paginated users — also derive stats from metadata + current page data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(
          `${API_BASE}/users?page=${userPage}&limit=3`,
          { headers }
        );

        if (res.data.success) {
          const fetchedUsers = res.data.users || res.data.data || [];
          const meta = res.data.metadata;

          setUsers(fetchedUsers);
          setUserMeta(meta);

          // Use total_items from metadata for user count.
          // Admin count is derived from the current page only as an approximation —
          // for an exact count your API would need to return it separately.
          setStats((prev) => ({
            users: meta?.total_items ?? fetchedUsers.length,
            admins: prev.admins,
          }));
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [userPage]);

  // Fetch paginated messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE}/messages?page=${messagePage}&limit=3`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setMessages(res.data.messages || []);
          setMessageMeta(res.data.metadata);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [messagePage]);

  return (
    <div className="dashboard-page">
      <h1>Welcome back, {user?.username || "Admin"}</h1>
      <p className="dashboard-sub">
        Manage users, content, and platform settings from here.
      </p>

      <div className="dashboard-grid">
        {/* Users Card */}
        <div className="dashboard-card">
          <h2>👥 Manage Users</h2>
          <p style={{ fontSize: "0.9rem", marginBottom: "10px", color: "#555" }}>
            {stats.users} registered user{stats.users !== 1 ? "s" : ""}
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "10px 0", textAlign: "left" }}>
            {users.map((u) => (
              <li
                key={u.id}
                style={{ padding: "4px 0", borderBottom: "1px solid #eee", fontSize: "0.85rem" }}
              >
                <strong>{u.username}</strong> ({u.email}) -{" "}
                <span style={{ color: u.role === "admin" ? "red" : "green" }}>
                  {u.role}
                </span>
              </li>
            ))}
          </ul>

          <Pagination metadata={userMeta} onPageChange={setUserPage} />

          <Link
            to="/admin/manage-users"
            className="dashboard-link"
            style={{ marginTop: "10px", display: "inline-block" }}
          >
            Full Management View →
          </Link>
        </div>

        {/* Messages Card */}
        <div className="dashboard-card">
          <h2>📩 System Messages</h2>
          <p>Review contact forms and user submissions.</p>

          {messages.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#999", fontSize: "0.85rem" }}>
              No messages found.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "10px 0", textAlign: "left" }}>
              {messages.map((m) => (
                <li
                  key={m.id}
                  style={{ padding: "6px 0", borderBottom: "1px solid #eee", fontSize: "0.85rem" }}
                >
                  <span style={{ fontSize: "0.75rem", color: "#666" }}>{m.email}:</span>
                  <p
                    style={{
                      margin: "2px 0 0 0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {m.content || m.body}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <Pagination metadata={messageMeta} onPageChange={setMessagePage} />

          <Link
            to="/admin/messages"
            className="dashboard-link"
            style={{ marginTop: "10px", display: "inline-block" }}
          >
            View All Messages →
          </Link>
        </div>

        {/* Static nav cards */}
        <div className="dashboard-card">
          <h2>🎵 Genres</h2>
          <p>Browse genres pulled from Deezer. Use them to filter and explore music across the catalogue.</p>
          <Link to="/admin/genres" className="dashboard-link">Manage Genres →</Link>
        </div>

        <div className="dashboard-card">
          <h2>🔥 Trending</h2>
          <p>See what songs are trending across the platform.</p>
          <Link to="/admin/trending" className="dashboard-link">View Trending →</Link>
        </div>

        <div className="dashboard-card">
          <h2>⭐ Favourites</h2>
          <p>View and manage your personally saved favourite songs.</p>
          <Link to="/admin/favourites" className="dashboard-link">View Favourites →</Link>
        </div>

        <div className="dashboard-card">
          <h2>🎶 Playlists</h2>
          <p>Create and manage your own playlists.</p>
          <Link to="/admin/playlists" className="dashboard-link">View Playlists →</Link>
        </div>

        <div className="dashboard-card">
          <h2>👤 Profile</h2>
          <p>Update your admin account details and change your password.</p>
          <Link to="/admin/profile" className="dashboard-link">Manage Profile →</Link>
        </div>
      </div>
    </div>
  );
}