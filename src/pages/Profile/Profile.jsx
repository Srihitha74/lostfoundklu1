import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  IoCamera, IoPersonCircle, IoMail, IoCall, IoSchool, IoCard,
  IoBookmark, IoSave, IoClose, IoLockClosed, IoTrash, IoCheckmarkCircle
} from 'react-icons/io5';
import './Profile.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phoneNumber: '', yearOfStudy: '', universityId: '', department: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate', 'PhD'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || '', email: data.email || '', phoneNumber: data.phoneNumber || '',
          yearOfStudy: data.yearOfStudy || '', universityId: data.universityId || '', department: data.department || ''
        });
      } else {
        setError('Failed to load profile');
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (formData.phoneNumber && formData.phoneNumber.replace(/[^0-9]/g, '').length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
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
        setFormData({
          name: updated.name || '', email: updated.email || '', phoneNumber: updated.phoneNumber || '',
          yearOfStudy: updated.yearOfStudy || '', universityId: updated.universityId || '', department: updated.department || ''
        });
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '', email: profile.email || '', phoneNumber: profile.phoneNumber || '',
      yearOfStudy: profile.yearOfStudy || '', universityId: profile.universityId || '', department: profile.department || ''
    });
    setIsEditing(false);
    setError('');
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    const formDataImg = new FormData();
    formDataImg.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile/upload-picture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formDataImg,
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setSuccess('Profile picture updated!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to upload image');
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!confirm('Are you sure you want to delete your profile picture?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile/delete-picture`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setSuccess('Profile picture deleted');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete profile picture');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          <h1>My Profile</h1>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div className="alert alert-success" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <IoCheckmarkCircle /> {success}
            </motion.div>
          )}
          {error && (
            <motion.div className="alert alert-error" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="profile-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="profile-picture-section">
            <div className="profile-avatar-container">
              {uploadingImage && (
                <div className="upload-overlay">
                  <div className="loading-spinner"></div>
                </div>
              )}
              {profile?.profilePictureUrl ? (
                <img src={`${API_BASE}${profile.profilePictureUrl}`} alt="Profile" className="profile-avatar-large" />
              ) : (
                <div className="profile-avatar-placeholder"><IoPersonCircle /></div>
              )}
              <button className="change-photo-btn" onClick={handleImageClick} disabled={uploadingImage}>
                <IoCamera /> Change Photo
              </button>
              {profile?.profilePictureUrl && (
                <button className="delete-photo-btn" onClick={handleDeleteProfilePicture} disabled={uploadingImage}>
                  <IoTrash /> Remove
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>
            <div className="profile-header-info">
              <h2>{profile?.name}</h2>
              <p className="profile-role">{profile?.role}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <div className="detail-icon"><IoPersonCircle /></div>
              <div className="detail-content">
                <label>Full Name</label>
                {isEditing ? (
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="Enter your full name" required />
                ) : (
                  <p>{profile?.name || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><IoMail /></div>
              <div className="detail-content">
                <label>Email Address</label>
                <p className="text-muted">{profile?.email}</p>
                {isEditing && <small className="help-text">Email cannot be changed for security reasons</small>}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><IoCall /></div>
              <div className="detail-content">
                <label>Phone Number</label>
                {isEditing ? (
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="form-input" placeholder="Enter 10-digit phone number" maxLength="10" pattern="[0-9]{10}" />
                ) : (
                  <p>{profile?.phoneNumber || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><IoSchool /></div>
              <div className="detail-content">
                <label>Year of Study</label>
                {isEditing ? (
                  <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleInputChange} className="form-select">
                    <option value="">Select year</option>
                    {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                ) : (
                  <p>{profile?.yearOfStudy || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><IoCard /></div>
              <div className="detail-content">
                <label>University ID</label>
                {isEditing ? (
                  <input type="text" name="universityId" value={formData.universityId} onChange={handleInputChange} className="form-input" placeholder="Enter your university ID" />
                ) : (
                  <p>{profile?.universityId || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><IoBookmark /></div>
              <div className="detail-content">
                <label>Department</label>
                {isEditing ? (
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="form-input" placeholder="e.g., Computer Science" />
                ) : (
                  <p>{profile?.department || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <motion.button className="btn btn-primary" onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <IoSave /> Save Changes
                </motion.button>
                <motion.button className="btn btn-secondary" onClick={handleCancel} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <IoClose /> Cancel
                </motion.button>
              </>
            ) : (
              <>
                <motion.button className="btn btn-primary" onClick={() => setIsEditing(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Edit Profile
                </motion.button>
                <motion.button className="btn btn-accent" onClick={() => setShowPasswordModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <IoLockClosed /> Change Password
                </motion.button>
                <motion.button className="btn btn-danger" onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Logout
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {showPasswordModal && (
            <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
              <motion.div className="password-modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                <div className="modal-header">
                  <h3>Change Password</h3>
                  <button className="close-modal-btn" onClick={() => setShowPasswordModal(false)}><IoClose /></button>
                </div>
                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="form-input" required minLength="6" />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="form-input" required minLength="6" />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">Change Password</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
