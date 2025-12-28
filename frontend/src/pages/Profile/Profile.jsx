import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({name: '', email: ''});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch('http://localhost:8085/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setFormData({name: data.name, email: data.email});
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:8085/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setFormData(updated);
        setIsEditing(false);
        setError('');
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleCancel = () => {
    setFormData({name: profile.name, email: profile.email});
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="profile">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile">
      <nav className="profile-nav">
        <div className="nav-brand">
          <h3>Campus Reconnect</h3>
        </div>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <motion.div
        className="profile-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="profile-header">
          <div className="profile-avatar">
            <img src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg" alt="Profile" />
          </div>
          <h1>{profile.name}</h1>
          <p>{profile.role}</p>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <label>Name:</label>
            {isEditing ? (
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            ) : (
              <span>{profile.name}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Email:</label>
            {isEditing ? (
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            ) : (
              <span>{profile.email}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Role:</label>
            <span>{profile.role}</span>
          </div>
        </div>
        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
              <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
          )}
        </div>
        {error && <div className="error">{error}</div>}
      </motion.div>
    </div>
  );
};

export default Profile;