import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoChatbubble, IoSend, IoArrowBack, IoEllipsisVertical } from 'react-icons/io5';
import axios from 'axios';
import './Messages.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
const POLL_MS  = 3000;

const Messages = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // ── State ─────────────────────────────────────────────────────────────────
  const [me,              setMe]              = useState(null);   // { id, name, email }
  const [conversations,   setConversations]   = useState([]);
  const [activeConv,      setActiveConv]      = useState(null);
  const [messages,        setMessages]        = useState([]);
  const [draft,           setDraft]           = useState('');
  const [isLoading,       setIsLoading]       = useState(true);
  const [isSending,       setIsSending]       = useState(false);

  // ── Refs (never stale inside callbacks) ──────────────────────────────────
  const meRef          = useRef(null);
  const activeConvRef  = useRef(null);
  const pollRef        = useRef(null);
  const bottomRef      = useRef(null);

  // keep refs in sync
  const syncMe   = (v) => { meRef.current = v;         setMe(v); };
  const syncConv = (v) => { activeConvRef.current = v;  setActiveConv(v); };

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const tok    = () => localStorage.getItem('token');
  const avatar = (n) => (n || '?').trim().charAt(0).toUpperCase();

  const formatTime = (ds) => {
    if (!ds) return '';
    const d   = new Date(ds);
    if (isNaN(d)) return '';
    const now  = new Date();
    const diff = now - d;
    if (diff < 60000)    return 'Just now';
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
    const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDay = new Date(d.getFullYear(),   d.getMonth(),   d.getDate());
    const days   = Math.round((today - msgDay) / 86400000);
    if (days === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7)   return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  // ── Convert raw message → display object ─────────────────────────────────
  // CRITICAL: myId passed explicitly — never read from state/ref here
  const toDisplay = (msg, myId) => ({
    id:         msg.id,
    text:       msg.content || '',
    // Number() prevents "3" === 3 type mismatch
    sender:     Number(msg.sender.id) === Number(myId) ? 'user' : 'other',
    time:       new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    senderName: msg.sender?.name || msg.sender?.email || 'Unknown',
  });

  // ── Load ALL messages between me and partner ──────────────────────────────
  const loadMessages = useCallback(async (conv, myId) => {
    if (!conv || !myId) return;
    try {
      const res = await axios.get(
        `${API_BASE}/api/messages/conversation?otherUserId=${conv.partnerId}&itemId=0`,
        { headers: { Authorization: `Bearer ${tok()}` } }
      );
      if (!Array.isArray(res.data)) return;
      const mapped = res.data
        .filter(m => m?.sender?.id && m?.receiver?.id)
        .map(m => toDisplay(m, myId));
      setMessages(mapped);
    } catch (e) {
      console.error('loadMessages:', e);
    }
  }, []);

  // ── Load sidebar conversations ────────────────────────────────────────────
  const loadConversations = useCallback(async (myId) => {
    const uid = myId ?? meRef.current?.id;
    if (!uid) return;
    try {
      const res = await axios.get(`${API_BASE}/api/messages/all`, {
        headers: { Authorization: `Bearer ${tok()}` }
      });
      if (!Array.isArray(res.data)) return;

      const map = new Map();
      res.data.forEach(msg => {
        if (!msg?.sender?.id || !msg?.receiver?.id) return;
        const isMe    = Number(msg.sender.id) === Number(uid);
        const other   = isMe ? msg.receiver : msg.sender;
        const oid     = other.id;
        const name    = other?.name || other?.email || 'Unknown';

        if (!map.has(oid)) {
          map.set(oid, {
            partnerId:   oid,
            partnerName: name,
            lastMessage: msg.content || '',
            lastTime:    msg.createdAt,
            unread:      (!msg.read && Number(msg.receiver?.id) === Number(uid)) ? 1 : 0,
            itemId:      msg.item?.id    || null,
            itemTitle:   msg.item?.title || null,
          });
        } else {
          const c = map.get(oid);
          if (!msg.read && Number(msg.receiver?.id) === Number(uid)) c.unread++;
          if (new Date(msg.createdAt) > new Date(c.lastTime)) {
            c.lastMessage = msg.content || '';
            c.lastTime    = msg.createdAt;
            if (!c.itemId && msg.item?.id) { c.itemId = msg.item.id; c.itemTitle = msg.item.title; }
          }
        }
      });

      const convs = [...map.values()].sort((a,b) => new Date(b.lastTime) - new Date(a.lastTime));
      setConversations(convs);
      return convs;
    } catch (e) {
      console.error('loadConversations:', e);
      return [];
    }
  }, []);

  // ── Polling ───────────────────────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      const conv = activeConvRef.current;
      const myId = meRef.current?.id;
      if (conv && myId) {
        loadMessages(conv, myId);
        loadConversations(myId);
      }
    }, POLL_MS);
  }, [loadMessages, loadConversations]);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const boot = async () => {
      const t = tok();
      if (!t) { navigate('/'); return; }
      try {
        // 1. Get my profile — store as object so we always have id+name together
        const pRes = await axios.get(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        const myId = pRes.data.id;
        const user = { id: myId, name: pRes.data.name, email: pRes.data.email };
        syncMe(user);  // sets both meRef.current AND state

        // 2. Load conversations
        const convs = await loadConversations(myId);

        // 3. If arrived from ItemDetail, open that conversation immediately
        const state = location.state;
        if (state?.partnerId) {
          const pid   = Number(state.partnerId);
          const match = (convs || []).find(c => Number(c.partnerId) === pid);
          const conv  = match ?? {
            partnerId:   pid,
            partnerName: state.partnerName  || 'User',
            lastMessage: '',
            lastTime:    new Date().toISOString(),
            unread:      0,
            itemId:      state.itemId   || null,
            itemTitle:   state.itemTitle || null,
          };
          syncConv(conv);
          await loadMessages(conv, myId);
          startPolling();
        }
      } catch (e) {
        console.error('boot:', e);
      } finally {
        setIsLoading(false);
      }
    };
    boot();
    return () => stopPolling();
  }, []); // eslint-disable-line

  // ── Select conversation ───────────────────────────────────────────────────
  const selectConv = async (conv) => {
    stopPolling();
    syncConv(conv);
    setMessages([]);
    await loadMessages(conv, meRef.current?.id);
    startPolling();
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !activeConvRef.current || isSending) return;
    const myId   = meRef.current?.id;
    const conv   = activeConvRef.current;
    const tempId = `t${Date.now()}`;

    // Optimistic bubble — always 'user' side, always visible immediately
    setMessages(prev => [...prev, {
      id:         tempId,
      text,
      sender:     'user',
      time:       new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: meRef.current?.name || 'You',
    }]);
    setDraft('');
    setIsSending(true);

    try {
      await axios.post(
        `${API_BASE}/api/messages`,
        { receiverId: conv.partnerId, itemId: conv.itemId || null, content: text },
        { headers: { Authorization: `Bearer ${tok()}` } }
      );
      // Refresh from server — replaces optimistic with real DB record
      await loadMessages(conv, myId);
      // Update sidebar last message
      setConversations(prev =>
        prev.map(c => Number(c.partnerId) === Number(conv.partnerId)
          ? { ...c, lastMessage: text, lastTime: new Date().toISOString() }
          : c
        ).sort((a,b) => new Date(b.lastTime) - new Date(a.lastTime))
      );
    } catch (e) {
      console.error('send:', e);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setDraft(text);
    } finally {
      setIsSending(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="messages-page">
      <div className="messages-container">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <div className={`conversations-list ${activeConv ? 'hidden-mobile' : ''}`}>
          <div className="conversations-header"><h2>Messages</h2></div>

          {isLoading ? (
            <div className="loading-conversations">
              {[1,2,3].map(i => <div key={i} className="conversation-skeleton shimmer" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="no-conversations">
              <IoChatbubble className="empty-icon" />
              <p>No messages yet</p>
              <span>Start a conversation from an item!</span>
            </div>
          ) : (
            <div className="conversations">
              {conversations.map(conv => (
                <motion.div
                  key={conv.partnerId}
                  className={`conversation-item ${Number(activeConv?.partnerId) === Number(conv.partnerId) ? 'active' : ''}`}
                  onClick={() => selectConv(conv)}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                >
                  <div className="conv-avatar">{avatar(conv.partnerName)}</div>
                  <div className="conv-info">
                    <div className="conv-header">
                      <h4>{conv.partnerName}</h4>
                      <span className="conv-time">{formatTime(conv.lastTime)}</span>
                    </div>
                    {conv.itemTitle && <span className="conv-item">Re: {conv.itemTitle}</span>}
                    <p className="conv-preview">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && <span className="unread-count">{conv.unread}</span>}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── Chat area ────────────────────────────────────────────────── */}
        <div className={`chat-area ${!activeConv ? 'hidden-mobile' : ''}`}>
          {activeConv ? (
            <>
              {/* Header */}
              <div className="chat-header">
                <button className="back-btn" onClick={() => { syncConv(null); stopPolling(); }}>
                  <IoArrowBack />
                </button>
                <div className="chat-user-info">
                  <div className="conv-avatar small">{avatar(activeConv.partnerName)}</div>
                  <div>
                    <h3>{activeConv.partnerName}</h3>
                    {activeConv.itemTitle && <span>Re: {activeConv.itemTitle}</span>}
                  </div>
                </div>
                <button className="more-btn"><IoEllipsisVertical /></button>
              </div>

              {/* Messages */}
              <div className="messages-list">
                {messages.length === 0
                  ? <div className="no-messages"><p>No messages yet. Say hi! 👋</p></div>
                  : messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      className={`message ${msg.sender}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="message-content">
                        {msg.sender === 'other' && (
                          <span className="sender-name">{msg.senderName}</span>
                        )}
                        <p>{msg.text}</p>
                        <span className="message-time">{msg.time}</span>
                      </div>
                    </motion.div>
                  ))
                }
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="message-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendMessage()}
                  disabled={isSending}
                />
                <motion.button
                  className="send-btn"
                  onClick={sendMessage}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  disabled={!draft.trim() || isSending}
                >
                  <IoSend />
                </motion.button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <IoChatbubble className="large-icon" />
              <h3>Your Messages</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Messages;