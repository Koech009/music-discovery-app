import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-brand">🎵 Tunely</p>
      <div className="footer-links">
        <a href="#">About</a>
        <a href="#">Contact</a>
        <a href="#">Privacy Policy</a>
      </div>
      <p className="footer-copy">
        © {new Date().getFullYear()} Tunely. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
