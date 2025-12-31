import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  IoLocation,
  IoTime,
  IoChatbubble,
  IoCall,
  IoAdd,
  IoEye,
  IoHeart
} from 'react-icons/io5';
import axios from 'axios';
import './SocialFeed.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://backend:8080';

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/items`);
        const mappedPosts = response.data.map(item => ({
          id: item.id,
          type: item.status.toLowerCase(),
          title: item.title,
          description: item.description,
          location: item.location,
          date: new Date(item.date).toLocaleDateString(),
          category: item.category,
          userInitials: item.user ? item.user.name.charAt(0).toUpperCase() : 'U',
          username: item.user ? item.user.name : 'Unknown',
          contactInfo: item.user ? item.user.email : '',
          image: item.imageUrl ? `${API_BASE}${item.imageUrl}` : '/default-image.png' // Assuming a default image
        }));
        setPosts(mappedPosts);
        setFilteredPosts(mappedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
        setFilteredPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.type === activeFilter));
    }
  }, [activeFilter, posts]);

  const getTimeAgo = (timeString) => {
    return timeString;
  };

  const handleContactUser = (post) => {
    // In a real app, this would open email client or show contact modal
    window.location.href = `mailto:${post.contactInfo}?subject=Regarding your ${post.type} item: ${post.title}`;
  };

  const handleMessageUser = (post) => {
    // Navigate to item detail page with chat
    navigate(`/item/${post.id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const postVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const lostCount = posts.filter(p => p.type === 'lost').length;
  const foundCount = posts.filter(p => p.type === 'found').length;

  return (
    <div className="social-feed">
      <div className="feed-header">
        <div className="feed-nav">
          <h1 className="feed-title">Community Feed</h1>
          <div className="feed-stats">
            <div className="stat-item">
              <IoEye />
              <span><span className="stat-number">{posts.length}</span> active posts</span>
            </div>
            <div className="stat-item">
              <IoHeart />
              <span><span className="stat-number">{Math.floor(posts.length * 0.7)}</span> items reunited</span>
            </div>
          </div>
        </div>
      </div>

      <div className="feed-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Posts
            <span className="count">{posts.length}</span>
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'lost' ? 'active' : ''}`}
            onClick={() => setActiveFilter('lost')}
          >
            Lost Items
            <span className="count">{lostCount}</span>
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'found' ? 'active' : ''}`}
            onClick={() => setActiveFilter('found')}
          >
            Found Items
            <span className="count">{foundCount}</span>
          </button>
        </div>
      </div>

      <div className="feed-container">
        {isLoading ? (
          <div className="loading-posts">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="post-skeleton shimmer"></div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <motion.div
            className="feed-posts"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  className="post-card"
                  variants={postVariants}
                  layout
                  onClick={() => navigate(`/item/${post.id}`)}
                >
                  <div className="post-header">
                    <div className="user-avatar">
                      {post.userInitials}
                    </div>
                    <div className="post-user-info">
                      <div className="post-username">{post.username}</div>
                      <div className="post-time">{getTimeAgo(post.date)}</div>
                    </div>
                    <div className={`post-status ${post.type}`}>
                      {post.type}
                    </div>
                  </div>

                  <div className="post-content">
                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-description">{post.description}</p>
                    
                    <div className="post-meta">
                      <div className="meta-item">
                        <IoLocation />
                        <span>{post.location}</span>
                      </div>
                      <div className="post-category">{post.category}</div>
                    </div>
                  </div>

                  <div className="post-actions">
                    <motion.button
                      className="action-btn contact-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactUser(post);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IoCall />
                      Contact
                    </motion.button>
                    <motion.button
                      className="action-btn message-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessageUser(post);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IoChatbubble />
                      Message
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="empty-feed">
            <div className="empty-icon">📱</div>
            <h3>No posts found</h3>
            <p>Be the first to post in the community feed!</p>
            <motion.button
              className="btn btn-primary"
              onClick={() => navigate('/report')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create First Post
            </motion.button>
          </div>
        )}
      </div>

      <motion.button
        className="floating-action"
        onClick={() => navigate('/report')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      >
        <IoAdd />
      </motion.button>
    </div>
  );
};

export default SocialFeed;
