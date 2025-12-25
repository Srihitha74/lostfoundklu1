import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoLocation, IoTime, IoChatbubble, IoClose } from 'react-icons/io5';
import './ItemCard.css';

const ItemCard = ({ item, onDelete }) => {
  const navigate = useNavigate();
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedItem, setMatchedItem] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  const fetchMatchedItem = async () => {
    if (!item.matchedItemId) return;

    setLoadingMatch(true);
    try {
      const response = await fetch(`http://localhost:8085/api/items/${item.matchedItemId}`);
      if (response.ok) {
        const data = await response.json();
        setMatchedItem(data);
        setShowMatchModal(true);
      }
    } catch (error) {
      console.error('Error fetching matched item:', error);
    } finally {
      setLoadingMatch(false);
    }
  };

  return (
    <motion.div 
      className="item-card"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/item/${item.id}`)}
    >
      <div className="item-image">
        <img src={item.imageUrl ? `http://localhost:8085${item.imageUrl}` : '/placeholder-image.jpg'} alt={item.title} />
        <div className="item-overlay">
          <motion.button 
            className="view-details-btn"
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            View Details
          </motion.button>
        </div>
      </div>
      
      <div className="item-content">
        <div className="item-header">
          <h3 className="item-title">{item.title}</h3>
          <div className="item-badges">
            <span className={`status-badge ${item.status}`}>
              {item.status}
            </span>
            {item.aiMatched && (
              <div className="ai-match-indicator">
                <span
                  className="ai-match-badge clickable"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchMatchedItem();
                  }}
                >
                  🤖 AI Match Found
                </span>
                <small className="ai-match-text">Google AI detected a similar item</small>
              </div>
            )}
          </div>
        </div>
        
        <p className="item-category">{item.category}</p>
        
        <div className="item-meta">
          <div className="meta-item">
            <IoLocation />
            <span>{item.location}</span>
          </div>
          <div className="meta-item">
            <IoTime />
            <span>{item.date}</span>
          </div>
        </div>
        
        <div className="item-actions">
          <motion.button
            className="btn btn-sm btn-accent"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle chat
            }}
          >
            <IoChatbubble />
            Message
          </motion.button>
          {onDelete && (
            <motion.button
              className="btn btn-sm btn-danger"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              🗑️ Delete
            </motion.button>
          )}
        </div>
      </div>

      {/* AI Match Modal */}
      <AnimatePresence>
        {showMatchModal && matchedItem && (
          <motion.div
            className="ai-match-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMatchModal(false)}
          >
            <motion.div
              className="ai-match-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>🤖 AI Match Found!</h3>
                <button
                  className="close-modal-btn"
                  onClick={() => setShowMatchModal(false)}
                >
                  <IoClose />
                </button>
              </div>

              <div className="modal-content">
                <div className="match-header">
                  <div className="ai-icon">🤖</div>
                  <div className="match-title">
                    <h2>AI Match Found!</h2>
                    <p>Google AI detected a potential match for your {item.status.toLowerCase()} item</p>
                  </div>
                </div>

                <div className="match-comparison">
                  <div className="item-comparison">
                    <div className="comparison-item your-item">
                      <h3>Your Item</h3>
                      <div className="item-card-preview">
                        <span className={`status-badge ${item.status}`}>{item.status}</span>
                        <h4>{item.title}</h4>
                        <p className="item-category">{item.category}</p>
                        <p className="item-location">📍 {item.location}</p>
                        <p className="item-date">🕒 {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="match-connector">
                      <div className="ai-brain">🧠</div>
                      <p>AI Matched</p>
                      <div className="match-line"></div>
                    </div>

                    <div className="comparison-item matched-item">
                      <h3>Potential Match</h3>
                      <div className="item-card-preview">
                        <span className={`status-badge ${matchedItem.status}`}>{matchedItem.status}</span>
                        <h4>{matchedItem.title}</h4>
                        <p className="item-category">{matchedItem.category}</p>
                        <p className="item-location">📍 {matchedItem.location}</p>
                        <p className="item-date">🕒 {new Date(matchedItem.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="match-analysis">
                  <h4>🤖 AI Analysis Results</h4>
                  <div className="analysis-details">
                    <div className="analysis-item">
                      <span className="check-icon">✅</span>
                      <span>Both items have AI-analyzed images with visual features</span>
                    </div>
                    <div className="analysis-item">
                      <span className="check-icon">✅</span>
                      <span>Items are complementary types ({item.status} ↔ {matchedItem.status})</span>
                    </div>
                    <div className="analysis-item">
                      <span className="ai-icon-small">🤖</span>
                      <span>Google Cloud Vision API detected similar object characteristics</span>
                    </div>
                  </div>
                </div>

                <div className="contact-section">
                  <h4>📞 Contact Information</h4>
                  <div className="contact-details">
                    <p><strong>Person who {matchedItem.status.toLowerCase()} this item:</strong></p>
                    <div className="contact-info">
                      <p>📧 <strong>Email:</strong> {matchedItem.contactInfo}</p>
                      <p>📝 <strong>Description:</strong> {matchedItem.description}</p>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-primary action-btn"
                    onClick={() => {
                      setShowMatchModal(false);
                      navigate(`/item/${matchedItem.id}`);
                    }}
                  >
                    📋 View Full Details & Contact
                  </button>
                  <button
                    className="btn btn-accent action-btn"
                    onClick={() => {
                      window.location.href = `mailto:${matchedItem.contactInfo}?subject=Regarding your ${matchedItem.status.toLowerCase()} ${matchedItem.title}&body=Hi, I found a potential match for your ${matchedItem.status.toLowerCase()} ${matchedItem.title}. My ${item.status.toLowerCase()} item details: ${item.title} - ${item.description}`;
                      setShowMatchModal(false);
                    }}
                  >
                    ✉️ Email Now
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowMatchModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ItemCard;
