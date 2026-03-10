# Frontend JSX Files - Complete Code

All `.jsx` files from the frontend/src directory for easy copy-paste.

---

## 1. src/main.jsx

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## 2. src/App.jsx

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HeroLanding from './pages/HeroLanding/HeroLanding.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ItemReporting from './pages/ItemReporting/ItemReporting.jsx';
import ItemGallery from './pages/ItemGallery/ItemGallery.jsx';
import ItemDetail from './pages/ItemDetail/ItemDetail.jsx';
import SocialFeed from './pages/SocialFeed/SocialFeed.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Messages from './pages/Messages/Messages.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

import './styles/global.css';
import { AnimatePresence } from 'framer-motion';

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
            path="/messages"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Messages />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
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
```

---

## 3. src/contexts/AuthContext.jsx

```jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setUser({ token });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);

    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const value = {
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 4. src/components/ProtectedRoute.jsx

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
```

---

## 5. src/components/DashboardLayout.jsx

```jsx
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar/Navbar.jsx';
import { IoArrowUp } from 'react-icons/io5';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        {children}
      </main>
      
      <button 
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <IoArrowUp />
      </button>
    </div>
  );
};

export default DashboardLayout;
```

---

## 6. src/components/Navbar/Navbar.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { IoMenu, IoClose, IoChatbubble, IoChatbubbles } from 'react-icons/io5';
import axios from 'axios';
import './Navbar.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_BASE}/api/messages/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUnreadCount(response.data.count || 0);
        } catch (error) {
          console.log('Error fetching unread count');
        }
      };
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000 => clearInterval();
      return ()interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-brand" onClick={() => handleNavigation('/')}>
          <h3>Campus Reconnect</h3>
        </div>
        
        <div className="nav-links">
          {user ? (
            <>
              <button className="nav-link" onClick={() => handleNavigation('/dashboard')}>
                Dashboard
              </button>
              <button className="nav-link" onClick={() => handleNavigation('/feed')}>
                Feed
              </button>
              <button className="nav-link" onClick={() => handleNavigation('/report')}>
                Report
              </button>
              <button className="nav-link" onClick={() => handleNavigation('/messages')}>
                <IoChatbubbles /> Messages
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
              </button>
              <button className="nav-link logout" onClick={handleLogout}>
                Logout
              </button>
              <button className="nav-link" onClick={() => handleNavigation('/profile')}>
                Edit Profile
              </button>
            </>
          ) : (
            <button className="nav-link" onClick={() => handleNavigation('/')}>
              Login
            </button>
          )}
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <IoClose /> : <IoMenu />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {user && (
            <>
              <button className="nav-link" onClick={() => handleNavigation('/dashboard')}>
                Dashboard
              </button>
              <button className="nav-link" onClick={() => handleNavigation('/feed')}>
                Feed
              </button>
              <button className="nav-link" onClick={() => handleNavigation('/report')}>
                Report
              </button>
              <button className="nav-link" onClick={() => handleNavigation('/messages')}>
                <IoChatbubbles /> Messages
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
              </button>
            </>
          )}
          {user ? (
            <>
              <button className="nav-link" onClick={() => handleNavigation('/profile')}>
                Edit Profile
              </button>
              <button className="nav-link logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="nav-link" onClick={() => handleNavigation('/')}>
              Login
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
```

---

## 7. src/components/AuthModal/AuthModal.jsx

```jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoClose, IoEye, IoEyeOff, IoMail, IoCheckmarkCircle, IoRefresh } from 'react-icons/io5';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  reload
} from 'firebase/auth';
import { getToken } from 'firebase/messaging';
import { auth, messaging } from '../../firebase';
import './AuthModal.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [firebaseUserForVerification, setFirebaseUserForVerification] = useState(null);
  const [verificationChecking, setVerificationChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
    exit:   { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  const formVariants = {
    hidden:   { x: isLogin ? -20 : 20, opacity: 0 },
    visible:  { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit:     { x: isLogin ? 20 : -20, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendVerification = async () => {
    if (!firebaseUserForVerification || resendCooldown > 0) return;
    try {
      await sendEmailVerification(firebaseUserForVerification);
      startResendCooldown();
    } catch (err) {
      setErrors({ general: 'Failed to resend. Please try again.' });
    }
  };

  const handleCheckVerification = async () => {
    setVerificationChecking(true);
    setErrors({});

    try {
      let freshUser = firebaseUserForVerification;

      try {
        if (freshUser) {
          await reload(freshUser);
        } else {
          const userCredential = await signInWithEmailAndPassword(
            auth, formData.email, formData.password
          );
          freshUser = userCredential.user;
        }
      } catch {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth, formData.email, formData.password
          );
          freshUser = userCredential.user;
        } catch (signInErr) {
          setErrors({ general: 'Could not check verification status. Please try logging in again.' });
          setVerificationChecking(false);
          return;
        }
      }

      if (freshUser && freshUser.emailVerified) {
        const response = await fetch(`${API_BASE}/api/auth/firebase-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: freshUser.email,
            uid:   freshUser.uid,
            name:  formData.name || null,
            emailVerified: true
          })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              const fcmToken = await getToken(messaging, {
                vapidKey: 'BNU5zQ10c6gSQYOiRofYD-MSxF8KZ4e8dZdphGQTYUQRl9TJdJPkItOFcSpglfvzy2lv2894670i8sy6qeaakdk'
              });
              if (fcmToken) {
                await fetch(`${API_BASE}/api/auth/update-fcm-token`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.token}` },
                  body: JSON.stringify({ fcmToken })
                });
              }
            }
          } catch { }

          setVerificationChecking(false);
          onClose();
          navigate('/dashboard');
        } else {
          const errData = await response.json();
          setErrors({ general: errData.error || 'Login failed after verification.' });
          setVerificationChecking(false);
        }
      } else {
        setErrors({ general: 'Email not verified yet. Please check your inbox and click the link.' });
        setVerificationChecking(false);
      }
    } catch (err) {
      setErrors({ general: 'Error checking verification. Please try again.' });
      setVerificationChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        let firebaseSuccess = false;

        try {
          const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
          const firebaseUser = userCredential.user;
          firebaseSuccess = true;

          if (!firebaseUser.emailVerified) {
            setFirebaseUserForVerification(firebaseUser);
            setShowVerificationScreen(true);
            await sendEmailVerification(firebaseUser);
            startResendCooldown();
            setIsLoading(false);
            return;
          }

          const response = await fetch(`${API_BASE}/api/auth/firebase-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: firebaseUser.email,
              uid:   firebaseUser.uid,
              name:  null,
              emailVerified: true
            })
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            setIsLoading(false);
            onClose();
            navigate('/dashboard');
            return;
          } else {
            const errData = await response.json();
            setErrors({ general: errData.error || 'Login failed' });
            setIsLoading(false);
            return;
          }
        } catch (firebaseErr) {
          if (firebaseErr.code !== 'auth/user-not-found' &&
              firebaseErr.code !== 'auth/wrong-password' &&
              firebaseErr.code !== 'auth/invalid-credential' &&
              firebaseErr.code !== 'auth/invalid-email') {
            firebaseSuccess = false;
          }
        }

        if (!firebaseSuccess) {
          const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, password: formData.password })
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            setIsLoading(false);
            onClose();
            navigate('/dashboard');
          } else {
            const errData = await response.json();
            if (errData.error === 'EMAIL_NOT_VERIFIED') {
              setErrors({ general: 'Please verify your email before logging in.' });
            } else {
              setErrors({ general: 'Invalid email or password.' });
            }
            setIsLoading(false);
          }
        }

      } else {
        if (formData.password !== formData.confirmPassword) {
          setErrors({ confirmPassword: 'Passwords do not match' });
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setErrors({ password: 'Password must be at least 6 characters' });
          setIsLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const firebaseUser = userCredential.user;

        try {
          await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name:     formData.name,
              email:    formData.email,
              password: formData.password,
              firebaseUid: firebaseUser.uid
            })
          });
        } catch { }

        await sendEmailVerification(firebaseUser);
        startResendCooldown();

        setFirebaseUserForVerification(firebaseUser);
        setShowVerificationScreen(true);
        setIsLoading(false);
      }
    } catch (err) {
      let msg = 'Authentication failed. Please try again.';
      if (err.code === 'auth/user-not-found')       msg = 'No account found with this email.';
      else if (err.code === 'auth/wrong-password')  msg = 'Incorrect password.';
      else if (err.code === 'auth/email-already-in-use') msg = 'Email already in use. Please login.';
      else if (err.code === 'auth/weak-password')   msg = 'Password must be at least 6 characters.';
      else if (err.code === 'auth/invalid-email')   msg = 'Invalid email address.';
      else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Please try again later.';
      setErrors({ general: msg });
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleTabSwitch = (loginMode) => {
    setIsLogin(loginMode);
    setErrors({});
    setShowVerificationScreen(false);
  };

  const VerificationScreen = () => (
    <motion.div
      className="verification-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="verification-icon">
        <IoMail />
      </div>

      <h3>Check your email!</h3>
      <p className="verification-sub">
        We sent a verification link to
      </p>
      <p className="verification-email">
        <strong>{formData.email}</strong>
      </p>
      <p className="verification-instruction">
        Click the link in the email, then come back and press the button below.
      </p>

      {errors.general && (
        <div className="error-text general-error" style={{ marginBottom: '12px' }}>
          {errors.general}
        </div>
      )}

      <motion.button
        className="btn btn-primary auth-submit"
        onClick={handleCheckVerification}
        disabled={verificationChecking}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {verificationChecking ? (
          <div className="loading-spinner" />
        ) : (
          <><IoCheckmarkCircle /> I've verified my email</>
        )}
      </motion.button>

      <button
        className="resend-btn"
        onClick={handleResendVerification}
        disabled={resendCooldown > 0}
      >
        <IoRefresh />
        {resendCooldown > 0
          ? `Resend in ${resendCooldown}s`
          : 'Resend verification email'
        }
      </button>

      <button
        className="back-to-login-btn"
        onClick={() => { setShowVerificationScreen(false); setErrors({}); }}
      >
        ← Back
      </button>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="auth-modal-overlay">
          <motion.div
            className="auth-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button className="close-btn" onClick={onClose}>
              <IoClose />
            </button>

            <div className="auth-header">
              <h2>Welcome to Campus Reconnect</h2>
              {!showVerificationScreen && (
                <div className="auth-tabs">
                  <button className={`tab ${isLogin ? 'active' : ''}`} onClick={() => handleTabSwitch(true)}>
                    Login
                  </button>
                  <button className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => handleTabSwitch(false)}>
                    Sign Up
                  </button>
                  <motion.div
                    className="tab-indicator"
                    animate={{ x: isLogin ? 0 : '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {showVerificationScreen ? (
                <VerificationScreen key="verify" />
              ) : (
                <motion.form
                  key={isLogin ? 'login' : 'signup'}
                  className="auth-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleSubmit}
                >
                  {!isLogin && (
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text" name="name" value={formData.name}
                        onChange={handleInputChange}
                        className={`form-input ${errors.name ? 'error' : ''}`}
                        placeholder="Enter your full name" required
                      />
                      {errors.name && <span className="error-text animate-shake">{errors.name}</span>}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email" name="email" value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Enter your email" required
                    />
                    {errors.email && <span className="error-text animate-shake">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-input">
                      <input
                        type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                        onChange={handleInputChange}
                        className={`form-input ${errors.password ? 'error' : ''}`}
                        placeholder="Enter your password" required
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <IoEyeOff /> : <IoEye />}
                      </button>
                    </div>
                    {errors.password && <span className="error-text animate-shake">{errors.password}</span>}
                  </div>

                  {!isLogin && (
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input
                        type="password" name="confirmPassword" value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                        placeholder="Confirm your password" required
                      />
                      {errors.confirmPassword && <span className="error-text animate-shake">{errors.confirmPassword}</span>}
                    </div>
                  )}

                  {errors.general && <div className="error-text general-error">{errors.general}</div>}

                  <motion.button
                    type="submit"
                    className={`btn btn-primary auth-submit ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? <div className="loading-spinner" /> : (isLogin ? 'Sign In' : 'Create Account')}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
```

---

## 8. src/components/ItemCard/ItemCard.jsx

```jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoLocation, IoTime, IoChatbubble, IoClose } from 'react-icons/io5';
import './ItemCard.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const ItemCard = ({ item, onDelete, isOwnItem = false }) => {
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedItem, setMatchedItem] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const navigate = useNavigate();

  const fetchMatchedItem = async () => {
    if (!item.matchedItemId) return;

    setLoadingMatch(true);
    try {
      const response = await fetch(`${API_BASE}/api/items/${item.matchedItemId}`);
      if (response.ok) {
        const data = await response.json();
        setMatchedItem(data);
        setShowMatchModal(true);
      }
    } catch (error) {
      console.error('Error fetching matched item:', error);
    } finally {
      setLoadingMatch(false);
    }
  };

  return (
    <motion.div 
      className="item-card"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/item/${item.id}`)}
    >
      <div className="item-image-full">
    <img 
      src={item.imageUrl ? `${API_BASE}${item.imageUrl}` : '/placeholder-image.svg'} 
      alt={item.title}
      className="full-image"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/placeholder-image.svg';
      }}
    />
    <div className="item-overlay">
      <motion.button 
        className="view-details-btn"
        initial={{ y: 20, opacity: 0 }}
        whileHover={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        View Details
      </motion.button>
    </div>
      </div>

      <div className="item-content">
        <div className="item-header">
          <h3 className="item-title">{item.title}</h3>
          <div className="item-badges">
            <span className={`status-badge ${item.status}`}>
              {item.status}
            </span>
            {item.aiMatched && (
              <div className="ai-match-indicator">
                <span
                  className="ai-match-badge clickable"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchMatchedItem();
                  }}
                >
                  🤖 AI Match Found
                </span>
                <small className="ai-match-text">Google AI detected a similar item</small>
              </div>
            )}
          </div>
        </div>
        
        <p className="item-category">{item.category}</p>
        
        <div className="item-meta">
          <div className="meta-item">
            <IoLocation />
            <span>{item.location}</span>
          </div>
          <div className="meta-item">
            <IoTime />
            <span>{item.date}</span>
          </div>
        </div>
        
        <div className="item-actions">
          {!isOwnItem && (
            <motion.button
              className="btn btn-sm btn-accent"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/item/${item.id}`);
              }}
            >
              <IoChatbubble />
              Message
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              className="btn btn-sm btn-danger"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              🗑️ Delete
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showMatchModal && matchedItem && (
          <motion.div
            className="ai-match-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMatchModal(false)}
          >
            <motion.div
              className="ai-match-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>🤖 AI Match Found!</h3>
                <button
                  className="close-modal-btn"
                  onClick={() => setShowMatchModal(false)}
                >
                  <IoClose />
                </button>
              </div>

              <div className="modal-content">
                <div className="match-header">
                  <div className="ai-icon">🤖</div>
                  <div className="match-title">
                    <h2>AI Match Found!</h2>
                    <p>Google AI detected a potential match for your {item.status.toLowerCase()} item</p>
                  </div>
                </div>

                <div className="match-comparison">
                  <div className="item-comparison">
                    <div className="comparison-item your-item">
                      <h3>Your Item</h3>
                      <div className="item-card-preview">
                        <span className={`status-badge ${item.status}`}>{item.status}</span>
                        <h4>{item.title}</h4>
                        <p className="item-category">{item.category}</p>
                        <p className="item-location">📍 {item.location}</p>
                        <p className="item-date">🕒 {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="match-connector">
                      <div className="ai-brain">🧠</div>
                      <p>AI Matched</p>
                      <div className="match-line"></div>
                    </div>

                    <div className="comparison-item matched-item">
                      <h3>Potential Match</h3>
                      <div className="item-card-preview">
                        <span className={`status-badge ${matchedItem.status}`}>{matchedItem.status}</span>
                        <h4>{matchedItem.title}</h4>
                        <p className="item-category">{matchedItem.category}</p>
                        <p className="item-location">📍 {matchedItem.location}</p>
                        <p className="item-date">🕒 {new Date(matchedItem.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="match-analysis">
                  <h4>🤖 AI Analysis Results</h4>
                  <div className="analysis-details">
                    <div className="analysis-item">
                      <span className="check-icon">✅</span>
                      <span>Both items have AI-analyzed images with visual features</span>
                    </div>
                    <div className="analysis-item">
                      <span className="check-icon">✅</span>
                      <span>Items are complementary types ({item.status} ↔ {matchedItem.status})</span>
                    </div>
                    <div className="analysis-item">
                      <span className="ai-icon-small">🤖</span>
                      <span>Google Cloud Vision API detected similar object characteristics</span>
                    </div>
                  </div>
                </div>

                <div className="contact-section">
                  <h4>📞 Contact Information</h4>
                  <div className="contact-details">
                    <p><strong>Person who {matchedItem.status.toLowerCase()} this item:</strong></p>
                    <div className="contact-info">
                      <p>📧 <strong>Email:</strong> {matchedItem.contactInfo}</p>
                      <p>📝 <strong>Description:</strong> {matchedItem.description}</p>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-primary action-btn"
                    onClick={() => {
                      setShowMatchModal(false);
                      navigate(`/item/${matchedItem.id}`);
                    }}
                  >
                    📋 View Full Details & Contact
                  </button>
                  <button
                    className="btn btn-accent action-btn"
                    onClick={() => {
                      window.location.href = `mailto:${matchedItem.contactInfo}?subject=Regarding your ${matchedItem.status.toLowerCase()} ${matchedItem.title}&body=Hi, I found a potential match for your ${matchedItem.status.toLowerCase()} ${matchedItem.title}. My ${item.status.toLowerCase()} item details: ${item.title} - ${item.description}`;
                      setShowMatchModal(false);
                    }}
                  >
                    ✉️ Email Now
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowMatchModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ItemCard;
```

---

## 9. src/components/MultiImageUpload/MultiImageUpload.jsx

```jsx
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloudUpload, IoClose, IoCheckmark, IoImage, IoSparkles } from 'react-icons/io5';
import axios from 'axios';
import './MultiImageUpload.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://backend:8080';
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const MultiImageUpload = ({ 
  images, 
  setImages, 
  onAIAnalysis,
  disabled = false 
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const processFile = async (file, index) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return false;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const previewUrl = e.target.result;
        
        setImages(prev => {
          const newImages = [...prev];
          newImages[index] = {
            file,
            preview: previewUrl,
            isPrimary: prev.length === 0,
            id: Date.now() + index
          };
          return newImages;
        });

        setUploadProgress(prev => ({ ...prev, [index]: true }));

        if (index === 0) {
          await analyzeImage(file, index);
        }

        setUploadProgress(prev => ({ ...prev, [index]: false }));
        resolve(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const analyzeImage = async (file, index) => {
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);

      const response = await axios.post(
        `${API_BASE}/api/items/analyze-image`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (onAIAnalysis) {
        onAIAnalysis(response.data);
      }

      setImages(prev => {
        const newImages = [...prev];
        if (newImages[index]) {
          newImages[index].aiData = response.data;
        }
        return newImages;
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFiles = useCallback(async (files) => {
    setError(null);
    
    const validFiles = Array.from(files).filter(file => !validateFile(file));
    
    if (images.length + validFiles.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const newIndex = images.length + i;
      await processFile(file, newIndex);
    }
  }, [images.length]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (index === 0 && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (index) => {
    setImages(prev => {
      return prev.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }));
    });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="multi-image-upload">
      <div className="upload-header">
        <h3>
          <IoImage />
          Upload Images
        </h3>
        <span className="image-count">
          {images.length}/{MAX_IMAGES} images
        </span>
      </div>

      <div 
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${images.length > 0 ? 'has-images' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || images.length >= MAX_IMAGES}
          style={{ display: 'none' }}
        />

        <AnimatePresence mode="wait">
          {images.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="empty-state"
            >
              <motion.div 
                className="upload-icon"
                animate={dragOver ? { scale: 1.2, rotate: 10 } : {}}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <IoCloudUpload />
              </motion.div>
              <h4>Drag & drop images here</h4>
              <p>or click to browse</p>
              <span className="upload-hint">
                Supports JPG, PNG, GIF up to 5MB each
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="upload-more"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="add-more-state"
            >
              <div className="add-more-icon">
                <IoCloudUpload />
              </div>
              <span>Add more images</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            className="ai-analysis-status"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="ai-loading">
              <IoSparkles className="spinning" />
              <span>Analyzing first image with AI...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div 
            className="upload-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {images.length > 0 && (
        <div className="image-previews">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                className={`image-preview ${image.isPrimary ? 'primary' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <img src={image.preview} alt={`Preview ${index + 1}`} />
                
                <div className="image-overlay">
                  {image.isPrimary && (
                    <div className="primary-badge">
                      <IoCheckmark />
                      Primary
                    </div>
                  )}
                  
                  <button 
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    disabled={disabled}
                  >
                    <IoClose />
                  </button>
                  
                  {!image.isPrimary && (
                    <button 
                      className="primary-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimaryImage(index);
                      }}
                      disabled={disabled}
                    >
                      Set Primary
                    </button>
                  )}
                </div>

                {uploadProgress[index] && (
                  <div className="upload-progress">
                    <div className="progress-bar" />
                  </div>
                )}

                {image.aiData && (
                  <div className="ai-badge">
                    <IoSparkles />
                    {image.aiData.category}
                    {image.aiData.confidenceScore && (
                      <span className="confidence">
                        {Math.round(image.aiData.confidenceScore)}%
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {images.length > 0 && images[0]?.aiData && (
        <motion.div 
          className="ai-suggestions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h4>
            <IoSparkles />
            AI Detected
          </h4>
          <div className="suggestion-content">
            {images[0].aiData.category && (
              <div className="suggestion-item">
                <strong>Category:</strong> {images[0].aiData.category}
                {images[0].aiData.confidenceScore && (
                  <span className="confidence-badge">
                    {Math.round(images[0].aiData.confidenceScore)}% confidence
                  </span>
                )}
              </div>
            )}
            {images[0].aiData.detectedColors && images[0].aiData.detectedColors !== 'Unknown' && (
              <div className="suggestion-item">
                <strong>Colors:</strong> {images[0].aiData.detectedColors}
              </div>
            )}
            {images[0].aiData.detectedBrands && (
              <div className="suggestion-item">
                <strong>Brands:</strong> {images[0].aiData.detectedBrands}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MultiImageUpload;
```

---

## 10. src/components/QuickTemplates/QuickTemplates.jsx

```jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoPhonePortrait, 
  IoWallet, 
  IoKey, 
  IoBook, 
  IoBag, 
  IoShirt,
  IoLaptop,
  IoHeadset,
  IoTime,
  IoGlasses,
  IoUmbrella,
  IoFlash,
  IoAdd,
  IoMic
} from 'react-icons/io5';
import VoiceInput from '../VoiceInput/VoiceInput';
import './QuickTemplates.css';

const BLOCKS = ['C Block', 'S Block', 'R Block', 'F Block', 'M Block', 'SK Block','Arts Block'];
const CANTEENS = ['Satish Canteen', 'Main Canteen'];
const OTHERS = ['Library', 'Parking'];

const getTemplatesByCategory = () => {
  const grouped = {};
  TEMPLATES.forEach(template => {
    if (!grouped[template.category]) {
      grouped[template.category] = [];
    }
    grouped[template.category].push(template);
  });
  return grouped;
};

const TEMPLATES = [
  {
    id: 'phone',
    name: 'Phone',
    icon: <IoPhonePortrait />,
    category: 'Electronics',
    colors: ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Rose Gold'],
    brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'earbuds',
    name: 'Earbuds',
    icon: <IoHeadset />,
    category: 'Electronics',
    colors: ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Rose Gold'],
    brands: ['Apple', 'Samsung', 'Google', 'Sony', 'JBL', 'BoAt', 'Noise', 'OnePlus'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'wallet',
    name: 'Wallet',
    icon: <IoWallet />,
    category: 'Accessories',
    colors: ['Black', 'Brown', 'Tan', 'Red', 'Navy', 'Burgundy'],
    brands: ['Coach', 'Michael Kors', 'Louis Vuitton', 'Hermes', 'Ralph Lauren', 'Tommy Hilfiger'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'keys',
    name: 'Keys',
    icon: <IoKey />,
    category: 'Keys',
    colors: ['Silver', 'Gold', 'Black', 'Blue', 'Bronze'],
    brands: ['Yale', 'Schlage', 'Kwikset', 'Master Lock'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'idcard',
    name: 'ID Card',
    icon: <IoKey />,
    category: 'Keys',
    colors: ['Red', 'Blue', 'Green', 'Yellow'],
    brands: ['University', 'College', 'Institute'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'books',
    name: 'Books',
    icon: <IoBook />,
    category: 'Books',
    colors: ['Various', 'Blue', 'Red', 'Green', 'Black', 'Yellow'],
    brands: ['Oxford', 'Cambridge', 'Penguin', 'HarperCollins'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: <IoBag />,
    category: 'Bags',
    colors: ['Black', 'Navy', 'Brown', 'Green', 'Gray', 'Red', 'Blue'],
    brands: ['North Face', 'Herschel', 'JanSport', 'Osprey', 'Nike', 'Adidas', 'Puma'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'clothing',
    name: 'Clothing',
    icon: <IoShirt />,
    category: 'Clothing',
    colors: ['Black', 'White', 'Navy', 'Gray', 'Brown', 'Green', 'Red', 'Blue'],
    brands: ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Uniqlo', 'Levis'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'jacket',
    name: 'Jacket',
    icon: <IoShirt />,
    category: 'Clothing',
    colors: ['Black', 'Navy', 'Brown', 'Green', 'Gray', 'Red', 'Blue', 'White'],
    brands: ['North Face', 'Columbia', 'Adidas', 'Nike', 'Zara', 'Jack & Jones'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'laptop',
    name: 'Laptop',
    icon: <IoLaptop />,
    category: 'Electronics',
    colors: ['Silver', 'Space Gray', 'Black', 'White', 'Rose Gold'],
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Microsoft', 'ASUS', 'Acer', 'MSI'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'tablet',
    name: 'Tablet',
    icon: <IoLaptop />,
    category: 'Electronics',
    colors: ['Silver', 'Space Gray', 'Black', 'Gold'],
    brands: ['Apple', 'Samsung', 'Lenovo', 'Microsoft', 'ASUS'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'headphones',
    name: 'Headphones',
    icon: <IoHeadset />,
    category: 'Electronics',
    colors: ['Black', 'White', 'Silver', 'Gold', 'Rose Gold', 'Blue', 'Red'],
    brands: ['Sony', 'Bose', 'Beats', 'JBL', 'Audio-Technica', 'Sennheiser', 'AKG'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'smartwatch',
    name: 'Smartwatch',
    icon: <IoTime />,
    category: 'Accessories',
    colors: ['Silver', 'Gold', 'Black', 'Rose Gold', 'White', 'Blue', 'Green'],
    brands: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Noise', 'BoAt'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'watch',
    name: 'Watch',
    icon: <IoTime />,
    category: 'Accessories',
    colors: ['Silver', 'Gold', 'Black', 'Rose Gold', 'White', 'Brown', 'Blue'],
    brands: ['Rolex', 'Casio', 'Seiko', 'Titan', 'Fastrack', 'Omega'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'glasses',
    name: 'Glasses',
    icon: <IoGlasses />,
    category: 'Accessories',
    colors: ['Black', 'Brown', 'Tortoise', 'Gold', 'Silver', 'Red', 'Blue'],
    brands: ['Ray-Ban', 'Oakley', 'Warby Parker', 'Prada', 'Gucci'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'umbrella',
    name: 'Umbrella',
    icon: <IoUmbrella />,
    category: 'Accessories',
    colors: ['Black', 'Navy', 'Green', 'Red', 'Patterned', 'Yellow', 'Pink'],
    brands: ['Totes', 'Blunt', 'Fanny', 'Senninger', 'Nintendo'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'charger',
    name: 'Charger',
    icon: <IoFlash />,
    category: 'Electronics',
    colors: ['White', 'Black', 'Gray', 'Silver', 'Blue'],
    brands: ['Apple', 'Samsung', 'Anker', 'Belkin', 'Sony', 'OnePlus'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'cable',
    name: 'Cable',
    icon: <IoFlash />,
    category: 'Electronics',
    colors: ['White', 'Black', 'Gray', 'Silver', 'Blue', 'Red'],
    brands: ['Apple', 'Samsung', 'Anker', 'Belkin', 'UGREEN', 'Baseus'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  }
];

const QuickTemplates = ({ onSelectTemplate, selectedTemplate, onSelectDetail }) => {
  const [customColors, setCustomColors] = useState([]);
  const [customBrands, setCustomBrands] = useState([]);
  const [customLocations, setCustomLocations] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [newValue, setNewValue] = useState('');
  const [blockRoomInput, setBlockRoomInput] = useState(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const handleAddClick = (field) => {
    setActiveInput(field);
    setNewValue('');
  };

  const handleAddValue = (field) => {
    if (newValue.trim()) {
      const trimmedValue = newValue.trim();
      if (field === 'color' && !customColors.includes(trimmedValue)) {
        setCustomColors([...customColors, trimmedValue]);
      } else if (field === 'brand' && !customBrands.includes(trimmedValue)) {
        setCustomBrands([...customBrands, trimmedValue]);
      } else if (field === 'location' && !customLocations.includes(trimmedValue)) {
        setCustomLocations([...customLocations, trimmedValue]);
      }
    }
    setActiveInput(null);
    setNewValue('');
  };

  const handleBlockClick = (blockName) => {
    setBlockRoomInput(blockName);
    setRoomNumber('');
  };

  const handleRoomNumberSubmit = (blockName) => {
    if (roomNumber.trim()) {
      const locationValue = `${blockName}-${roomNumber.trim()}`;
      if (!customLocations.includes(locationValue)) {
        setCustomLocations([...customLocations, locationValue]);
      }
      onSelectDetail && onSelectDetail('location', locationValue);
    }
    setBlockRoomInput(null);
    setRoomNumber('');
  };

  const handleRoomKeyDown = (e, blockName) => {
    if (e.key === 'Enter') {
      handleRoomNumberSubmit(blockName);
    } else if (e.key === 'Escape') {
      setBlockRoomInput(null);
      setRoomNumber('');
    }
  };

  const handleVoiceTranscript = (text) => {
    onSelectDetail && onSelectDetail('description', text);
    setShowVoiceInput(false);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      handleAddValue(field);
    } else if (e.key === 'Escape') {
      setActiveInput(null);
      setNewValue('');
    }
  };

  const renderAddButton = (field, label) => (
    <div className="add-option-wrapper">
      <motion.button
        className="add-option-btn"
        onClick={() => handleAddClick(field)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={`Add custom ${label}`}
      >
        <IoAdd /> Add {label}
      </motion.button>
      <AnimatePresence>
        {activeInput === field && (
          <motion.div
            className="add-input-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <input
              type="text"
              className="add-option-input"
              placeholder={`Enter ${label}...`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, field)}
              autoFocus
            />
            <motion.button
              className="add-option-confirm"
              onClick={() => handleAddValue(field)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✓
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  
  return (
    <div className="quick-templates">
      <div className="templates-header">
        <h3>
          <IoFlash />
          Quick Templates
        </h3>
        <span className="templates-count">
          {TEMPLATES.length} templates
        </span>
      </div>
       
    <p className="templates-description">
      Select a template to auto-fill common item details
    </p>

    <div className="templates-grid">
      {TEMPLATES.map((template, index) => (
        <motion.div
          key={template.id}
          className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
          onClick={() => onSelectTemplate(template)}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="template-icon">
            {template.icon}
          </div>
          <div className="template-info">
            <h4>{template.name}</h4>
            <span className="template-category">{template.category}</span>
          </div>
          {selectedTemplate?.id === template.id && (
            <motion.div 
              className="selected-check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              ✓
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>

    {selectedTemplate && (
      <motion.div 
        className="template-details"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
      >
        <div className="template-details-header">
          <h4>Template Details - Click to add to description</h4>
          <motion.button
            className="voice-input-toggle"
            onClick={() => setShowVoiceInput(!showVoiceInput)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Use voice input"
          >
            <IoMic />
          </motion.button>
        </div>
        {showVoiceInput && (
          <div className="voice-input-section">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              placeholder="Speak to add details..."
            />
          </div>
        )}
        <p className="template-instruction">Tap on any option below to add it to your description</p>
         
        <div className="detail-section">
          <strong>Title:</strong>
          <div className="detail-tags">
            {getTemplatesByCategory()[selectedTemplate.category]?.map(template => (
              <motion.button 
                key={template.id} 
                className={`detail-tag title-tag ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => onSelectDetail && onSelectDetail('title', template.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {template.name}
              </motion.button>
            ))}
          </div>
        </div>
         
        <div className="detail-section">
          <strong>Colors:</strong>
          <div className="detail-tags">
            {selectedTemplate.colors.map(color => (
              <motion.button 
                key={color} 
                className="detail-tag color-tag"
                onClick={() => onSelectDetail && onSelectDetail('color', color)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {color}
              </motion.button>
            ))}
            {customColors.map(color => (
              <motion.button 
                key={color} 
                className="detail-tag color-tag custom-tag"
                onClick={() => onSelectDetail && onSelectDetail('color', color)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {color}
              </motion.button>
            ))}
            {renderAddButton('color', 'Color')}
          </div>
        </div>
        
        <div className="detail-section">
          <strong>Brands:</strong>
          <div className="detail-tags">
            {selectedTemplate.brands.map(brand => (
              <motion.button 
                key={brand} 
                className="detail-tag brand-tag"
                onClick={() => onSelectDetail && onSelectDetail('brand', brand)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {brand}
              </motion.button>
            ))}
            {customBrands.map(brand => (
              <motion.button 
                key={brand} 
                className="detail-tag brand-tag custom-tag"
                onClick={() => onSelectDetail && onSelectDetail('brand', brand)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {brand}
              </motion.button>
            ))}
            {renderAddButton('brand', 'Brand')}
          </div>
        </div>
        
        <div className="detail-section">
          <strong>Location:</strong>
          <div className="detail-tags">
            {BLOCKS.map(location => (
              <div key={location} className="block-location-wrapper">
                <motion.button 
                  key={location} 
                  className="detail-tag location-tag"
                  onClick={() => handleBlockClick(location)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {location}
                </motion.button>
                <AnimatePresence>
                  {blockRoomInput === location && (
                    <motion.div
                      className="room-input-container"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <input
                        type="text"
                        className="room-input"
                        placeholder="Room No."
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        onKeyDown={(e) => handleRoomKeyDown(e, location)}
                        autoFocus
                      />
                      <motion.button
                        className="room-confirm-btn"
                        onClick={() => handleRoomNumberSubmit(location)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✓
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {CANTEENS.map(location => (
              <motion.button 
                key={location} 
                className="detail-tag location-tag"
                onClick={() => onSelectDetail && onSelectDetail('location', location)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {location}
              </motion.button>
            ))}
            {OTHERS.map(location => (
              <motion.button 
                key={location} 
                className="detail-tag location-tag"
                onClick={() => onSelectDetail && onSelectDetail('location', location)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {location}
              </motion.button>
            ))}
            {customLocations.map(location => (
              <motion.button 
                key={location} 
                className="detail-tag location-tag custom-tag"
                onClick={() => onSelectDetail && onSelectDetail('location', location)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {location}
              </motion.button>
            ))}
            {renderAddButton('location', 'Location')}
          </div>
        </div>
      </motion.div>
    )}
  </div>
  );
};

export default QuickTemplates;
export { TEMPLATES };
```

---

## 11. src/components/VoiceInput/VoiceInput.jsx

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoMic,
  IoMicOff,
  IoStop,
  IoCheckmark,
  IoClose,
  IoVolumeHigh,
  IoSparkles,
  IoRefresh,
  IoAlertCircle,
  IoInformationCircle
} from 'react-icons/io5';
import './VoiceInput.css';

function extractFieldsLocally(transcript) {
  const text = transcript.toLowerCase();

  let type = 'lost';
  if (/\b(found|discovered|picked up|i found|someone found|i have found)\b/.test(text)) {
    type = 'found';
  } else if (/\b(lost|missing|can't find|cannot find|misplaced|i lost|dropped)\b/.test(text)) {
    type = 'lost';
  }

  const categoryMap = [
    { keywords: ['phone', 'iphone', 'samsung', 'mobile', 'charger', 'earbuds', 'airpods', 'headphones', 'laptop', 'tablet', 'ipad', 'macbook', 'earphone', 'cable', 'powerbank', 'camera'], category: 'Electronics' },
    { keywords: ['wallet', 'purse', 'bag', 'backpack', 'handbag', 'pouch', 'suitcase', 'luggage', 'tote'], category: 'Bags & Accessories' },
    { keywords: ['shirt', 'jacket', 'hoodie', 'sweater', 'cap', 'hat', 'shoes', 'sandals', 'clothes', 'uniform', 'scarf', 'gloves', 'coat', 'pants', 'jeans'], category: 'Clothing' },
    { keywords: ['book', 'notebook', 'notes', 'textbook', 'pen', 'pencil', 'calculator', 'stationery', 'diary', 'folder', 'binder'], category: 'Books & Stationery' },
    { keywords: ['id', 'card', 'passport', 'licence', 'license', 'document', 'certificate', 'aadhar', 'pan card', 'hall ticket'], category: 'Documents' },
    { keywords: ['key', 'keys', 'keychain'], category: 'Keys' },
    { keywords: ['bottle', 'lunch box', 'tiffin', 'umbrella', 'watch', 'glasses', 'spectacles', 'ring', 'bracelet', 'necklace', 'jewellery'], category: 'Personal Items' },
    { keywords: ['ball', 'bat', 'racket', 'racquet', 'helmet', 'sports', 'jersey', 'gym'], category: 'Sports Equipment' },
  ];

  let category = 'Other';
  for (const { keywords, category: cat } of categoryMap) {
    if (keywords.some(k => text.includes(k))) {
      category = cat;
      break;
    }
  }

  const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'grey', 'gray', 'brown', 'pink', 'purple', 'orange', 'silver', 'golden', 'gold'];
  const colorFound = colors.find(c => text.includes(c));

  const itemKeywords = ['phone', 'iphone', 'samsung', 'wallet', 'bag', 'backpack', 'laptop', 'charger',
    'earbuds', 'airpods', 'headphones', 'key', 'keys', 'id card', 'book', 'notebook',
    'watch', 'glasses', 'bottle', 'umbrella', 'jacket', 'shoes', 'pen', 'calculator',
    'tablet', 'ipad', 'macbook', 'powerbank', 'camera'];
  const itemFound = itemKeywords.find(i => text.includes(i));

  let title = '';
  if (colorFound && itemFound) {
    title = colorFound.charAt(0).toUpperCase() + colorFound.slice(1) + ' ' +
            itemFound.charAt(0).toUpperCase() + itemFound.slice(1);
  } else if (itemFound) {
    title = itemFound.charAt(0).toUpperCase() + itemFound.slice(1);
  } else {
    const words = transcript.trim().split(' ').slice(0, 5);
    title = words.join(' ');
  }

  const locationPatterns = [
    /(?:near|at|in|inside|outside|from|found at|found in|lost at|lost in|left at)\s+(?:the\s+)?([a-z0-9 ]+?)(?:\s+on|\s+at|\s+yesterday|\s+today|,|\.|$)/i,
    /(?:library|canteen|cafeteria|hostel|block|lab|classroom|ground|gym|park|gate|room|hall|auditorium|toilet|restroom|parking|bus stop|garden|corridor)[a-z0-9 ]*/i,
  ];
  let location = '';
  for (const pattern of locationPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      location = (match[1] || match[0]).trim();
      location = location.charAt(0).toUpperCase() + location.slice(1);
      break;
    }
  }

  const today = new Date();
  let date = '';
  if (/\btoday\b/.test(text)) {
    date = today.toISOString().split('T')[0];
  } else if (/\byesterday\b/.test(text)) {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    date = y.toISOString().split('T')[0];
  } else if (/\bmonday\b/.test(text)) {
    date = getLastWeekday(1);
  } else if (/\btuesday\b/.test(text)) {
    date = getLastWeekday(2);
  } else if (/\bwednesday\b/.test(text)) {
    date = getLastWeekday(3);
  } else if (/\bthursday\b/.test(text)) {
    date = getLastWeekday(4);
  } else if (/\bfriday\b/.test(text)) {
    date = getLastWeekday(5);
  } else if (/\bsaturday\b/.test(text)) {
    date = getLastWeekday(6);
  } else if (/\bsunday\b/.test(text)) {
    date = getLastWeekday(0);
  }

  const description = transcript.trim().charAt(0).toUpperCase() + transcript.trim().slice(1);

  return { type, title, category, description, location, date };
}

function getLastWeekday(dayOfWeek) {
  const today = new Date();
  const diff = (today.getDay() - dayOfWeek + 7) % 7 || 7;
  const d = new Date(today);
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

const FIELD_LABELS = {
  type:        'Type (Lost/Found)',
  title:       'Item Title',
  category:    'Category',
  description: 'Description',
  location:    'Location',
  date:        'Date'
};

const FIELD_ICONS = {
  type:        '🔖',
  title:       '📌',
  category:    '🗂️',
  description: '📝',
  location:    '📍',
  date:        '📅'
};

const VoiceInput = ({ onTranscript, onAIFill, existingText = '', placeholder = '' }) => {
  const [isListening, setIsListening]             = useState(false);
  const [transcript, setTranscript]               = useState(existingText);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported]             = useState(false);
  const [error, setError]                         = useState(null);
  const [volume, setVolume]                       = useState(0);
  const [isProcessingAI, setIsProcessingAI]       = useState(false);
  const [aiResult, setAiResult]                   = useState(null);
  const [showPreview, setShowPreview]             = useState(false);
  const [appliedFields, setAppliedFields]         = useState([]);

  const recognitionRef = useRef(null);
  const analyserRef    = useRef(null);
  const audioCtxRef    = useRef(null);
  const animFrameRef   = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setIsSupported(false); return; }
    setIsSupported(true);

    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = 'en-US';

    rec.onstart = () => { setIsListening(true); setError(null); };
    rec.onend   = () => { setIsListening(false); setInterimTranscript(''); };
    rec.onerror = (e) => {
      const msgs = {
        'no-speech':   'No speech detected. Please try again.',
        'not-allowed': 'Microphone access denied. Please allow microphone access.',
      };
      setError(msgs[e.error] || 'Speech recognition error. Please retry.');
      setIsListening(false);
    };

    rec.onresult = (event) => {
      let interim = '';
      let final   = transcript;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += (final ? ' ' : '') + piece;
        else interim += piece;
      }
      setTranscript(final);
      setInterimTranscript(interim);
    };

    recognitionRef.current = rec;

    return () => {
      rec.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => { setTranscript(existingText); }, [existingText]);

  const startViz = async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx      = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(Math.min(avg / 100, 1));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { }
  };

  const stopViz = () => {
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setVolume(0);
  };

  const startListening = async () => {
    if (!isSupported || !recognitionRef.current) return;
    setError(null);
    setAiResult(null);
    setShowPreview(false);
    setAppliedFields([]);
    await startViz();
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    stopViz();
  };

  const handleAnalyseWithAI = async () => {
    if (!transcript.trim()) return;
    setIsProcessingAI(true);
    setError(null);
    setShowPreview(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const result = extractFieldsLocally(transcript.trim());
      setAiResult(result);
      setShowPreview(true);
    } catch (err) {
      setError(`Parsing failed: ${err.message}. Please fill the form manually.`);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleApplyAll = () => {
    if (!aiResult || !onAIFill) return;
    onAIFill(aiResult);
    setAppliedFields(Object.keys(aiResult).filter(k => aiResult[k]));
    setShowPreview(false);
  };

  const handleApplyField = (field) => {
    if (!onAIFill || appliedFields.includes(field)) return;
    onAIFill({ [field]: aiResult[field] });
    setAppliedFields(prev => [...prev, field]);
  };

  const handleRawTranscript = () => {
    onTranscript?.(transcript);
  };

  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');
    setAiResult(null);
    setShowPreview(false);
    setAppliedFields([]);
    setError(null);
  };

  if (!isSupported) {
    return (
      <div className="voice-input-unsupported">
        <IoMicOff />
        <p>Voice input is not supported in this browser.</p>
        <p className="suggestion">Try Chrome, Edge, or Safari.</p>
      </div>
    );
  }

  return (
    <div className="voice-input-container">

      <div className="mic-button-wrapper">
        <AnimatePresence mode="wait">
          {!isListening ? (
            <motion.button
              key="start"
              className="mic-button"
              onClick={startListening}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <div className="mic-icon"><IoMic /></div>
              <span>Tap to speak</span>
              <small className="mic-hint">✨ Smart auto-fill will detect your item details</small>
            </motion.button>
          ) : (
            <motion.button
              key="stop"
              className="mic-button listening"
              onClick={stopListening}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <div className="mic-icon pulsing">
                <IoStop />
                <div className="volume-indicator" style={{ transform: `scale(${1 + volume * 0.6})` }} />
              </div>
              <span>Tap to stop</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isListening && (
          <motion.div
            className="audio-visualization"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="sound-bars">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="sound-bar"
                  animate={{ scaleY: 0.2 + volume * (0.8 + Math.sin(i * 0.9) * 0.3) }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
            <div className="listening-text">
              <IoVolumeHigh />
              <span>Speak now — describe the item, its type and location…</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(transcript || interimTranscript) && (
          <motion.div
            className="transcript-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="transcript-label">
              <IoInformationCircle /> What we heard
            </div>
            <div className="transcript-content">
              {transcript && <span className="final-transcript">{transcript}</span>}
              {interimTranscript && (
                <span className="interim-transcript"> {interimTranscript}</span>
              )}
            </div>

            {transcript && !isListening && (
              <motion.div className="transcript-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.button
                  className="action-btn ai-fill-btn"
                  onClick={handleAnalyseWithAI}
                  disabled={isProcessingAI}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isProcessingAI
                    ? <><span className="ai-spinner" /> Analysing your speech…</>
                    : <><IoSparkles /> Auto-fill form from speech</>
                  }
                </motion.button>

                <button className="action-btn plain-btn" onClick={handleRawTranscript}>
                  <IoCheckmark /> Use as description only
                </button>

                <button className="action-btn clear-btn" onClick={handleClear}>
                  <IoClose />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreview && aiResult && (
          <motion.div
            className="ai-preview-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="ai-preview-header">
              <div className="ai-preview-title">
                <IoSparkles className="sparkle-anim" />
                <span>Smart parser detected these fields</span>
              </div>
              <button className="close-preview-btn" onClick={() => setShowPreview(false)}>
                <IoClose />
              </button>
            </div>

            <div className="ai-fields-list">
              {Object.entries(aiResult).map(([field, value]) => {
                if (!value) return null;
                const applied = appliedFields.includes(field);
                return (
                  <motion.div
                    key={field}
                    className={`ai-field-row ${applied ? 'applied' : ''}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <div className="field-info">
                      <span className="field-icon">{FIELD_ICONS[field]}</span>
                      <div>
                        <span className="field-name">{FIELD_LABELS[field] || field}</span>
                        <span className="field-value">{String(value)}</span>
                      </div>
                    </div>
                    <button
                      className={`apply-field-btn ${applied ? 'done' : ''}`}
                      onClick={() => handleApplyField(field)}
                      disabled={applied}
                    >
                      {applied ? <><IoCheckmark /> Applied</> : 'Apply'}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <div className="ai-preview-footer">
              <motion.button
                className="apply-all-btn"
                onClick={handleApplyAll}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IoSparkles /> Apply All Fields to Form
              </motion.button>
              <button className="retry-btn" onClick={handleAnalyseWithAI}>
                <IoRefresh /> Re-analyse
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {appliedFields.length > 0 && !showPreview && (
          <motion.div
            className="applied-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <IoCheckmark />
            AI filled: <strong>{appliedFields.map(f => FIELD_LABELS[f] || f).join(', ')}</strong>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            className="voice-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <IoAlertCircle /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {!isListening && !transcript && (
        <motion.div className="voice-tips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <p>💡 Try saying: <em>"I lost my black Samsung phone near the library on Monday"</em></p>
        </motion.div>
      )}

    </div>
  );
};

export default VoiceInput;
```

---

## 12. src/pages/HeroLanding/HeroLanding.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../../components/AuthModal/AuthModal.jsx';
import './HeroLanding.css';

const HeroLanding = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="hero-landing">
      <div className="hero-background"></div>

      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="hero-text" variants={itemVariants}>
          <motion.h1 className="hero-title">
            Campus Reconnect
          </motion.h1>
          <motion.p className="hero-subtitle">
            Never lose track of what matters. Connect, report, and reunite with your lost items through our smart campus community.
          </motion.p>
        </motion.div>

        <div className="story-animation">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
          <div className="ground"></div>
          <div className="path"></div>
          <div className="girl">
            <div className="girl-hair"></div>
            <div className="girl-head"></div>
            <div className="girl-body"></div>
            <div className="girl-arm-left"></div>
            <div className="girl-arm-right"></div>
          </div>
          <div className="book"></div>
          <div className="boy">
            <div className="boy-hair"></div>
            <div className="boy-head"></div>
            <div className="boy-body"></div>
            <div className="boy-arm-left"></div>
            <div className="boy-arm-right"></div>
          </div>
          <div className="thought-bubble thought-girl"></div>
          <div className="thought-bubble thought-boy"></div>
          <div className="heart"></div>
          <div className="story-text">Girl walking with her book...</div>
        </div>

        <motion.div className="hero-login" variants={itemVariants}>
          <p>Already have an account?
            <button
              className="login-link"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Sign In
            </button>
          </p>
        </motion.div>
      </motion.div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default HeroLanding;
```

---

## 13. src/pages/Dashboard/Dashboard.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoAdd, IoSearch } from 'react-icons/io5';
import axios from 'axios';
import ItemCard from '../../components/ItemCard/ItemCard.jsx';
import './Dashboard.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const Dashboard = () => {
  const [userName] = useState('User');
  const [userItems, setUserItems] = useState([]);
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [stats, setStats] = useState({
    reported: 0,
    reunited: 0,
    active: 0
  });

  const navigate = useNavigate();

  const fetchItems = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API_BASE}/api/items/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserItems(response.data);
        calculateStats(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${API_BASE}/api/items/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const calculateStats = (items) => {
    const reported = items.length;
    const reunited = 0;
    const active = items.length;
    setStats({ reported, reunited, active });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const welcomeText = `Welcome back, ${userName}!`;
  
  useEffect(() => {
    if (textIndex < welcomeText.length) {
      setTimeout(() => {
        setDisplayText(welcomeText.slice(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, 100);
    }
  }, [textIndex, welcomeText]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="dashboard">

      <motion.div 
        className="dashboard-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="welcome-section" variants={itemVariants}>
          <h1 className="welcome-text">{displayText}<span className="cursor">|</span></h1>
          <p className="welcome-subtitle">Track your items and help others find theirs</p>
        </motion.div>

        <motion.div className="quick-actions" variants={itemVariants}>
          <motion.button 
            className="btn btn-primary quick-action-btn animate-pulse"
            onClick={() => navigate('/report')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <IoAdd />
            New Report
          </motion.button>
          <motion.button 
            className="btn btn-accent quick-action-btn"
            onClick={() => navigate('/feed')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <IoSearch />
            Community Feed
          </motion.button>
        </motion.div>

        <motion.div className="dashboard-stats" variants={itemVariants}>
          <div className="stat-card">
            <div className="stat-number">{stats.reported}</div>
            <div className="stat-label">Items Reported</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.reunited}</div>
            <div className="stat-label">Items Reunited</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Active Cases</div>
          </div>
        </motion.div>

        <motion.div className="user-items-section" variants={itemVariants}>
          <h2>Your Recent Reports</h2>
          {userItems.length > 0 ? (
            <div className="items-grid">
              {userItems.map((item) => (
                <ItemCard key={item.id} item={item} onDelete={handleDeleteItem} isOwnItem={true} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No reports yet</h3>
              <p>Start by reporting a lost or found item</p>
              <motion.button
                className="btn btn-primary"
                onClick={() => navigate('/report')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create First Report
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
```

---

## 14. src/pages/ItemGallery/ItemGallery.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoSearch, IoFilter, IoArrowBack } from 'react-icons/io5';
import ItemCard from '../../components/ItemCard/ItemCard.jsx';
import './ItemGallery.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const ItemGallery = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  const categories = ['all', 'Electronics', 'Clothing', 'Bags & Accessories', 'Books & Stationery', 'Sports Equipment', 'Personal Items', 'Documents', 'Keys', 'Other'];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/items`);
        const data = await response.json();
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
        setItems([]);
        setFilteredItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory, selectedStatus]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="item-gallery">
      <div className="gallery-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <IoArrowBack />
          Back
        </button>
        <h1>Browse Items</h1>
      </div>

      <div className="gallery-container">
        <div className="search-filters">
          <div className="search-bar">
            <IoSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search items, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
          </div>
        </div>

        <div className="gallery-stats">
          <p>{filteredItems.length} items found</p>
        </div>

        {isLoading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="item-skeleton shimmer"></div>
            ))}
          </div>
        ) : (
          <motion.div
            className="items-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <ItemCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No items found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemGallery;
```

---

## 15. src/pages/ItemDetail/ItemDetail.jsx

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoLocation, IoTime, IoChatbubble, IoClose, IoSend } from 'react-icons/io5';
import axios from 'axios';
import './ItemDetail.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [itemOwner, setItemOwner] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload.sub || payload.email);
      } catch (e) {
        fetchProfile(token);
      }
    }
  }, []);

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data.email);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/items/${id}`);
        const itemData = response.data;
        
        const ownerEmail = itemData.user?.email;
        
        const mappedItem = {
          id: itemData.id,
          title: itemData.title,
          description: itemData.description,
          location: itemData.location,
          date: new Date(itemData.date).toLocaleDateString(),
          category: itemData.category,
          status: itemData.status.toLowerCase(),
          images: itemData.imageUrl ? [`${API_BASE}${itemData.imageUrl}`] : [],
          reportedBy: itemData.user ? itemData.user.name : 'Unknown',
          ownerId: itemData.user ? itemData.user.id : null,
          ownerEmail: ownerEmail
        };
        setItem(mappedItem);
        setItemOwner(ownerEmail);
      } catch (error) {
        console.error('Error fetching item:', error);
        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (isChatOpen && item && currentUser && item.ownerId) {
      loadConversation();
    }
  }, [isChatOpen, item, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadConversation = async () => {
    const token = localStorage.getItem('token');
    try {
      const profileResponse = await axios.get(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentUserId = profileResponse.data.id;

      const response = await axios.get(
        `${API_BASE}/api/messages/conversation?otherUserId=${item.ownerId}&itemId=${item.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.length > 0) {
        const formattedMessages = response.data.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender.id === currentUserId ? 'user' : 'other',
          timestamp: new Date(msg.createdAt).toLocaleTimeString(),
          senderName: msg.sender.name
        }));
        setChatMessages(formattedMessages);
      } else {
        setChatMessages([]);
      }
    } catch (error) {
      console.log('No previous conversation found, starting fresh');
      setChatMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const token = localStorage.getItem('token');
    
    const newMessage = {
      id: Date.now(),
      text: messageInput,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setMessageInput('');

    try {
      await axios.post(
        `${API_BASE}/api/messages`,
        {
          receiverId: item.ownerId,
          itemId: item.id,
          content: messageInput
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsTyping(false);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setChatMessages(prev => prev.filter(m => m.id !== newMessage.id));
    }
  };

  const isOwnItem = currentUser && itemOwner && currentUser === itemOwner;

  if (isLoading || !item) {
    return (
      <div className="item-detail loading">
        {isLoading ? (
          <div className="detail-skeleton">
            <div className="skeleton-image shimmer"></div>
            <div className="skeleton-content">
              <div className="skeleton-title shimmer"></div>
              <div className="skeleton-text shimmer"></div>
              <div className="skeleton-text shimmer"></div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">❓</div>
            <h3>Item not found</h3>
            <p>This item may have been removed or doesn't exist</p>
            <button className="btn btn-primary" onClick={() => navigate('/feed')}>
              Back to Feed
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="item-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <IoArrowBack />
          Back
        </button>
      </div>

      <div className="detail-container">
        <motion.div 
          className="detail-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="item-images">
            <div className="main-image">
              <img src={item.images[0]} alt={item.title} />
            </div>
            {item.images.length > 1 && (
              <div className="thumbnail-images">
                {item.images.slice(1).map((image, index) => (
                  <img key={index} src={image} alt={`${item.title} ${index + 2}`} />
                ))}
              </div>
            )}
          </div>

          <div className="item-info">
            <div className="item-header">
              <h1 className="item-title">{item.title}</h1>
              <motion.span 
                className={`status-badge ${item.status} animate-pulse`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {item.status}
              </motion.span>
            </div>

            <div className="item-meta">
              <div className="meta-item">
                <IoLocation />
                <span>{item.location}</span>
              </div>
              <div className="meta-item">
                <IoTime />
                <span>{item.date}</span>
              </div>
            </div>

            <div className="item-description">
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>

            <div className="item-category">
              <h3>Category</h3>
              <span className="category-tag">{item.category}</span>
            </div>

            <div className="item-reporter">
              <h3>Reported by</h3>
              <p>{item.reportedBy}</p>
            </div>

            <div className="item-actions">
              <motion.button
                className="btn btn-primary action-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.status === 'lost' ? 'I Found This!' : 'This Is Mine!'}
              </motion.button>
              
              {!isOwnItem && (
                <motion.button
                  className="btn btn-accent action-btn"
                  onClick={() => setIsChatOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoChatbubble />
                  Message Owner
                </motion.button>
              )}
              
              {isOwnItem && (
                <div className="your-item-badge">Your {item.status} item</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <div className="chat-overlay">
            <motion.div
              className="chat-modal"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="chat-header">
                <h3>Chat with {item.reportedBy}</h3>
                <button className="close-chat" onClick={() => setIsChatOpen(false)}>
                  <IoClose />
                </button>
              </div>

              <div className="chat-messages">
                {chatMessages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`message ${message.sender}`}
                      initial={{ x: message.sender === 'user' ? 50 : -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="message-content">
                        {message.sender === 'other' && (
                          <span className="sender-name">{message.senderName}</span>
                        )}
                        <p>{message.text}</p>
                        <span className="message-time">{message.timestamp}</span>
                      </div>
                    </motion.div>
                  ))
                )}

                {isTyping && (
                  <motion.div
                    className="message other typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="message-content">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <motion.button
                  className="send-btn"
                  onClick={handleSendMessage}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IoSend />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemDetail;
```

---

## 16. src/pages/ItemReporting/ItemReporting.jsx

```jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoArrowForward, IoCheckmark, IoSparkles } from 'react-icons/io5';
import axios from 'axios';
import MultiImageUpload from '../../components/MultiImageUpload/MultiImageUpload';
import QuickTemplates, { TEMPLATES } from '../../components/QuickTemplates/QuickTemplates';
import './ItemReporting.css';
import VoiceInput from '../../components/VoiceInput/VoiceInput';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://backend:8080';

const ItemReporting = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    contactInfo: ''
  });
  const [images, setImages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const handleAIFill = (aiData) => {
    setFormData(prev => ({
      ...prev,
      title: aiData.title || prev.title,
      description: aiData.description || prev.description,
      location: aiData.location || prev.location,
      category: aiData.category || prev.category
    }));
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const steps = [
    { number: 1, title: 'Report Item' },
    { number: 2, title: 'Review' }
  ];

  const categories = [
    'Electronics', 'Clothing', 'Bags & Accessories', 'Books & Stationery',
    'Sports Equipment', 'Personal Items', 'Documents', 'Keys', 'Other'
  ];

  const handleAIAnalysis = useCallback((analysisResult) => {
    setAiAnalysis(analysisResult);
    
    if (analysisResult.category && !formData.category) {
      setFormData(prev => ({
        ...prev,
        category: analysisResult.category
      }));
    }
  }, [formData.category]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    setFormData(prev => ({
      ...prev,
      category: template.category,
      description: template.description
    }));
  };

  const handleDetailClick = (type, value) => {
    if (type === 'color') {
      const newDesc = formData.description 
        ? `${formData.description}, ${value} color` 
        : `${value} color`;
      setFormData(prev => ({ ...prev, description: newDesc }));
      showToast(`Added color: ${value}`);
    } else if (type === 'brand') {
      const newDesc = formData.description 
        ? `${formData.description}, ${value} brand` 
        : `${value} brand`;
      setFormData(prev => ({ ...prev, description: newDesc }));
      showToast(`Added brand: ${value}`);
    } else if (type === 'location') {
      setFormData(prev => ({ ...prev, location: value }));
      showToast(`Location set: ${value}`);
    } else if (type === 'title') {
      setFormData(prev => ({ ...prev, title: value }));
      showToast(`Title set: ${value}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You are not logged in. Please login first.');
        setIsSubmitting(false);
        navigate('/');
        return;
      }
      
      console.log('Submitting with token:', token.substring(0, 20) + '...');
      
      if (!formData.date) {
        alert('Please select a date and time.');
        setIsSubmitting(false);
        return;
      }

      const dateWithSeconds = formData.date.includes(':') && formData.date.split(':').length === 2 
        ? `${formData.date}:00` 
        : formData.date;

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', formData.type.toUpperCase());
      formDataToSend.append('location', formData.location);
      formDataToSend.append('date', new Date(dateWithSeconds).toISOString());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('contactInfo', formData.contactInfo);

      images.forEach((image, index) => {
        if (image.file) {
          formDataToSend.append('images', image.file);
        }
      });

      await axios.post(`${API_BASE}/api/items`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Report submitted successfully');
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit report. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="item-reporting">
      <div className="reporting-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <IoArrowBack />
          Back
        </button>
        <h1>Report an Item</h1>
      </div>

      <div className="reporting-container">
        {showSuccess && (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="success-icon">✅</div>
            <h3>Item Reported Successfully!</h3>
            <p>Your {formData.type} item has been reported and stored in our database. Redirecting to dashboard...</p>
          </motion.div>
        )}
        
        {toast && (
          <motion.div 
            className="toast toast-success"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {toast}
          </motion.div>
        )}
        
        <div className="progress-bar">
          {steps.map((step) => (
            <div 
              key={step.number}
              className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
            >
              <div className="step-circle">
                {currentStep > step.number ? <IoCheckmark /> : step.number}
              </div>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>

        <div className="form-container">
          <AnimatePresence mode="wait" custom={currentStep}>
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="form-step"
            >
              {currentStep === 1 && (
                <div className="step-content">
                  <h2>Report an Item</h2>
                  
                  <div className="type-selection">
                    <motion.label 
                      className={`type-option ${formData.type === 'lost' ? 'selected' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name="type"
                        value="lost"
                        checked={formData.type === 'lost'}
                        onChange={handleInputChange}
                      />
                      <div className="type-content">
                        <div className="type-icon lost">📱</div>
                        <h3>I Lost Something</h3>
                        <p>Report an item you've lost</p>
                      </div>
                    </motion.label>
                    
                    <motion.label 
                      className={`type-option ${formData.type === 'found' ? 'selected' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name="type"
                        value="found"
                        checked={formData.type === 'found'}
                        onChange={handleInputChange}
                      />
                      <div className="type-content">
                        <div className="type-icon found">🔍</div>
                        <h3>I Found Something</h3>
                        <p>Report an item you've found</p>
                      </div>
                    </motion.label>
                  </div>

                  <div className="templates-section">
                    <QuickTemplates 
                      onSelectTemplate={handleTemplateSelect}
                      selectedTemplate={selectedTemplate}
                      onSelectDetail={handleDetailClick}
                    />
                  </div>

                  <div className="form-group">
                    <label>Item Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Black iPhone 13"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide details about the item..."
                      className="form-input"
                      rows="4"
                      required
                    />
                  </div>

                  <VoiceInput
                    onTranscript={(text) =>
                      setFormData(prev => ({ ...prev, description: text }))
                    }
                    onAIFill={handleAIFill}
                    existingText={formData.description}
                    placeholder="Describe the item..."
                  />

                  {selectedTemplate && (
                    <div className="template-category-display">
                      <span className="category-label">Category:</span>
                      <span className="category-value">{selectedTemplate.category}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Library, 2nd Floor"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{formData.type === 'lost' ? 'When did you lose it?' : 'When did you find it?'}</label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="upload-images-section">
                    <h3>Upload Images (up to 5)</h3>
                    <MultiImageUpload
                      images={images}
                      setImages={setImages}
                      onAIAnalysis={handleAIAnalysis}
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Information</label>
                    <input
                      type="email"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleInputChange}
                      placeholder="your.email@university.edu"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="privacy-notice">
                    <p>Your contact information will only be shared with users who have a potential match for your item.</p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="step-content">
                  <h2>Review Your Report</h2>
                  
                  <div className="form-summary">
                    <h4>Report Summary</h4>
                    <div className="summary-item">
                      <span>Type:</span>
                      <strong>{formData.type === 'lost' ? 'Lost' : 'Found'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Title:</span>
                      <strong>{formData.title || 'Not specified'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Category:</span>
                      <strong>{selectedTemplate?.category || formData.category || 'Not specified'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Description:</span>
                      <strong>{formData.description || 'Not specified'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Location:</span>
                      <strong>{formData.location || 'Not specified'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Date:</span>
                      <strong>{formData.date ? new Date(formData.date).toLocaleString() : 'Not specified'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Images:</span>
                      <strong>{images.length} image(s)</strong>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="form-navigation">
            {currentStep > 1 && (
              <motion.button
                className="btn btn-secondary"
                onClick={handlePrev}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IoArrowBack />
                Previous
              </motion.button>
            )}

            <div className="nav-spacer"></div>

            {currentStep < steps.length ? (
              <motion.button
                className="btn btn-primary"
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next
                <IoArrowForward />
              </motion.button>
            ) : (
              <motion.button
                className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  <div className="loading-spinner" />
                ) : (
                  'Submit Report'
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemReporting;
```

---

## 17. src/pages/Messages/Messages.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoChatbubble, IoSend, IoArrowBack, IoEllipsisVertical } from 'react-icons/io5';
import axios from 'axios';
import './Messages.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      try {
        const response = await axios.get(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUserId(response.data.id);
        fetchConversations(token, response.data.id);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const fetchConversations = async (token, userId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/messages/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.length > 0) {
        const convMap = new Map();

        response.data.forEach(msg => {
          if (!msg.sender || !msg.receiver) return;

          const otherUserId = msg.sender.id === userId ? msg.receiver.id : msg.sender.id;
          const otherUser = msg.sender.id === userId ? msg.receiver : msg.sender;

          if (!otherUser) return;

          if (!convMap.has(otherUserId)) {
            convMap.set(otherUserId, {
              partnerId: otherUserId,
              partnerName: otherUser.name || otherUser.email || 'Unknown',
              partnerEmail: otherUser.email || '',
              lastMessage: msg.content || '',
              lastMessageTime: msg.createdAt,
              unreadCount: (!msg.read && msg.receiver && msg.receiver.id === userId) ? 1 : 0,
              itemId: msg.item?.id || null,
              itemTitle: msg.item?.title || null
            });
          } else {
            const conv = convMap.get(otherUserId);
            if (!msg.read && msg.receiver && msg.receiver.id === userId) {
              conv.unreadCount++;
            }
            if (new Date(msg.createdAt) > new Date(conv.lastMessageTime)) {
              conv.lastMessage = msg.content || '';
              conv.lastMessageTime = msg.createdAt;
            }
          }
        });

        const convArray = Array.from(convMap.values()).sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );
        setConversations(convArray);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    setMessages([]);
    const token = localStorage.getItem('token');

    try {
      const itemIdParam = conv.itemId ? conv.itemId : 0;

      const response = await axios.get(
        `${API_BASE}/api/messages/conversation?otherUserId=${conv.partnerId}&itemId=${itemIdParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && Array.isArray(response.data)) {
        const formattedMessages = response.data.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender.id === currentUserId ? 'user' : 'other',
          timestamp: new Date(msg.createdAt).toLocaleTimeString(),
          senderName: msg.sender.name
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const token = localStorage.getItem('token');
    
    const tempMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      await axios.post(
        `${API_BASE}/api/messages`,
        {
          receiverId: selectedConversation.partnerId,
          itemId: selectedConversation.itemId || 1,
          content: newMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewMessage('');
      
      const updatedConversations = conversations.map(conv => {
        if (conv.partnerId === selectedConversation.partnerId) {
          return {
            ...conv,
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString()
          };
        }
        return conv;
      });
      setConversations(updatedConversations.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      ));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <motion.div 
          className={`conversations-list ${selectedConversation ? 'hidden-mobile' : ''}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="conversations-header">
            <h2>Messages</h2>
          </div>
          
          {isLoading ? (
            <div className="loading-conversations">
              {[1, 2, 3].map(i => (
                <div key={i} className="conversation-skeleton shimmer"></div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="no-conversations">
              <IoChatbubble className="empty-icon" />
              <p>No messages yet</p>
              <span>Start a conversation from the feed!</span>
            </div>
          ) : (
            <div className="conversations">
              {conversations.map((conv) => (
                <motion.div
                  key={conv.partnerId}
                  className={`conversation-item ${selectedConversation?.partnerId === conv.partnerId ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="conv-avatar">
                    {conv.partnerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="conv-info">
                    <div className="conv-header">
                      <h4>{conv.partnerName}</h4>
                      <span className="conv-time">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    {conv.itemTitle && (
                      <span className="conv-item">Re: {conv.itemTitle}</span>
                    )}
                    <p className="conv-preview">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="unread-count">{conv.unreadCount}</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div 
          className={`chat-area ${!selectedConversation ? 'hidden-mobile' : ''}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <button className="back-btn" onClick={() => setSelectedConversation(null)}>
                  <IoArrowBack />
                </button>
                <div className="chat-user-info">
                  <div className="conv-avatar small">
                    {selectedConversation.partnerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{selectedConversation.partnerName}</h3>
                    {selectedConversation.itemTitle && (
                      <span>Re: {selectedConversation.itemTitle}</span>
                    )}
                  </div>
                </div>
                <button className="more-btn">
                  <IoEllipsisVertical />
                </button>
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet. Say hi!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`message ${msg.sender}`}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      <div className="message-content">
                        {msg.sender === 'other' && (
                          <span className="sender-name">{msg.senderName}</span>
                        )}
                        <p>{msg.text}</p>
                        <span className="message-time">{msg.timestamp}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="message-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <motion.button
                  className="send-btn"
                  onClick={handleSendMessage}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!newMessage.trim()}
                >
                  <IoSend />
                </motion.button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <IoChatbubble className="large-icon" />
              <h3>Your Messages</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Messages;
```

---

## 18. src/pages/Profile/Profile.jsx

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  IoCamera, IoPersonCircle, IoMail, IoCall, IoSchool, IoCard,
  IoBookmark, IoSave, IoClose, IoLockClosed, IoTrash, IoCheckmarkCircle
} from 'react-icons/io5';
import './Profile.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phoneNumber: '', yearOfStudy: '', universityId: '', department: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate', 'PhD'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || '', email: data.email || '', phoneNumber: data.phoneNumber || '',
          yearOfStudy: data.yearOfStudy || '', universityId: data.universityId || '', department: data.department || ''
        });
      } else {
        setError('Failed to load profile');
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (formData.phoneNumber && formData.phoneNumber.replace(/[^0-9]/g, '').length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setFormData({
          name: updated.name || '', email: updated.email || '', phoneNumber: updated.phoneNumber || '',
          yearOfStudy: updated.yearOfStudy || '', universityId: updated.universityId || '', department: updated.department || ''
        });
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '', email: profile.email || '', phoneNumber: profile.phoneNumber || '',
      yearOfStudy: profile.yearOfStudy || '', universityId: profile.universityId || '', department: profile.department || ''
    });
    setIsEditing(false);
    setError('');
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    const formDataImg = new FormData();
    formDataImg.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile/upload-picture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formDataImg,
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setSuccess('Profile picture updated!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to upload image');
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!confirm('Are you sure you want to delete your profile picture?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile/delete-picture`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setSuccess('Profile picture deleted');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete profile picture');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>My Profile</h1>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div className="alert alert-success" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <IoCheckmarkCircle /> {success}
            </motion.div>
          )}
          {error && (
            <motion.div className="alert alert-error" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="profile-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="profile-picture-section">
            <div className="profile-avatar-container">
              {uploadingImage && (
                <div className="upload-overlay">
                  <div className="loading-spinner"></div>
                </div>
              )}
              {profile?.profilePictureUrl ? (
                <img src={`${API_BASE}${profile.profilePictureUrl}`} alt="Profile" className="profile-avatar-large" />
              ) : (
                <div className="profile-avatar-placeholder"><IoPersonCircle /></div>
              )}
              <button className="change-photo-btn" onClick={handleImageClick} disabled={uploadingImage}>
                <IoCamera /> Change Photo
              </button>
              {profile?.profilePictureUrl && (
                <button className="delete-photo-btn" onClick={handleDeleteProfilePicture} disabled={uploadingImage}>
                  <IoTrash /> Remove
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>
            <div className="profile-header-info">
              <h2>{profile?.name}</h2>
              <p className="profile-role">{profile?.role}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <div className="detail-icon"><IoPersonCircle /></div>
              <div className="detail-content">
                <label>Full Name</label>
                {isEditing ? (
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="Enter your full name" required />
                ) : (
                  <p>{profile?.name || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><IoMail /></div>
              <div className="detail-content">
                <label>Email Address</label>
                <p className="text-muted">{profile?.email}</p>
                {isEditing && <small className="help-text">Email cannot be changed for security reasons</small>}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><IoCall /></div>
              <div className="detail-content">
                <label>Phone Number</label>
                {isEditing ? (
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="form-input" placeholder="Enter 10-digit phone number" maxLength="10" pattern="[0-9]{10}" />
                ) : (
                  <p>{profile?.phoneNumber || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><IoSchool /></div>
              <div className="detail-content">
                <label>Year of Study</label>
                {isEditing ? (
                  <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleInputChange} className="form-select">
                    <option value="">Select year</option>
                    {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                ) : (
                  <p>{profile?.yearOfStudy || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><IoCard /></div>
              <div className="detail-content">
                <label>University ID</label>
                {isEditing ? (
                  <input type="text" name="universityId" value={formData.universityId} onChange={handleInputChange} className="form-input" placeholder="Enter your university ID" />
                ) : (
                  <p>{profile?.universityId || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><IoBookmark /></div>
              <div className="detail-content">
                <label>Department</label>
                {isEditing ? (
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="form-input" placeholder="e.g., Computer Science" />
                ) : (
                  <p>{profile?.department || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <motion.button className="btn btn-primary" onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <IoSave /> Save Changes
                </motion.button>
                <motion.button className="btn btn-secondary" onClick={handleCancel} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <IoClose /> Cancel
                </motion.button>
              </>
            ) : (
              <>
                <motion.button className="btn btn-primary" onClick={() => setIsEditing(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Edit Profile
                </motion.button>
                <motion.button className="btn btn-accent" onClick={() => setShowPasswordModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <IoLockClosed /> Change Password
                </motion.button>
                <motion.button className="btn btn-danger" onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Logout
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {showPasswordModal && (
            <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
              <motion.div className="password-modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <div className="modal-header">
                  <h3>Change Password</h3>
                  <button className="close-modal-btn" onClick={() => setShowPasswordModal(false)}><IoClose /></button>
                </div>
                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="form-input" required minLength="6" />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="form-input" required minLength="6" />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">Change Password</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
```

---

## 19. src/pages/SocialFeed/SocialFeed.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  IoLocation,
  IoTime,
  IoChatbubble,
  IoCall,
  IoAdd,
  IoEye,
  IoHeart
} from 'react-icons/io5';
import axios from 'axios';
import './SocialFeed.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserEmail(payload.sub || payload.email);
      } catch (e) {
        fetchUserProfile(token);
      }
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUserEmail(response.data.email);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/items`);
        const mappedPosts = response.data.map(item => ({
          id: item.id,
          type: item.status.toLowerCase(),
          title: item.title,
          description: item.description,
          location: item.location,
          date: new Date(item.date).toLocaleDateString(),
          category: item.category,
          userInitials: item.user ? item.user.name.charAt(0).toUpperCase() : 'U',
          username: item.user ? item.user.name : 'Unknown',
          userEmail: item.user ? item.user.email : '',
          ownerId: item.user ? item.user.id : null,
          image: item.imageUrl ? `${API_BASE}${item.imageUrl}` : '/default-image.png'
        }));
        setPosts(mappedPosts);
        setFilteredPosts(mappedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
        setFilteredPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);