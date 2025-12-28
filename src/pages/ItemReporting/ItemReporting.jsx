import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoArrowForward, IoCloudUpload, IoCheckmark } from 'react-icons/io5';
import axios from 'axios';
import './ItemReporting.css';

const ItemReporting = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    contactInfo: '',
    image: null
  });
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const navigate = useNavigate();

  const steps = [
    { number: 1, title: 'Item Details' },
    { number: 2, title: 'Location & Date' },
    { number: 3, title: 'Upload Image' },
    { number: 4, title: 'Contact Info' }
  ];

  const categories = [
    'Electronics', 'Clothing', 'Bags & Accessories', 'Books & Stationery',
    'Sports Equipment', 'Personal Items', 'Documents', 'Keys', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'category' && value === '' && suggestedCategory) {
      finalValue = suggestedCategory;
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleImageUpload = async (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        setFormData(prev => ({ ...prev, image: e.target.result }));

        // Google AI Tool: Get category suggestion from uploaded image
        setIsAnalyzing(true);
        try {
          const token = localStorage.getItem('token');
          const formDataToSend = new FormData();
          formDataToSend.append('image', file);

          const response = await axios.post('http://backend:8080/api/items/suggest-category', formDataToSend, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });

          setSuggestedCategory(response.data);
        } catch (error) {
          console.error('Error getting category suggestion:', error);
          setSuggestedCategory(''); // Fallback
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
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
      // Ensure date has seconds for proper ISO string
      const dateWithSeconds = formData.date.includes(':') && formData.date.split(':').length === 2 ? `${formData.date}:00` : formData.date;

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', formData.type.toUpperCase()); // Map 'lost'/'found' to 'LOST'/'FOUND'
      formDataToSend.append('location', formData.location);
      formDataToSend.append('date', new Date(dateWithSeconds).toISOString());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('contactInfo', formData.contactInfo);

      // Handle image
      if (formData.image && formData.image.startsWith('data:image/')) {
        // Convert base64 to blob
        const response = await fetch(formData.image);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        formDataToSend.append('image', file);
      }

      await axios.post('http://backend:8080/api/items', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Success
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // Navigate after 2 seconds
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
                  <h2>What type of report is this?</h2>
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
                    <label>Category {suggestedCategory && <span className="ai-suggestion">(AI Suggested: {suggestedCategory})</span>}</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="">{suggestedCategory ? `Use AI Suggestion: ${suggestedCategory}` : 'Select a category'}</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {isAnalyzing && <div className="analyzing">🤖 Analyzing image for category suggestion...</div>}
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
                </div>
              )}

              {currentStep === 2 && (
                <div className="step-content">
                  <h2>Where and when?</h2>
                  
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
                </div>
              )}

              {currentStep === 3 && (
                <div className="step-content">
                  <h2>Upload an image (optional)</h2>
                  
                  <div 
                    className={`image-upload-zone ${dragOver ? 'drag-over' : ''} ${formData.image ? 'has-image' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('imageInput').click()}
                  >
                    {formData.image ? (
                      <motion.div 
                        className="image-preview"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img src={formData.image} alt="Preview" />
                        <button 
                          className="remove-image"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                        >
                          ×
                        </button>
                      </motion.div>
                    ) : (
                      <div className="upload-content">
                        <motion.div 
                          className="upload-icon"
                          animate={dragOver ? { scale: 1.2, rotate: 5 } : {}}
                        >
                          <IoCloudUpload />
                        </motion.div>
                        <h3>Drop your image here</h3>
                        <p>or click to browse</p>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="step-content">
                  <h2>How can we contact you?</h2>
                  
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
                  <div className="loading-spinner"></div>
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
