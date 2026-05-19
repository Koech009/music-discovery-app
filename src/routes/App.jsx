import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import Home from "../pages/Home.jsx";
import About from "../pages/About.jsx";
import Contact from "../pages/Contact.jsx";
import Login from "../pages/auth/Login.jsx";
import Signup from "../pages/auth/Signup.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

// Dashboard imports
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import UserDashboard from "../pages/user/UserDashboard.jsx";
import Search from "../pages/Search.jsx";
import VideoPage from "../pages/VideoPage.jsx";
import Playlists from "../pages/Playlists.jsx";
import Favourites from "../pages/Favourites.jsx";
import Genres from "../pages/Genre.jsx";
import Trending from "../pages/Trending.jsx";
import Profile from "../pages/Profile.jsx";

// Admin imports
import AdminOverview from "../pages/admin/AdminOverview.jsx";
import AdminUsers from "../pages/admin/AdminManageUsers.jsx";
import AdminMessages from "../pages/admin/AdminMessages";
import UserDetailsPage from "../pages/admin/UserDetailsPage";
import PendingAdmins from "../pages/admin/PendingAdmin.jsx";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
              <Footer />
            </>
          }
        />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="search" element={<Search />} />
          <Route path="video/:artist/:title" element={<VideoPage />} />
          <Route path="favourites" element={<Favourites />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="genres" element={<Genres />} />
          <Route path="trending" element={<Trending />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="search" element={<Search />} />
          <Route path="video/:artist/:title" element={<VideoPage />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="trending" element={<Trending />} />
          <Route path="genres" element={<Genres />} />
          <Route path="favourites" element={<Favourites />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="pending" element={<PendingAdmins />} />
          <Route path="audit" element={<AdminAuditLogs />} />
          <Route path="profile" element={<Profile />} />
          <Route path="/admin/users/:id" element={<UserDetailsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
