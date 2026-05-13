import { Link } from "react-router-dom";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-brand">🎵 Tunely</p>
      <div className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="#">Privacy Policy</Link>
        <Link to="#">Terms of Service</Link>
      </div>
      <p className="footer-copy">
        © {new Date().getFullYear()} Tunely. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
