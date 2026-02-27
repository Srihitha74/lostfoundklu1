import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { IoMenu, IoClose } from 'react-icons/io5';
import './Navbar.css';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            </>
          )}
          {user ? (
            <>
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

      {/* Mobile Menu */}
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