import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, toggleSuspendUser, deleteUser } from "../../api/user";
import axios from "axios";
import "../../styles/adminUsers.css";

const api = axios.create({ baseURL: "http://localhost:3002" });

function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userData, favsData, playlistsData] = await Promise.all([
          getUserById(id),
          api.get(`/favorites?userId=${id}`).then((r) => r.data),
          api.get(`/playlists?userId=${id}`).then((r) => r.data),
        ]);
        setUser(userData);
        setFavourites(favsData);
        setPlaylists(playlistsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const formatDate = (val) => {
    if (!val || val === "N/A") return "N/A";
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleString();
  };

  const handleSuspend = async () => {
    await toggleSuspendUser(user.id);
    setUser((prev) => ({ ...prev, suspended: !prev.suspended }));
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this user?")) {
      await deleteUser(user.id);
      navigate("/admin/users");
    }
  };

  if (loading)
    return (
      <div className="admin-users-page">
        <p>Loading...</p>
      </div>
    );
  if (!user)
    return (
      <div className="admin-users-page">
        <p>User not found.</p>
      </div>
    );

  const isSuspended = user.suspended === true;

  return (
    <div className="admin-users-page">
      <button className="btn-view" onClick={() => navigate("/admin/users")}>
        ← Back to Users
      </button>

      <h1>User Details</h1>

      <div className="details-grid">
        {/* Basic Info */}
        <div className="detail-card">
          <h3>Basic Info</h3>
          <p>
            <strong>Username:</strong> {user.username || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "N/A"}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone || "N/A"}
          </p>
          <p>
            <strong>Address:</strong> {user.address || "N/A"}
          </p>
          <p>
            <strong>Role:</strong> {user.role || "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`badge ${isSuspended ? "suspended" : "active"}`}>
              {isSuspended ? "Suspended" : "Active"}
            </span>
          </p>
          <p>
            <strong>Created:</strong> {formatDate(user.createdAt)}
          </p>
          <p>
            <strong>Last Login:</strong> {formatDate(user.lastLogin)}
          </p>
        </div>

        {/* Profile */}
        <div className="detail-card">
          <h3>Profile</h3>
          <p>
            <strong>Bio:</strong> {user.profile?.bio || "No bio"}
          </p>

          <h4>Favourites ({favourites.length})</h4>
          {favourites.length > 0 ? (
            <ul>
              {favourites.map((fav) => (
                <li key={fav.id}>
                  🎵 {fav.title} — {fav.artist?.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No favourites yet.</p>
          )}

          <h4>Playlists ({playlists.length})</h4>
          {playlists.length > 0 ? (
            <ul>
              {playlists.map((pl) => (
                <li key={pl.id}>
                  📋 {pl.name} ({pl.songs?.length || 0} songs)
                </li>
              ))}
            </ul>
          ) : (
            <p>No playlists yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetailsPage;
