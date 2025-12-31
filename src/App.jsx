import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HeroLanding from './pages/HeroLanding/HeroLanding.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ItemReporting from './pages/ItemReporting/ItemReporting.jsx';
import ItemGallery from './pages/ItemGallery/ItemGallery.jsx';
import ItemDetail from './pages/ItemDetail/ItemDetail.jsx';
import SocialFeed from './pages/SocialFeed/SocialFeed.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

import './styles/global.css';
import { AnimatePresence } from 'framer-motion';   // ✅ added this

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HeroLanding />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/feed" element={<ProtectedRoute><SocialFeed /></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute><ItemReporting /></ProtectedRoute>} />
              <Route path="/gallery" element={<ItemGallery />} />
              <Route path="/item/:id" element={<ItemDetail />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

