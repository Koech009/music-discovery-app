import { Link, useLocation } from "react-router-dom";
import "../styles/navbar.css";

function NavBar() {
  const location = useLocation();

  // Helper function to check if a path is active
  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="logo">
        🎵 Tunely
      </Link>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/search" className={isActive("/search")}>
            Search
          </Link>
        </li>
        <li>
          <Link to="/favorites" className={isActive("/favorites")}>
            Favorites
          </Link>
        </li>
        <li>
          <Link to="/trending" className={isActive("/trending")}>
            Trending
          </Link>
        </li>
        <li>
          <Link to="/genres" className={isActive("/genres")}>
            Genres
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
