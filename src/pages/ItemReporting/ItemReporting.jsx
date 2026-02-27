import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoArrowForward, IoCheckmark, IoSparkles } from 'react-icons/io5';
import axios from 'axios';
import MultiImageUpload from '../../components/MultiImageUpload/MultiImageUpload';
import QuickTemplates, { TEMPLATES } from '../../components/QuickTemplates/QuickTemplates';
import './ItemReporting.css';
import VoiceInput from '../../components/VoiceInput/VoiceInput';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://backend:8080';

const ItemReporting = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    contactInfo: ''
  });
  const [images, setImages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();


  // Handle AI auto-fill from voice
const handleAIFill = (aiData) => {
  setFormData(prev => ({
    ...prev,
    title: aiData.title || prev.title,
    description: aiData.description || prev.description,
    location: aiData.location || prev.location,
    category: aiData.category || prev.category
  }));
};

  // Show toast notification
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const steps = [
    { number: 1, title: 'Report Item' },
    { number: 2, title: 'Review' }
  ];

  const categories = [
    'Electronics', 'Clothing', 'Bags & Accessories', 'Books & Stationery',
    'Sports Equipment', 'Personal Items', 'Documents', 'Keys', 'Other'
  ];

  // Handle AI analysis results from image upload
  const handleAIAnalysis = useCallback((analysisResult) => {
    setAiAnalysis(analysisResult);
    
    // Auto-fill category if not already set
    if (analysisResult.category && !formData.category) {
      setFormData(prev => ({
        ...prev,
        category: analysisResult.category
      }));
    }
  }, [formData.category]);

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    
    // Auto-fill form with template data
    setFormData(prev => ({
      ...prev,
      category: template.category,
      description: template.description
    }));
  };

  // Handle template detail click (color/brand/location/title)
  const handleDetailClick = (type, value) => {
    if (type === 'color') {
      const newDesc = formData.description 
        ? `${formData.description}, ${value} color` 
        : `${value} color`;
      setFormData(prev => ({ ...prev, description: newDesc }));
      showToast(`Added color: ${value}`);
    } else if (type === 'brand') {
      const newDesc = formData.description 
        ? `${formData.description}, ${value} brand` 
        : `${value} brand`;
      setFormData(prev => ({ ...prev, description: newDesc }));
      showToast(`Added brand: ${value}`);
    } else if (type === 'location') {
      setFormData(prev => ({ ...prev, location: value }));
      showToast(`Location set: ${value}`);
    } else if (type === 'title') {
      setFormData(prev => ({ ...prev, title: value }));
      showToast(`Title set: ${value}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!formData.date) {
        alert('Please select a date and time.');
        setIsSubmitting(false);
        return;
      }

      const dateWithSeconds = formData.date.includes(':') && formData.date.split(':').length === 2 
        ? `${formData.date}:00` 
        : formData.date;

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', formData.type.toUpperCase());
      formDataToSend.append('location', formData.location);
      formDataToSend.append('date', new Date(dateWithSeconds).toISOString());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('contactInfo', formData.contactInfo);

      // Append all images
      images.forEach((image, index) => {
        if (image.file) {
          formDataToSend.append('images', image.file);
        }
      });

      await axios.post(`${API_BASE}/api/items`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit report. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="item-reporting">
      <div className="reporting-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <IoArrowBack />
          Back
        </button>
        <h1>Report an Item</h1>
      </div>

      <div className="reporting-container">
        {showSuccess && (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="success-icon">✅</div>
            <h3>Item Reported Successfully!</h3>
            <p>Your {formData.type} item has been reported and stored in our database. Redirecting to dashboard...</p>
          </motion.div>
        )}
        
        {/* Toast Notification */}
        {toast && (
          <motion.div 
            className="toast toast-success"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {toast}
          </motion.div>
        )}
        
        <div className="progress-bar">
          {steps.map((step) => (
            <div 
              key={step.number}
              className={`progress-step ${currentStep >= step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
            >
              <div className="step-circle">
                {currentStep > step.number ? <IoCheckmark /> : step.number}
              </div>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>

        <div className="form-container">
          <AnimatePresence mode="wait" custom={currentStep}>
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="form-step"
            >
              {currentStep === 1 && (
                <div className="step-content">
                  <h2>Report an Item</h2>
                  
                  {/* Type Selection */}
                  <div className="type-selection">
                    <motion.label 
                      className={`type-option ${formData.type === 'lost' ? 'selected' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name="type"
                        value="lost"
                        checked={formData.type === 'lost'}
                        onChange={handleInputChange}
                      />
                      <div className="type-content">
                        <div className="type-icon lost">📱</div>
                        <h3>I Lost Something</h3>
                        <p>Report an item you've lost</p>
                      </div>
                    </motion.label>
                    
                    <motion.label 
                      className={`type-option ${formData.type === 'found' ? 'selected' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name="type"
                        value="found"
                        checked={formData.type === 'found'}
                        onChange={handleInputChange}
                      />
                      <div className="type-content">
                        <div className="type-icon found">🔍</div>
                        <h3>I Found Something</h3>
                        <p>Report an item you've found</p>
                      </div>
                    </motion.label>
                  </div>

                  {/* Quick Templates Section */}
                  <div className="templates-section">
                    <QuickTemplates 
                      onSelectTemplate={handleTemplateSelect}
                      selectedTemplate={selectedTemplate}
                      onSelectDetail={handleDetailClick}
                    />
                  </div>

                  <div className="form-group">
                    <label>Item Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Black iPhone 13"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide details about the item..."
                      className="form-input"
                      rows="4"
                      required
                    />
                  </div>

                  <VoiceInput
  onTranscript={(text) =>
    setFormData(prev => ({ ...prev, description: text }))
  }
  onAIFill={handleAIFill}
  existingText={formData.description}
  placeholder="Describe the item..."
/>

                  {/* Template Category Display */}
                  {selectedTemplate && (
                    <div className="template-category-display">
                      <span className="category-label">Category:</span>
                      <span className="category-value">{selectedTemplate.category}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Library, 2nd Floor"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{formData.type === 'lost' ? 'When did you lose it?' : 'When did you find it?'}</label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Upload Images - On same page */}
                  <div className="upload-images-section">
                    <h3>Upload Images (up to 5)</h3>
                    <MultiImageUpload
                      images={images}
                      setImages={setImages}
                      onAIAnalysis={handleAIAnalysis}
                    />
                  </div>

                  {/* Contact Information - On same page */}
                  <div className="form-group">
                    <label>Contact Information</label>
                    <input
                      type="email"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleInputChange}
                      placeholder="your.email@university.edu"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="privacy-notice">
                    <p>Your contact information will only be shared with users who have a potential match for your item.</p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="step-content">
                  <h2>Review Your Report</h2>
                  
                  {/* Summary */}
                  <div className="form-summary">
                    <h4>Report Summary</h4>
                    <div className="summary-item">
                      <span>Type:</span>
                      <strong>{formData.type === 'lost' ? 'Lost' : 'Found'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Title:</span>
                      <strong>{formData.title || 'Not specified'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Category:</span>
                      <strong>{selectedTemplate?.category || formData.category || 'Not specified'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Description:</span>
                      <strong>{formData.description || 'Not specified'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Location:</span>
                      <strong>{formData.location || 'Not specified'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Date:</span>
                      <strong>{formData.date ? new Date(formData.date).toLocaleString() : 'Not specified'}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Images:</span>
                      <strong>{images.length} image(s)</strong>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="form-navigation">
            {currentStep > 1 && (
              <motion.button
                className="btn btn-secondary"
                onClick={handlePrev}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IoArrowBack />
                Previous
              </motion.button>
            )}

            <div className="nav-spacer"></div>

            {currentStep < steps.length ? (
              <motion.button
                className="btn btn-primary"
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next
                <IoArrowForward />
              </motion.button>
            ) : (
              <motion.button
                className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  <div className="loading-spinner" />
                ) : (
                  'Submit Report'
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemReporting;
