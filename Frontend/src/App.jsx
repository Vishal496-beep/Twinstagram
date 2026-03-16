import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import TweetSection from "./components/TweetSection.jsx";
import VideoFeed from "./pages/VideoFeed.jsx";
import VideoDetails from "./pages/VideoDetails.jsx"; 
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PhotoFeed from "./pages/PhotoFeed.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import Profile from "./pages/Profile.jsx";
import Search from "./pages/SearchResults.jsx";
import FollowPage from "./pages/FollowPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Main Application Routes */}
        <Route path="/" element={<Layout />}>
          {/* Default landing page redirects to videos */}
          <Route index element={<Navigate to="/videos" replace />} />
          
          <Route path="videos" element={<VideoFeed />} />
          
          {/* Dynamic Route for Video Player - Matches your navigate("/v/...") */}
          <Route path="v/:videoId" element={<VideoDetails />} />
          
          <Route path="photos" element={<PhotoFeed />} />
          
          <Route path="search" element={<Search />} />
          <Route path="/followers/:profileId" element={<FollowPage />} />
          <Route path="/following/:profileId" element={<FollowPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:username" element={<UserProfile />} />
          
          <Route path="tweets" element={<TweetSection />} />
        </Route>

        {/* 🚨 Catch-all: Only redirect to login if the route truly doesn't exist */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;