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

  // ── Email verification states ──────────────────────────────────────────
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

  // ── Resend cooldown timer ──────────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Resend verification email ──────────────────────────────────────────
  const handleResendVerification = async () => {
    if (!firebaseUserForVerification || resendCooldown > 0) return;
    try {
      await sendEmailVerification(firebaseUserForVerification);
      startResendCooldown();
    } catch (err) {
      setErrors({ general: 'Failed to resend. Please try again.' });
    }
  };

  // ── Poll Firebase to check if email is verified ────────────────────────
  const handleCheckVerification = async () => {
    setVerificationChecking(true);
    setErrors({});

    try {
      // Re-sign in to get a fresh user object with latest emailVerified status
      let freshUser = firebaseUserForVerification;

      try {
        if (freshUser) {
          await reload(freshUser);
        } else {
          // If user object is lost, re-sign in with credentials
          const userCredential = await signInWithEmailAndPassword(
            auth, formData.email, formData.password
          );
          freshUser = userCredential.user;
        }
      } catch {
        // Try re-signing in as fallback
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
        // Email is verified — now call backend firebase-login to get JWT
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

          // Try to get FCM token
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
          } catch { /* FCM is optional */ }

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

  // ── Main submit handler ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        // ── LOGIN FLOW ──────────────────────────────────────────────────
        // Try Firebase first, fall back to JWT for old MySQL-only users
        let firebaseSuccess = false;

        try {
          const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
          const firebaseUser = userCredential.user;
          firebaseSuccess = true;

          // Check if email is verified in Firebase
          if (!firebaseUser.emailVerified) {
            setFirebaseUserForVerification(firebaseUser);
            setShowVerificationScreen(true);
            await sendEmailVerification(firebaseUser);
            startResendCooldown();
            setIsLoading(false);
            return;
          }

          // Firebase verified — get JWT from backend
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
          // Firebase login failed — user might be MySQL-only (old user)
          // Fall through to JWT login below
          if (firebaseErr.code !== 'auth/user-not-found' &&
              firebaseErr.code !== 'auth/wrong-password' &&
              firebaseErr.code !== 'auth/invalid-credential' &&
              firebaseErr.code !== 'auth/invalid-email') {
            // Unexpected Firebase error
            firebaseSuccess = false;
          }
        }

        // ── FALLBACK: JWT login for old MySQL-only users ────────────────
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
        // ── REGISTER FLOW ───────────────────────────────────────────────
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

        // Step 1: Create user in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const firebaseUser = userCredential.user;

        // Step 2: Also register in your MySQL backend
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
        } catch { /* backend register failure is non-fatal */ }

        // Step 3: Send verification email via Firebase
        await sendEmailVerification(firebaseUser);
        startResendCooldown();

        // Step 4: Show verification screen
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

  // ── Verification Screen ────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────
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