import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../../components/AuthModal/AuthModal.jsx';
import './HeroLanding.css';

const HeroLanding = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');
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
          <div className="story-text"></div>
        </div>

        <motion.div className="hero-login" variants={itemVariants}>
          <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap',marginTop:'8px'}}>
            <motion.button
              className="login-link"
              style={{background:'linear-gradient(135deg,#ffb38b,#e5989b)',color:'white',padding:'14px 36px',borderRadius:'60px',fontWeight:'600',fontSize:'1.1rem',border:'none',cursor:'pointer',boxShadow:'0 8px 20px rgba(229,152,155,0.3)'}}
              onClick={() => { setAuthInitialTab('register'); setIsAuthModalOpen(true); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started
            </motion.button>
            <motion.button
              className="login-link"
              style={{background:'rgba(255,255,255,0.6)',color:'#2d3e4f',padding:'14px 36px',borderRadius:'60px',fontWeight:'600',fontSize:'1.1rem',border:'2px solid rgba(255,179,139,0.5)',cursor:'pointer',backdropFilter:'blur(8px)'}}
              onClick={() => { setAuthInitialTab('login'); setIsAuthModalOpen(true); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Sign In
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authInitialTab}
      />
    </div>
  );
};

export default HeroLanding;