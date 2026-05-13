import { Link, useLocation } from "react-router-dom"; // brings in the Link component for navigation and useLocation hook to determine the current path for active links
import "../styles/navbar.css";
//navbar component that displays the app logo and navigation links.
function NavBar() {
  const location = useLocation(); //gives you current url path
  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="logo">
        🎵 Tunely
      </Link>

      {/* Public Navigation Links */}
      <ul className="nav-links">
        <li>
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/about" className={isActive("/about")}>
            About
          </Link>
        </li>
        <li>
          <Link to="/contact" className={isActive("/contact")}>
            Contact Us
          </Link>
        </li>
        <li>
          <Link to="/login" className={isActive("/login")}>
            Login
          </Link>
        </li>
        <li>
          <Link to="/signup" className={isActive("/signup")}>
            Sign Up
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
