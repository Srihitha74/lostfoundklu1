import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoLocation, IoTime, IoChatbubble, IoClose, IoSend } from 'react-icons/io5';
import axios from 'axios';
import './ItemDetail.css';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:8085/api/items/${id}`);
        const itemData = response.data;
        const mappedItem = {
          id: itemData.id,
          title: itemData.title,
          description: itemData.description,
          location: itemData.location,
          date: new Date(itemData.date).toLocaleDateString(),
          category: itemData.category,
          status: itemData.status.toLowerCase(),
          images: itemData.imageUrl ? [`http://localhost:8085${itemData.imageUrl}`] : [],
          reportedBy: itemData.user ? itemData.user.name : 'Unknown'
        };
        setItem(mappedItem);
      } catch (error) {
        console.error('Error fetching item:', error);
        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: messageInput,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setIsTyping(true);

    // Simulate typing and response
    setTimeout(() => {
      setIsTyping(false);
      const response = {
        id: Date.now() + 1,
        text: 'Thanks for reaching out! I\'ll get back to you soon.',
        sender: 'other',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, response]);
    }, 2000);
  };

  if (isLoading || !item) {
    return (
      <div className="item-detail loading">
        {isLoading ? (
          <div className="detail-skeleton">
            <div className="skeleton-image shimmer"></div>
            <div className="skeleton-content">
              <div className="skeleton-title shimmer"></div>
              <div className="skeleton-text shimmer"></div>
              <div className="skeleton-text shimmer"></div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">❓</div>
            <h3>Item not found</h3>
            <p>This item may have been removed or doesn't exist</p>
            <button className="btn btn-primary" onClick={() => navigate('/feed')}>
              Back to Feed
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="item-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <IoArrowBack />
          Back
        </button>
      </div>

      <div className="detail-container">
        <motion.div 
          className="detail-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="item-images">
            <div className="main-image">
              <img src={item.images[0]} alt={item.title} />
            </div>
            {item.images.length > 1 && (
              <div className="thumbnail-images">
                {item.images.slice(1).map((image, index) => (
                  <img key={index} src={image} alt={`${item.title} ${index + 2}`} />
                ))}
              </div>
            )}
          </div>

          <div className="item-info">
            <div className="item-header">
              <h1 className="item-title">{item.title}</h1>
              <motion.span 
                className={`status-badge ${item.status} animate-pulse`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {item.status}
              </motion.span>
            </div>

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

            <div className="item-description">
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>

            <div className="item-category">
              <h3>Category</h3>
              <span className="category-tag">{item.category}</span>
            </div>

            <div className="item-reporter">
              <h3>Reported by</h3>
              <p>{item.reportedBy}</p>
            </div>

            <div className="item-actions">
              <motion.button
                className="btn btn-primary action-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.status === 'lost' ? 'I Found This!' : 'This Is Mine!'}
              </motion.button>
              
              <motion.button
                className="btn btn-accent action-btn"
                onClick={() => setIsChatOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IoChatbubble />
                Message Owner
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="chat-overlay">
            <motion.div
              className="chat-modal"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="chat-header">
                <h3>Chat with {item.reportedBy}</h3>
                <button className="close-chat" onClick={() => setIsChatOpen(false)}>
                  <IoClose />
                </button>
              </div>

              <div className="chat-messages">
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`message ${message.sender}`}
                    initial={{ x: message.sender === 'user' ? 50 : -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    className="message other typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="message-content">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <motion.button
                  className="send-btn"
                  onClick={handleSendMessage}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IoSend />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemDetail;
