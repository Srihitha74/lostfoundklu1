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

  const buttonVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        type: "spring",
        stiffness: 100
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

        <motion.div className="hero-buttons" variants={itemVariants}>
          <motion.button 
            className="btn btn-secondary hero-btn"
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/report')}
          >
            Report Lost Item
          </motion.button>
          
          <motion.button 
            className="btn btn-primary hero-btn"
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/report')}
          >
            Report Found Item
          </motion.button>
          
          <motion.button 
            className="btn btn-accent hero-btn"
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/feed')}
          >
            Community Feed
          </motion.button>
        </motion.div>

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
