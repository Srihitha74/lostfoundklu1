import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoAdd, IoSearch } from 'react-icons/io5';
import axios from 'axios';
import ItemCard from '../../components/ItemCard/ItemCard.jsx';
import './Dashboard.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://backend:8080';

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
        // Refresh the items list
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const calculateStats = (items) => {
    const reported = items.length;
    // Assuming reunited if status is something else, but for now, all are active
    const reunited = 0; // TODO: add reunited status
    const active = items.length;
    setStats({ reported, reunited, active });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const welcomeText = `Welcome back, ${userName}!`;
  
  // Typewriter effect
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
                <ItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
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
