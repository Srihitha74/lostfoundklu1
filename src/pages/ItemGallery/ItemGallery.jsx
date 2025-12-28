import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoSearch, IoFilter, IoArrowBack } from 'react-icons/io5';
import ItemCard from '../../components/ItemCard/ItemCard.jsx';
import './ItemGallery.css';

const ItemGallery = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  const categories = ['all', 'Electronics', 'Clothing', 'Bags & Accessories', 'Books & Stationery', 'Sports Equipment', 'Personal Items', 'Documents', 'Keys', 'Other'];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('http://backend:8080/api/items');
        const data = await response.json();
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
        setItems([]);
        setFilteredItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    let filtered = items;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory, selectedStatus]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="item-gallery">
      <div className="gallery-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <IoArrowBack />
          Back
        </button>
        <h1>Browse Items</h1>
      </div>

      <div className="gallery-container">
        <div className="search-filters">
          <div className="search-bar">
            <IoSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search items, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
          </div>
        </div>

        <div className="gallery-stats">
          <p>{filteredItems.length} items found</p>
        </div>

        {isLoading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="item-skeleton shimmer"></div>
            ))}
          </div>
        ) : (
          <motion.div
            className="items-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <ItemCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No items found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemGallery;
