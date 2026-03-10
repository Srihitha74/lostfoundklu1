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

  // Fetch unread message count
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
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
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
              <button className="nav-link" onClick={() => handleNavigation('/profile')}>
                {user?.profilePictureUrl
                  ? <img src={`${API_BASE}${user.profilePictureUrl}`} alt="profile" style={{width:'24px',height:'24px',borderRadius:'50%',objectFit:'cover'}}/>
                  : null}
                Profile
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