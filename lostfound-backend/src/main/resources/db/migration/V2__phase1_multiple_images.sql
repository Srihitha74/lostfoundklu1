-- ============================================================
-- PostgreSQL Migration Script for Phase 1 - Multiple Images & AI Detection
-- Converted from MySQL to PostgreSQL
-- ============================================================

-- MySQL Version (Commented out)
-- CREATE TABLE IF NOT EXISTS item_images (
--     id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     item_id BIGINT NOT NULL,
--     image_url VARCHAR(500) NOT NULL,
--     is_primary BOOLEAN DEFAULT FALSE,
--     upload_order INT DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
-- );

-- PostgreSQL Version
-- Create table for multiple images
CREATE TABLE IF NOT EXISTS item_images (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    upload_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_item_id ON item_images(item_id);

-- MySQL Version (Commented out)
-- ALTER TABLE items 
-- ADD COLUMN IF NOT EXISTS ai_detected_category VARCHAR(100),
-- ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(5,2),
-- ADD COLUMN IF NOT EXISTS ai_detected_colors VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS ai_detected_brands VARCHAR(255);

-- PostgreSQL Version - Add AI analysis fields to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS ai_detected_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS ai_confidence_score NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS ai_detected_colors VARCHAR(255),
ADD COLUMN IF NOT EXISTS ai_detected_brands VARCHAR(255);
