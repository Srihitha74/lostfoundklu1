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

        {/* Story Animation in the middle */}
        <div className="story-animation">
          {/* Clouds */}
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>

          {/* Ground and path */}
          <div className="ground"></div>
          <div className="path"></div>

          {/* Girl character */}
          <div className="girl">
            <div className="girl-hair"></div>
            <div className="girl-head"></div>
            <div className="girl-body"></div>
            <div className="girl-arm-left"></div>
            <div className="girl-arm-right"></div>
          </div>

          {/* Book item */}
          <div className="book"></div>

          {/* Boy character */}
          <div className="boy">
            <div className="boy-hair"></div>
            <div className="boy-head"></div>
            <div className="boy-body"></div>
            <div className="boy-arm-left"></div>
            <div className="boy-arm-right"></div>
          </div>

          {/* Thought bubbles */}
          <div className="thought-bubble thought-girl"></div>
          <div className="thought-bubble thought-boy"></div>

          {/* Heart when found */}
          <div className="heart"></div>

          {/* Story text */}
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