import { Link } from "react-router-dom";
import "../styles/index.css";

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
        <Link to="/signup" className="cta-btn">
          Get started
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
          <h3>500K+</h3>
          <p>Artists</p>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="features">
        <h2>What you can do</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <span>🔍</span>
            <h3>Search songs</h3>
            <p>Find any track by title, artist, or lyrics.</p>
          </div>
          <div className="feature-card">
            <span>🎬</span>
            <h3>Watch videos</h3>
            <p>Play official YouTube videos in-app.</p>
          </div>
          <div className="feature-card">
            <span>📝</span>
            <h3>Read lyrics</h3>
            <p>View full lyrics for millions of songs.</p>
          </div>
          <div className="feature-card">
            <span>❤️</span>
            <h3>Save favourites</h3>
            <p>Build your personal music library.</p>
          </div>
        </div>
      </section>

      {/* New Features Section */}
      <section className="features features--new">
        <h2>
          New Features <span className="badge-new">New</span>
        </h2>
        <div className="feature-grid feature-grid--two-col">
          <div className="feature-card">
            <span>📂</span>
            <h3>Playlists</h3>
            <p>Create and manage your own playlists, organised your way.</p>
          </div>
          <div className="feature-card">
            <span>👤</span>
            <h3>User accounts</h3>
            <p>Sign up to save your music and access it from anywhere.</p>
          </div>
          <div className="feature-card">
            <span>❤️</span>
            <h3>Favourites sync</h3>
            <p>Your favourites are now saved to your account.</p>
          </div>
          <div className="feature-card">
            <span>🛠️</span>
            <h3>Admin dashboard</h3>
            <p>Platform admins can manage users, playlists, and view stats.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Sign up</h3>
            <p>Create your free account in seconds.</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>Search</h3>
            <p>Find songs and artists you love.</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>Enjoy</h3>
            <p>Watch, read lyrics, save favourites, build playlists.</p>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <h2>Ready to explore music?</h2>
        <p>Create a free account and start building your library today.</p>
        <Link to="/signup" className="cta-btn">
          Create your account
        </Link>
        <p className="cta-login-hint">
          Already have an account?{" "}
          <Link to="/login" className="cta-link">
            Log in
          </Link>
        </p>
      </section>
    </div>
  );
}

export default Home;
