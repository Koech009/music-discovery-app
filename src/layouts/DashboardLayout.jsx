import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "../styles/dashboard.css";

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "admin";

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>🎵</span>
          <span className="sidebar-title">Tunely</span>
        </div>

        <nav>
          <ul>
            {isAdmin ? (
              <>
                <li>
                  <span className="sidebar-section-label">Admin</span>
                </li>

                <li>
                  <NavLink to="/admin/overview">Overview</NavLink>
                </li>

                <li>
                  <NavLink to="/admin/search">Search</NavLink>
                </li>

                <li>
                  <NavLink to="/admin/users">Manage Users</NavLink>
                </li>

                <li>
                  <NavLink to="/admin/genres">Genres</NavLink>
                </li>

                <li>
                  <NavLink to="/admin/trending">Trending</NavLink>
                </li>

                <li>
                  <NavLink to="/admin/favourites">Favourites</NavLink>
                </li>

                <li>
                  <NavLink to="/admin/playlists">Playlists</NavLink>
                </li>
                <li>
                  <NavLink to="/admin/messages">Messages</NavLink>
                </li>

                <li>
                  <NavLink to="/admin/profile">Profile</NavLink>
                </li>
              </>
            ) : (
              <>
                <li>
                  <span className="sidebar-section-label">Menu</span>
                </li>

                <li>
                  <NavLink to="/dashboard" end>
                    Dashboard
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/dashboard/search">Search</NavLink>
                </li>

                <li>
                  <NavLink to="/dashboard/playlists">Playlists</NavLink>
                </li>

                <li>
                  <NavLink to="/dashboard/favourites">Favourites</NavLink>
                </li>

                <li>
                  <NavLink to="/dashboard/genres">Genres</NavLink>
                </li>

                <li>
                  <NavLink to="/dashboard/trending">Trending</NavLink>
                </li>

                <li>
                  <NavLink to="/dashboard/profile">Profile</NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
