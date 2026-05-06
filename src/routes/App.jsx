import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import Home from "../pages/Home.jsx";
import Search from "../pages/Search.jsx";
import VideoPage from "../pages/VideoPage.jsx";
import Favourites from "../pages/Favourites.jsx";
import Genres from "../pages/Genre.jsx";
import Trending from "../pages/Trending.jsx";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Main pages */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />

          {/* YouTube video player — receives artist and title from SongTable link */}
          <Route path="/video/:artist/:title" element={<VideoPage />} />

          {/* Favourites — reads from db.json via useFavorites hook */}
          <Route path="/favourites" element={<Favourites />} />

          {/* Browse by genre — fetches from Deezer genre endpoint */}
          <Route path="/genres" element={<Genres />} />

          {/* Trending — fetches from Deezer chart endpoint */}
          <Route path="/trending" element={<Trending />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
