// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useParams, useNavigate } from 'react-router-dom';
// import { IoArrowBack, IoLocation, IoTime, IoChatbubble, IoClose, IoSend } from 'react-icons/io5';
// import axios from 'axios';
// import './ItemDetail.css';

// const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// const ItemDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [item, setItem] = useState(null);
//   const [itemOwner, setItemOwner] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [chatMessages, setChatMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Get current user from token
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       try {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         setCurrentUser(payload.sub || payload.email);
//       } catch (e) {
//         fetchProfile(token);
//       }
//     }
//   }, []);

//   const fetchProfile = async (token) => {
//     try {
//       const response = await axios.get(`${API_BASE}/api/auth/profile`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setCurrentUser(response.data.email);
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//     }
//   };

//   useEffect(() => {
//     const fetchItem = async () => {
//       try {
//         const response = await axios.get(`${API_BASE}/api/items/${id}`);
//         const itemData = response.data;
        
//         // Get owner info
//         const ownerEmail = itemData.user?.email;
        
//         const mappedItem = {
//           id: itemData.id,
//           title: itemData.title,
//           description: itemData.description,
//           location: itemData.location,
//           date: new Date(itemData.date).toLocaleDateString(),
//           category: itemData.category,
//           status: itemData.status.toLowerCase(),
//           images: itemData.imageUrl ? [`${API_BASE}${itemData.imageUrl}`] : [],
//           reportedBy: itemData.user ? itemData.user.name : 'Unknown',
//           ownerId: itemData.user ? itemData.user.id : null,
//           ownerEmail: ownerEmail
//         };
//         setItem(mappedItem);
//         setItemOwner(ownerEmail);
//       } catch (error) {
//         console.error('Error fetching item:', error);
//         setItem(null);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchItem();
//   }, [id]);

//   // Load conversation when chat opens
//   useEffect(() => {
//     if (isChatOpen && item && currentUser && item.ownerId) {
//       loadConversation();
//     }
//   }, [isChatOpen, item, currentUser]);

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [chatMessages]);

//   const loadConversation = async () => {
//     const token = localStorage.getItem('token');
//     try {
//       // Get current user ID
//       const profileResponse = await axios.get(`${API_BASE}/api/auth/profile`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const currentUserId = profileResponse.data.id;

//       const response = await axios.get(
//         `${API_BASE}/api/messages/conversation?otherUserId=${item.ownerId}&itemId=${item.id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data && response.data.length > 0) {
//         const formattedMessages = response.data.map(msg => ({
//           id: msg.id,
//           text: msg.content,
//           sender: msg.sender.id === currentUserId ? 'user' : 'other',
//           timestamp: new Date(msg.createdAt).toLocaleTimeString(),
//           senderName: msg.sender.name
//         }));
//         setChatMessages(formattedMessages);
//       } else {
//         setChatMessages([]);
//       }
//     } catch (error) {
//       console.log('No previous conversation found, starting fresh');
//       setChatMessages([]);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!messageInput.trim()) return;

//     const token = localStorage.getItem('token');
    
//     // Add message to UI immediately
//     const newMessage = {
//       id: Date.now(),
//       text: messageInput,
//       sender: 'user',
//       timestamp: new Date().toLocaleTimeString()
//     };

//     setChatMessages(prev => [...prev, newMessage]);
//     setMessageInput('');

//     try {
//       // Send to backend
//       await axios.post(
//         `${API_BASE}/api/messages`,
//         {
//           receiverId: item.ownerId,
//           itemId: item.id,
//           content: messageInput
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setIsTyping(false);

//     } catch (error) {
//       console.error('Error sending message:', error);
//       setIsTyping(false);
//       // Remove the optimistic message if send failed
//       setChatMessages(prev => prev.filter(m => m.id !== newMessage.id));
//     }
//   };

//   const isOwnItem = currentUser && itemOwner && currentUser === itemOwner;

//   if (isLoading || !item) {
//     return (
//       <div className="item-detail loading">
//         {isLoading ? (
//           <div className="detail-skeleton">
//             <div className="skeleton-image shimmer"></div>
//             <div className="skeleton-content">
//               <div className="skeleton-title shimmer"></div>
//               <div className="skeleton-text shimmer"></div>
//               <div className="skeleton-text shimmer"></div>
//             </div>
//           </div>
//         ) : (
//           <div className="empty-state">
//             <div className="empty-icon">❓</div>
//             <h3>Item not found</h3>
//             <p>This item may have been removed or doesn't exist</p>
//             <button className="btn btn-primary" onClick={() => navigate('/feed')}>
//               Back to Feed
//             </button>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="item-detail">
//       <div className="detail-header">
//         <button className="back-btn" onClick={() => navigate(-1)}>
//           <IoArrowBack />
//           Back
//         </button>
//       </div>

//       <div className="detail-container">
//         <motion.div 
//           className="detail-content"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           <div className="item-images">
//             <div className="main-image">
//               <img src={item.images[0]} alt={item.title} />
//             </div>
//             {item.images.length > 1 && (
//               <div className="thumbnail-images">
//                 {item.images.slice(1).map((image, index) => (
//                   <img key={index} src={image} alt={`${item.title} ${index + 2}`} />
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="item-info">
//             <div className="item-header">
//               <h1 className="item-title">{item.title}</h1>
//               <motion.span 
//                 className={`status-badge ${item.status} animate-pulse`}
//                 animate={{ scale: [1, 1.05, 1] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//               >
//                 {item.status}
//               </motion.span>
//             </div>

