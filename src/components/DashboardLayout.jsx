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
      
      {/* Back to Top Button */}
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