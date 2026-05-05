import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import Home from "../pages/Home.jsx";
import Search from "../pages/Search.jsx";
// import VideoPage from "../pages/VideoPage.jsx";
// import FavoritesPage from "../pages/FavoritesPage.jsx";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          {/* <Route path="/video/:artist/:title" element={<VideoPage />} /> */}
          {/* <Route path="/favorites" element={<FavoritesPage />} /> */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
