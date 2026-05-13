import "../styles/index.css";

function About() {
  return (
    <div className="about">
      <h1>
        About <span>Tunely</span>
      </h1>
      <p>
        Tunely is your all-in-one music discovery platform. We make it easy to
        search songs, explore artists, watch videos, and read lyrics — all in
        one place.
      </p>

      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          Music connects people everywhere. Our mission is to bring that
          connection closer by giving you instant access to songs, videos,
          lyrics, and playlists, all tailored to your taste.
        </p>
      </section>

      <section className="about-section">
        <h2>What's New in Tunely</h2>
        <ul>
          <li>Create and manage playlists your way.</li>
          <li>Sync favorites to your account, not just your browser.</li>
          <li>User accounts to save your music library anywhere.</li>
          <li>Admin dashboard for managing users and stats.</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Why Tunely?</h2>
        <p>
          Unlike other platforms, Tunely combines search, video playback,
          lyrics, and personalized favorites in one seamless experience. Whether
          you are a casual listener or a music enthusiast, Tunely helps you
          discover and enjoy music instantly.
        </p>
      </section>
    </div>
  );
}

export default About;
