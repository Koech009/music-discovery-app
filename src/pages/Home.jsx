import { Link } from "react-router-dom";
import "../styles/index.css";

// Home page component
function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <header className="hero">
        <h1>Discover Music Instantly</h1>
        <p>
          Search songs, explore artists, watch videos, and read lyrics — all in
          one place.
        </p>
        {/* CTA button navigates to the Search page */}
        <Link to="/search" className="cta-btn">
          Get Started
        </Link>
      </header>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat">
          <h3>50M+</h3>
          <p>Songs</p>
        </div>
        <div className="stat">
          <h3>2M+</h3>
          <p>Users</p>
        </div>
        <div className="stat">
          <h3>1900+</h3>
          <p>Artists</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>What You Can Do</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <span>🔍</span>
            <h3>Search Songs</h3>
            <p>Find any track by title, artist, or lyrics.</p>
          </div>
          <div className="feature-card">
            <span>🎬</span>
            <h3>Watch Videos</h3>
            <p>Play official YouTube videos in-app.</p>
          </div>
          <div className="feature-card">
            <span>📝</span>
            <h3>Read Lyrics</h3>
            <p>View full lyrics for millions of songs.</p>
          </div>
          <div className="feature-card">
            <span>⭐</span>
            <h3>Save Favorites</h3>
            <p>Build your personal music library.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Search</h3>
            <p>Type a song or artist name.</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>Explore</h3>
            <p>Browse results and artist info.</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>Enjoy</h3>
            <p>Watch, read lyrics, and save favorites.</p>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <h2>Ready to explore music?</h2>
        <p>Start searching for your favorite songs right now.</p>
        <Link to="/search" className="cta-btn">
          Start Searching
        </Link>
      </section>
    </div>
  );
}

export default Home;
