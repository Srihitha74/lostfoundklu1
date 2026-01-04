import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoClose, IoEye, IoEyeOff } from 'react-icons/io5';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getToken } from 'firebase/messaging';
import { getMessaging } from 'firebase/messaging';
import { auth, messaging } from '../../firebase'; // Google Technology: Firebase Authentication and Cloud Messaging
import './AuthModal.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://backend:8080';

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
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const formVariants = {
    hidden: { x: isLogin ? -20 : 20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      x: isLogin ? 20 : -20, 
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Firebase is now configured with actual values
    const isFirebaseConfigured = true;

    if (!isFirebaseConfigured) {
      // Fallback to original JWT authentication
      try {
        if (isLogin) {
          // Login
          const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            setIsLoading(false);
            onClose();
            navigate('/dashboard');
          } else {
            const errorData = await response.json();
            setErrors({ general: errorData.message || 'Login failed' });
            setIsLoading(false);
          }
        } else {
          // Register
          if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match' });
            setIsLoading(false);
            return;
          }

          const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              password: formData.password,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setSuccessMessage('Registration completed successfully! Now please login.');
            setIsLoading(false);
            // Do not set token, close, or navigate
          } else {
            const errorData = await response.json();
            setErrors({ general: errorData.message || 'Registration failed' });
            setIsLoading(false);
          }
        }
      } catch (error) {
        setErrors({ general: 'Network error. Please try again.' });
        setIsLoading(false);
      }
      return;
    }

    // Firebase authentication (when configured)
    try {
      let firebaseUser;
      if (isLogin) {
        // Google Technology: Firebase Authentication - Login
        firebaseUser = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setErrors({ confirmPassword: 'Passwords do not match' });
          setIsLoading(false);
          return;
        }

        // Google Technology: Firebase Authentication - Register
        firebaseUser = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      }

      // After successful Firebase auth, send user data to backend
      const response = await fetch(`${API_BASE}/api/auth/firebase-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: firebaseUser.user.email,
          uid: firebaseUser.user.uid,
          name: formData.name || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage('Registration completed successfully! Now please login.');
        setIsLoading(false);
        // Do not set token, close, or navigate
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Authentication failed' });
        setIsLoading(false);
      }
    } catch (error) {
      let errorMessage = 'Authentication failed';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      setErrors({ general: errorMessage });
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

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
              <div className="auth-tabs">
                <button
                  className={`tab ${isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
                <button
                  className={`tab ${!isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
                <motion.div 
                  className="tab-indicator"
                  animate={{ x: isLogin ? 0 : '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
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
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="Enter your full name"
                      required
                    />
                    {errors.name && <span className="error-text animate-shake">{errors.name}</span>}
                  </div>
                )}

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && <span className="error-text animate-shake">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <IoEyeOff /> : <IoEye />}
                    </button>
                  </div>
                  {errors.password && <span className="error-text animate-shake">{errors.password}</span>}
                </div>

                {!isLogin && (
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm your password"
                      required
                    />
                    {errors.confirmPassword && <span className="error-text animate-shake">{errors.confirmPassword}</span>}
                  </div>
                )}

                {errors.general && <div className="error-text general-error">{errors.general}</div>}

                {successMessage && !isLogin && <div className="success-text">{successMessage}</div>}

                <motion.button
                  type="submit"
                  className={`btn btn-primary auth-submit ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </motion.button>
              </motion.form>
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
