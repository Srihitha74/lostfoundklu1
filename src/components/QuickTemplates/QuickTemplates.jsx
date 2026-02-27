import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoPhonePortrait, 
  IoWallet, 
  IoKey, 
  IoBook, 
  IoBag, 
  IoShirt,
  IoLaptop,
  IoHeadset,
  IoTime,
  IoGlasses,
  IoUmbrella,
  IoFlash,
  IoAdd,
  IoMic
} from 'react-icons/io5';
import VoiceInput from '../VoiceInput/VoiceInput';
import './QuickTemplates.css';

const BLOCKS = ['C Block', 'S Block', 'R Block', 'F Block', 'M Block', 'SK Block','Arts Block'];
const CANTEENS = ['Satish Canteen', 'Main Canteen'];
const OTHERS = ['Library', 'Parking'];

// Group templates by category for title selection
const getTemplatesByCategory = () => {
  const grouped = {};
  TEMPLATES.forEach(template => {
    if (!grouped[template.category]) {
      grouped[template.category] = [];
    }
    grouped[template.category].push(template);
  });
  return grouped;
};

const TEMPLATES = [
  {
    id: 'phone',
    name: 'Phone',
    icon: <IoPhonePortrait />,
    category: 'Electronics',
    colors: ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Rose Gold'],
    brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'earbuds',
    name: 'Earbuds',
    icon: <IoHeadset />,
    category: 'Electronics',
    colors: ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Rose Gold'],
    brands: ['Apple', 'Samsung', 'Google', 'Sony', 'JBL', 'BoAt', 'Noise', 'OnePlus'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'wallet',
    name: 'Wallet',
    icon: <IoWallet />,
    category: 'Accessories',
    colors: ['Black', 'Brown', 'Tan', 'Red', 'Navy', 'Burgundy'],
    brands: ['Coach', 'Michael Kors', 'Louis Vuitton', 'Hermes', 'Ralph Lauren', 'Tommy Hilfiger'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'keys',
    name: 'Keys',
    icon: <IoKey />,
    category: 'Keys',
    colors: ['Silver', 'Gold', 'Black', 'Blue', 'Bronze'],
    brands: ['Yale', 'Schlage', 'Kwikset', 'Master Lock'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'idcard',
    name: 'ID Card',
    icon: <IoKey />,
    category: 'Keys',
    colors: ['Red', 'Blue', 'Green', 'Yellow'],
    brands: ['University', 'College', 'Institute'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'books',
    name: 'Books',
    icon: <IoBook />,
    category: 'Books',
    colors: ['Various', 'Blue', 'Red', 'Green', 'Black', 'Yellow'],
    brands: ['Oxford', 'Cambridge', 'Penguin', 'HarperCollins'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: <IoBag />,
    category: 'Bags',
    colors: ['Black', 'Navy', 'Brown', 'Green', 'Gray', 'Red', 'Blue'],
    brands: ['North Face', 'Herschel', 'JanSport', 'Osprey', 'Nike', 'Adidas', 'Puma'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'clothing',
    name: 'Clothing',
    icon: <IoShirt />,
    category: 'Clothing',
    colors: ['Black', 'White', 'Navy', 'Gray', 'Brown', 'Green', 'Red', 'Blue'],
    brands: ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Uniqlo', 'Levis'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'jacket',
    name: 'Jacket',
    icon: <IoShirt />,
    category: 'Clothing',
    colors: ['Black', 'Navy', 'Brown', 'Green', 'Gray', 'Red', 'Blue', 'White'],
    brands: ['North Face', 'Columbia', 'Adidas', 'Nike', 'Zara', 'Jack & Jones'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'laptop',
    name: 'Laptop',
    icon: <IoLaptop />,
    category: 'Electronics',
    colors: ['Silver', 'Space Gray', 'Black', 'White', 'Rose Gold'],
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Microsoft', 'ASUS', 'Acer', 'MSI'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'tablet',
    name: 'Tablet',
    icon: <IoLaptop />,
    category: 'Electronics',
    colors: ['Silver', 'Space Gray', 'Black', 'Gold'],
    brands: ['Apple', 'Samsung', 'Lenovo', 'Microsoft', 'ASUS'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'headphones',
    name: 'Headphones',
    icon: <IoHeadset />,
    category: 'Electronics',
    colors: ['Black', 'White', 'Silver', 'Gold', 'Rose Gold', 'Blue', 'Red'],
    brands: ['Sony', 'Bose', 'Beats', 'JBL', 'Audio-Technica', 'Sennheiser', 'AKG'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'smartwatch',
    name: 'Smartwatch',
    icon: <IoTime />,
    category: 'Accessories',
    colors: ['Silver', 'Gold', 'Black', 'Rose Gold', 'White', 'Blue', 'Green'],
    brands: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Noise', 'BoAt'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'watch',
    name: 'Watch',
    icon: <IoTime />,
    category: 'Accessories',
    colors: ['Silver', 'Gold', 'Black', 'Rose Gold', 'White', 'Brown', 'Blue'],
    brands: ['Rolex', 'Casio', 'Seiko', 'Titan', 'Fastrack', 'Omega'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'glasses',
    name: 'Glasses',
    icon: <IoGlasses />,
    category: 'Accessories',
    colors: ['Black', 'Brown', 'Tortoise', 'Gold', 'Silver', 'Red', 'Blue'],
    brands: ['Ray-Ban', 'Oakley', 'Warby Parker', 'Prada', 'Gucci'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'umbrella',
    name: 'Umbrella',
    icon: <IoUmbrella />,
    category: 'Accessories',
    colors: ['Black', 'Navy', 'Green', 'Red', 'Patterned', 'Yellow', 'Pink'],
    brands: ['Totes', 'Blunt', 'Fanny', 'Senninger', 'Nintendo'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'charger',
    name: 'Charger',
    icon: <IoFlash />,
    category: 'Electronics',
    colors: ['White', 'Black', 'Gray', 'Silver', 'Blue'],
    brands: ['Apple', 'Samsung', 'Anker', 'Belkin', 'Sony', 'OnePlus'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  },
  {
    id: 'cable',
    name: 'Cable',
    icon: <IoFlash />,
    category: 'Electronics',
    colors: ['White', 'Black', 'Gray', 'Silver', 'Blue', 'Red'],
    brands: ['Apple', 'Samsung', 'Anker', 'Belkin', 'UGREEN', 'Baseus'],
    locations: [...BLOCKS, ...CANTEENS, ...OTHERS]
  }
];

const QuickTemplates = ({ onSelectTemplate, selectedTemplate, onSelectDetail }) => {
  const [customColors, setCustomColors] = useState([]);
  const [customBrands, setCustomBrands] = useState([]);
  const [customLocations, setCustomLocations] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [newValue, setNewValue] = useState('');
  const [blockRoomInput, setBlockRoomInput] = useState(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const handleAddClick = (field) => {
    setActiveInput(field);
    setNewValue('');
  };

  const handleAddValue = (field) => {
    if (newValue.trim()) {
      const trimmedValue = newValue.trim();
      if (field === 'color' && !customColors.includes(trimmedValue)) {
        setCustomColors([...customColors, trimmedValue]);
      } else if (field === 'brand' && !customBrands.includes(trimmedValue)) {
        setCustomBrands([...customBrands, trimmedValue]);
      } else if (field === 'location' && !customLocations.includes(trimmedValue)) {
        setCustomLocations([...customLocations, trimmedValue]);
      }
    }
    setActiveInput(null);
    setNewValue('');
  };

  const handleBlockClick = (blockName) => {
    setBlockRoomInput(blockName);
    setRoomNumber('');
  };

  const handleRoomNumberSubmit = (blockName) => {
    if (roomNumber.trim()) {
      const locationValue = `${blockName}-${roomNumber.trim()}`;
      if (!customLocations.includes(locationValue)) {
        setCustomLocations([...customLocations, locationValue]);
      }
      onSelectDetail && onSelectDetail('location', locationValue);
    }
    setBlockRoomInput(null);
    setRoomNumber('');
  };

  const handleRoomKeyDown = (e, blockName) => {
    if (e.key === 'Enter') {
      handleRoomNumberSubmit(blockName);
    } else if (e.key === 'Escape') {
      setBlockRoomInput(null);
      setRoomNumber('');
    }
  };

  const handleVoiceTranscript = (text) => {
    onSelectDetail && onSelectDetail('description', text);
    setShowVoiceInput(false);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      handleAddValue(field);
    } else if (e.key === 'Escape') {
      setActiveInput(null);
      setNewValue('');
    }
  };

  const renderAddButton = (field, label) => (
    <div className="add-option-wrapper">
      <motion.button
        className="add-option-btn"
        onClick={() => handleAddClick(field)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={`Add custom ${label}`}
      >
        <IoAdd /> Add {label}
      </motion.button>
      <AnimatePresence>
        {activeInput === field && (
          <motion.div
            className="add-input-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <input
              type="text"
              className="add-option-input"
              placeholder={`Enter ${label}...`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, field)}
              autoFocus
            />
            <motion.button
              className="add-option-confirm"
              onClick={() => handleAddValue(field)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✓
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  return (
    <div className="quick-templates">
      <div className="templates-header">
        <h3>
          <IoFlash />
          Quick Templates
        </h3>
        <span className="templates-count">
          {TEMPLATES.length} templates
        </span>
      </div>
       
      <p className="templates-description">
        Select a template to auto-fill common item details
      </p>

      <div className="templates-grid">
        {TEMPLATES.map((template, index) => (
          <motion.div
            key={template.id}
            className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
            onClick={() => onSelectTemplate(template)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="template-icon">
              {template.icon}
            </div>
            <div className="template-info">
              <h4>{template.name}</h4>
              <span className="template-category">{template.category}</span>
            </div>
            {selectedTemplate?.id === template.id && (
              <motion.div 
                className="selected-check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {selectedTemplate && (
        <motion.div 
          className="template-details"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="template-details-header">
            <h4>Template Details - Click to add to description</h4>
            <motion.button
              className="voice-input-toggle"
              onClick={() => setShowVoiceInput(!showVoiceInput)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Use voice input"
            >
              <IoMic />
            </motion.button>
          </div>
          {showVoiceInput && (
            <div className="voice-input-section">
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                placeholder="Speak to add details..."
              />
            </div>
          )}
          <p className="template-instruction">Tap on any option below to add it to your description</p>
           
          {/* Title Section */}
          <div className="detail-section">
            <strong>Title:</strong>
            <div className="detail-tags">
              {getTemplatesByCategory()[selectedTemplate.category]?.map(template => (
                <motion.button 
                  key={template.id} 
                  className={`detail-tag title-tag ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                  onClick={() => onSelectDetail && onSelectDetail('title', template.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {template.name}
                </motion.button>
              ))}
            </div>
          </div>
           
          <div className="detail-section">
            <strong>Colors:</strong>
            <div className="detail-tags">
              {selectedTemplate.colors.map(color => (
                <motion.button 
                  key={color} 
                  className="detail-tag color-tag"
                  onClick={() => onSelectDetail && onSelectDetail('color', color)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {color}
                </motion.button>
              ))}
              {customColors.map(color => (
                <motion.button 
                  key={color} 
                  className="detail-tag color-tag custom-tag"
                  onClick={() => onSelectDetail && onSelectDetail('color', color)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {color}
                </motion.button>
              ))}
              {renderAddButton('color', 'Color')}
            </div>
          </div>
          <div className="detail-section">
            <strong>Brands:</strong>
            <div className="detail-tags">
              {selectedTemplate.brands.map(brand => (
                <motion.button 
                  key={brand} 
                  className="detail-tag brand-tag"
                  onClick={() => onSelectDetail && onSelectDetail('brand', brand)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {brand}
                </motion.button>
              ))}
              {customBrands.map(brand => (
                <motion.button 
                  key={brand} 
                  className="detail-tag brand-tag custom-tag"
                  onClick={() => onSelectDetail && onSelectDetail('brand', brand)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {brand}
                </motion.button>
              ))}
              {renderAddButton('brand', 'Brand')}
            </div>
          </div>
          <div className="detail-section">
            <strong>Location:</strong>
            <div className="detail-tags">
              {BLOCKS.map(location => (
                <div key={location} className="block-location-wrapper">
                  <motion.button 
                    key={location} 
                    className="detail-tag location-tag"
                    onClick={() => handleBlockClick(location)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {location}
                  </motion.button>
                  <AnimatePresence>
                    {blockRoomInput === location && (
                      <motion.div
                        className="room-input-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <input
                          type="text"
                          className="room-input"
                          placeholder="Room No."
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          onKeyDown={(e) => handleRoomKeyDown(e, location)}
                          autoFocus
                        />
                        <motion.button
                          className="room-confirm-btn"
                          onClick={() => handleRoomNumberSubmit(location)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ✓
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {CANTEENS.map(location => (
                <motion.button 
                  key={location} 
                  className="detail-tag location-tag"
                  onClick={() => onSelectDetail && onSelectDetail('location', location)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {location}
                </motion.button>
              ))}
              {OTHERS.map(location => (
                <motion.button 
                  key={location} 
                  className="detail-tag location-tag"
                  onClick={() => onSelectDetail && onSelectDetail('location', location)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {location}
                </motion.button>
              ))}
              {customLocations.map(location => (
                <motion.button 
                  key={location} 
                  className="detail-tag location-tag custom-tag"
                  onClick={() => onSelectDetail && onSelectDetail('location', location)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {location}
                </motion.button>
              ))}
              {renderAddButton('location', 'Location')}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuickTemplates;
export { TEMPLATES };
