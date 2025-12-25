import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    checkToken();
    const interval = setInterval(checkToken, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <h3>Campus Reconnect</h3>
      </div>
      <div className="nav-links">
        {isLoggedIn && (
          <>
            <button className="nav-link" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className="nav-link" onClick={() => navigate('/feed')}>
              Feed
            </button>
            <button className="nav-link" onClick={() => navigate('/report')}>
              Report
            </button>
          </>
        )}
        {isLoggedIn ? (
          <>
            <button className="nav-link logout" onClick={handleLogout}>
              Logout
            </button>
            <button className="nav-link" onClick={() => navigate('/profile')}>
              Edit Profile
            </button>
          </>
        ) : (
          <button className="nav-link" onClick={() => navigate('/')}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;