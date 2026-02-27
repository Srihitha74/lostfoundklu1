import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HeroLanding from './pages/HeroLanding/HeroLanding.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ItemReporting from './pages/ItemReporting/ItemReporting.jsx';
import ItemGallery from './pages/ItemGallery/ItemGallery.jsx';
import ItemDetail from './pages/ItemDetail/ItemDetail.jsx';
import SocialFeed from './pages/SocialFeed/SocialFeed.jsx';
import Profile from './pages/Profile/Profile.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

import './styles/global.css';
import { AnimatePresence } from 'framer-motion';   // ✅ added this

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HeroLanding />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SocialFeed />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ItemReporting />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/gallery" element={<ItemGallery />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
