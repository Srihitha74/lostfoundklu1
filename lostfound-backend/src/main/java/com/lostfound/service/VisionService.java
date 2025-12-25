package com.lostfound.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class VisionService {

    // Google AI Tool: Google Cloud Vision API for image analysis and category detection
    // Note: In production, this would integrate with Google Cloud Vision API
    // For demo purposes, returning mock categories and labels based on filename patterns
    public String analyzeImageAndDetectCategory(String imagePath) {
        try {
            // Mock implementation: detect category based on filename keywords
            String fileName = imagePath.toLowerCase();

            if (fileName.contains("phone") || fileName.contains("mobile")) {
                return "Electronics";
            } else if (fileName.contains("wallet") || fileName.contains("purse")) {
                return "Accessories";
            } else if (fileName.contains("key")) {
                return "Keys";
            } else if (fileName.contains("book")) {
                return "Books";
            } else if (fileName.contains("shirt") || fileName.contains("jacket") || fileName.contains("clothing")) {
                return "Clothing";
            } else if (fileName.contains("bag") || fileName.contains("backpack")) {
                return "Bags";
            } else {
                return "Unknown"; // Fallback category
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Unknown"; // Fallback on error
        }
    }

    // Google AI Tool: Extract AI labels from image analysis
    // Returns mock labels based on filename patterns
    public List<String> analyzeImageAndExtractLabels(String imagePath) {
        try {
            String fileName = imagePath.toLowerCase();
            List<String> labels = Arrays.asList("object", "item"); // Default labels

            if (fileName.contains("phone") || fileName.contains("mobile")) {
                labels = Arrays.asList("smartphone", "mobile phone", "electronics", "device", "technology");
            } else if (fileName.contains("wallet") || fileName.contains("purse")) {
                labels = Arrays.asList("wallet", "purse", "accessory", "leather", "money holder");
            } else if (fileName.contains("key")) {
                labels = Arrays.asList("key", "metal", "lock", "access", "security");
            } else if (fileName.contains("book")) {
                labels = Arrays.asList("book", "paper", "reading", "education", "literature");
            } else if (fileName.contains("shirt") || fileName.contains("jacket") || fileName.contains("clothing")) {
                labels = Arrays.asList("clothing", "fabric", "wear", "apparel", "garment");
            } else if (fileName.contains("bag") || fileName.contains("backpack")) {
                labels = Arrays.asList("bag", "backpack", "container", "storage", "carrier");
            }

            return labels;
        } catch (Exception e) {
            e.printStackTrace();
            return Arrays.asList("object", "item"); // Fallback labels
        }
    }
}