import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloudUpload, IoClose, IoCheckmark, IoImage, IoSparkles } from 'react-icons/io5';
import axios from 'axios';
import './MultiImageUpload.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://backend:8080';
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const MultiImageUpload = ({ 
  images, 
  setImages, 
  onAIAnalysis,
  disabled = false 
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const processFile = async (file, index) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return false;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const previewUrl = e.target.result;
        
        setImages(prev => {
          const newImages = [...prev];
          newImages[index] = {
            file,
            preview: previewUrl,
            isPrimary: prev.length === 0,
            id: Date.now() + index
          };
          return newImages;
        });

        setUploadProgress(prev => ({ ...prev, [index]: true }));

        // AI Analysis on first image only
        if (index === 0) {
          await analyzeImage(file, index);
        }

        setUploadProgress(prev => ({ ...prev, [index]: false }));
        resolve(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const analyzeImage = async (file, index) => {
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);

      const response = await axios.post(
        `${API_BASE}/api/items/analyze-image`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (onAIAnalysis) {
        onAIAnalysis(response.data);
      }

      setImages(prev => {
        const newImages = [...prev];
        if (newImages[index]) {
          newImages[index].aiData = response.data;
        }
        return newImages;
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFiles = useCallback(async (files) => {
    setError(null);
    
    const validFiles = Array.from(files).filter(file => !validateFile(file));
    
    if (images.length + validFiles.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const newIndex = images.length + i;
      await processFile(file, newIndex);
    }
  }, [images.length]);

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
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (index === 0 && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (index) => {
    setImages(prev => {
      return prev.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }));
    });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="multi-image-upload">
      <div className="upload-header">
        <h3>
          <IoImage />
          Upload Images
        </h3>
        <span className="image-count">
          {images.length}/{MAX_IMAGES} images
        </span>
      </div>

      <div 
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${images.length > 0 ? 'has-images' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || images.length >= MAX_IMAGES}
          style={{ display: 'none' }}
        />

        <AnimatePresence mode="wait">
          {images.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="empty-state"
            >
              <motion.div 
                className="upload-icon"
                animate={dragOver ? { scale: 1.2, rotate: 10 } : {}}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <IoCloudUpload />
              </motion.div>
              <h4>Drag & drop images here</h4>
              <p>or click to browse</p>
              <span className="upload-hint">
                Supports JPG, PNG, GIF up to 5MB each
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="upload-more"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="add-more-state"
            >
              <div className="add-more-icon">
                <IoCloudUpload />
              </div>
              <span>Add more images</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            className="ai-analysis-status"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="ai-loading">
              <IoSparkles className="spinning" />
              <span>Analyzing first image with AI...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div 
            className="upload-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {images.length > 0 && (
        <div className="image-previews">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                className={`image-preview ${image.isPrimary ? 'primary' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
              >
                <img src={image.preview} alt={`Preview ${index + 1}`} />
                
                <div className="image-overlay">
                  {image.isPrimary && (
                    <div className="primary-badge">
                      <IoCheckmark />
                      Primary
                    </div>
                  )}
                  
                  <button 
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    disabled={disabled}
                  >
                    <IoClose />
                  </button>
                  
                  {!image.isPrimary && (
                    <button 
                      className="primary-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimaryImage(index);
                      }}
                      disabled={disabled}
                    >
                      Set Primary
                    </button>
                  )}
                </div>

                {uploadProgress[index] && (
                  <div className="upload-progress">
                    <div className="progress-bar" />
                  </div>
                )}

                {image.aiData && (
                  <div className="ai-badge">
                    <IoSparkles />
                    {image.aiData.category}
                    {image.aiData.confidenceScore && (
                      <span className="confidence">
                        {Math.round(image.aiData.confidenceScore)}%
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {images.length > 0 && images[0]?.aiData && (
        <motion.div 
          className="ai-suggestions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h4>
            <IoSparkles />
            AI Detected
          </h4>
          <div className="suggestion-content">
            {images[0].aiData.category && (
              <div className="suggestion-item">
                <strong>Category:</strong> {images[0].aiData.category}
                {images[0].aiData.confidenceScore && (
                  <span className="confidence-badge">
                    {Math.round(images[0].aiData.confidenceScore)}% confidence
                  </span>
                )}
              </div>
            )}
            {images[0].aiData.detectedColors && images[0].aiData.detectedColors !== 'Unknown' && (
              <div className="suggestion-item">
                <strong>Colors:</strong> {images[0].aiData.detectedColors}
              </div>
            )}
            {images[0].aiData.detectedBrands && (
              <div className="suggestion-item">
                <strong>Brands:</strong> {images[0].aiData.detectedBrands}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MultiImageUpload;