//             <div className="item-meta">
//               <div className="meta-item">
//                 <IoLocation />
//                 <span>{item.location}</span>
//               </div>
//               <div className="meta-item">
//                 <IoTime />
//                 <span>{item.date}</span>
//               </div>
//             </div>

//             <div className="item-description">
//               <h3>Description</h3>
//               <p>{item.description}</p>
//             </div>

//             <div className="item-category">
//               <h3>Category</h3>
//               <span className="category-tag">{item.category}</span>
//             </div>

//             <div className="item-reporter">
//               <h3>Reported by</h3>
//               <p>{item.reportedBy}</p>
//             </div>

//             <div className="item-actions">
//               <motion.button
//                 className="btn btn-primary action-btn"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 {item.status === 'lost' ? 'I Found This!' : 'This Is Mine!'}
//               </motion.button>
              
//               {!isOwnItem && (
//                 <motion.button
//                   className="btn btn-accent action-btn"
//                   onClick={() => setIsChatOpen(true)}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <IoChatbubble />
//                   Message Owner
//                 </motion.button>
//               )}
              
//               {isOwnItem && (
//                 <div className="your-item-badge">Your {item.status} item</div>
//               )}
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       {/* Chat Modal */}
//       <AnimatePresence>
//         {isChatOpen && (
//           <div className="chat-overlay">
//             <motion.div
//               className="chat-modal"
//               initial={{ x: '100%', opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               exit={{ x: '100%', opacity: 0 }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             >
//               <div className="chat-header">
//                 <h3>Chat with {item.reportedBy}</h3>
//                 <button className="close-chat" onClick={() => setIsChatOpen(false)}>
//                   <IoClose />
//                 </button>
//               </div>

//               <div className="chat-messages">
//                 {chatMessages.length === 0 ? (
//                   <div className="no-messages">
//                     <p>No messages yet. Start the conversation!</p>
//                   </div>
//                 ) : (
//                   chatMessages.map((message) => (
//                     <motion.div
//                       key={message.id}
//                       className={`message ${message.sender}`}
//                       initial={{ x: message.sender === 'user' ? 50 : -50, opacity: 0 }}
//                       animate={{ x: 0, opacity: 1 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       <div className="message-content">
//                         {message.sender === 'other' && (
//                           <span className="sender-name">{message.senderName}</span>
//                         )}
//                         <p>{message.text}</p>
//                         <span className="message-time">{message.timestamp}</span>
//                       </div>
//                     </motion.div>
//                   ))
//                 )}

//                 {isTyping && (
//                   <motion.div
//                     className="message other typing"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                   >
//                     <div className="message-content">
//                       <div className="typing-indicator">
//                         <div className="typing-dot"></div>
//                         <div className="typing-dot"></div>
//                         <div className="typing-dot"></div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>

//               <div className="chat-input">
//                 <input
//                   type="text"
//                   value={messageInput}
//                   onChange={(e) => setMessageInput(e.target.value)}
//                   placeholder="Type your message..."
//                   onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                 />
//                 <motion.button
//                   className="send-btn"
//                   onClick={handleSendMessage}
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                 >
//                   <IoSend />
//                 </motion.button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default ItemDetail;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoLocation, IoTime, IoChatbubble } from 'react-icons/io5';
import axios from 'axios';
import './ItemDetail.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [itemOwner, setItemOwner] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  // Get current user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload.sub || payload.email);
      } catch (e) {
        fetchProfile(token);
      }
    }
  }, []);

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data.email);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/items/${id}`);
        const itemData = response.data;
        
        // Get owner info
        const ownerEmail = itemData.user?.email;
        
        const mappedItem = {
          id: itemData.id,
          title: itemData.title,
          description: itemData.description,
          location: itemData.location,
          date: new Date(itemData.date).toLocaleDateString(),
          category: itemData.category,
          status: itemData.status.toLowerCase(),
          images: itemData.imageUrl ? [`${API_BASE}${itemData.imageUrl}`] : [],
          reportedBy: itemData.user ? itemData.user.name : 'Unknown',
          ownerId: itemData.user ? itemData.user.id : null,
          ownerEmail: ownerEmail
        };
        setItem(mappedItem);
        setItemOwner(ownerEmail);
      } catch (error) {
        console.error('Error fetching item:', error);
        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id]);







  const isOwnItem = currentUser && itemOwner && currentUser === itemOwner;

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
              
              {!isOwnItem && item.ownerId && (
                <motion.button
                  className="btn btn-accent action-btn"
                  onClick={() => navigate('/messages', {
                    state: {
                      partnerId:    item.ownerId,
                      partnerName:  item.reportedBy,
                      itemId:       item.id,
                      itemTitle:    item.title,
                    }
                  })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoChatbubble />
                  Message Owner
                </motion.button>
              )}
              
              {isOwnItem && (
                <div className="your-item-badge">Your {item.status} item</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};
export default ItemDetail;