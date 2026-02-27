package com.lostfound.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.Base64;

@Service
public class VisionService {

    @Value("${google.cloud.vision.api-key:}")
    private String apiKey;

    // Category mapping based on common labels
    private static final Map<String, String> CATEGORY_MAPPING = Map.ofEntries(
        Map.entry("phone", "Electronics"),
        Map.entry("mobile", "Electronics"),
        Map.entry("smartphone", "Electronics"),
        Map.entry("laptop", "Electronics"),
        Map.entry("computer", "Electronics"),
        Map.entry("tablet", "Electronics"),
        Map.entry("wallet", "Accessories"),
        Map.entry("purse", "Accessories"),
        Map.entry("key", "Keys"),
        Map.entry("keys", "Keys"),
        Map.entry("card", "Accessories"),
        Map.entry("book", "Books"),
        Map.entry("books", "Books"),
        Map.entry("notebook", "Books"),
        Map.entry("shirt", "Clothing"),
        Map.entry("jacket", "Clothing"),
        Map.entry("clothing", "Clothing"),
        Map.entry("bag", "Bags"),
        Map.entry("backpack", "Bags"),
        Map.entry("headphones", "Electronics"),
        Map.entry("earbuds", "Electronics"),
        Map.entry("watch", "Accessories"),
        Map.entry("glasses", "Accessories"),
        Map.entry("sunglasses", "Accessories"),
        Map.entry("umbrella", "Accessories"),
        Map.entry("charger", "Electronics"),
        Map.entry("cable", "Electronics")
    );

    // Brand detection patterns
    private static final Set<String> KNOWN_BRANDS = Set.of(
        "apple", "samsung", "google", "microsoft", "dell", "hp", "lenovo", "asus",
        "sony", "bose", "beats", "jbl", "marshall", "nike", "adidas", "puma",
        "under armour", "north face", "columbia", "zara", "h&m", "uniqlo",
        "ray-ban", "oakley", "warby parker", "versace", "gucci", "prada",
        "hermes", "lv", "tiffany", "cartier", "rolex", "omega", "seiko",
        "fitbit", "garmin", "polaroid", "canon", "nikon", "fujifilm",
        "logitech", "razer", "corsair", "steelSeries", "hyperx"
    );

    // Color detection patterns
    private static final Set<String> COLOR_NAMES = Set.of(
        "black", "white", "red", "blue", "green", "yellow", "orange", "purple",
        "pink", "brown", "gray", "grey", "navy", "beige", "tan", "burgundy",
        "maroon", "teal", "turquoise", "gold", "silver", "bronze", "camo",
        "pattern", "stripes", "plaid", "solid"
    );

    /**
     * Phase 1: Enhanced image analysis returning comprehensive AI analysis results
     */
    public EnhancedAnalysisResult analyzeImageEnhanced(String imagePath) {
        EnhancedAnalysisResult result = new EnhancedAnalysisResult();
        
        try {
            // Use Vision API for label detection
            List<Map<String, Object>> labels = analyzeImageWithVisionAPIEnhanced(imagePath);
            
            if (labels != null && !labels.isEmpty()) {
                // Extract category from top label
                String detectedCategory = mapLabelsToCategoryEnhanced(labels);
                result.setCategory(detectedCategory);
                
                // Extract confidence from top result
                double confidence = 0.0;
                Object scoreObj = labels.get(0).get("score");
                if (scoreObj != null) {
                    confidence = ((Number) scoreObj).doubleValue() * 100;
                }
                result.setConfidenceScore(confidence);
                
                // Extract colors from labels
                List<String> colors = extractColors(labels);
                result.setDetectedColors(String.join(", ", colors));
                
                // Extract brands from labels
                List<String> brands = extractBrands(labels);
                result.setDetectedBrands(String.join(", ", brands));
                
                // Extract all labels for matching
                List<String> allLabels = new ArrayList<>();
                for (Map<String, Object> label : labels) {
                    String desc = (String) label.get("description");
                    if (desc != null) {
                        allLabels.add(desc.toLowerCase());
                    }
                }
                result.setLabels(allLabels);
            } else {
                // Fallback analysis
                result = fallbackEnhancedAnalysis(imagePath);
            }
        } catch (Exception e) {
            System.err.println("Error in enhanced image analysis: " + e.getMessage());
            result = fallbackEnhancedAnalysis(imagePath);
        }
        
        return result;
    }

    /**
     * Enhanced Vision API call with more features
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> analyzeImageWithVisionAPIEnhanced(String imagePath) throws Exception {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new Exception("Google Cloud Vision API key not configured");
        }

        byte[] imageBytes = Files.readAllBytes(Paths.get(imagePath));
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        String url = "https://vision.googleapis.com/v1/images:annotate?key=" + apiKey;

        // Request multiple features: labels and text (for brand detection)
        Map<String, Object> requestBody = Map.of(
            "requests", List.of(
                Map.of(
                    "image", Map.of("content", base64Image),
                    "features", List.of(
                        Map.of("type", "LABEL_DETECTION", "maxResults", 15),
                        Map.of("type", "TEXT_DETECTION", "maxResults", 5),
                        Map.of("type", "IMAGE_PROPERTIES", "maxResults", 5)
                    )
                )
            )
        );

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new Exception("Vision API request failed with status: " + response.getStatusCode());
        }

        Map responseBody = response.getBody();
        List<Map> responses = (List<Map>) responseBody.get("responses");
        if (responses == null || responses.isEmpty()) {
            throw new Exception("No responses from Vision API");
        }

        Map firstResponse = responses.get(0);
        if (firstResponse.containsKey("error")) {
            throw new Exception("Vision API error: " + firstResponse.get("error"));
        }

        // Extract label annotations
        List<Map<String, Object>> labelAnnotations = (List<Map<String, Object>>) firstResponse.get("labelAnnotations");
        
        // Also check for text annotations (brand names, etc.)
        Map<String, Object> textAnnotation = (Map<String, Object>) firstResponse.get("textAnnotations");
        if (textAnnotation != null) {
            List<Map<String, Object>> textAnnotations = (List<Map<String, Object>>) textAnnotation.get("text");
            if (textAnnotations != null && !textAnnotations.isEmpty()) {
                // Add detected text as labels for brand detection
                for (Map<String, Object> text : textAnnotations) {
                    if (labelAnnotations == null) {
                        labelAnnotations = new ArrayList<>();
                    }
                    labelAnnotations.add(Map.of(
                        "description", ((String) text.get("description")).toLowerCase(),
                        "score", 0.9
                    ));
                }
            }
        }

        return labelAnnotations != null ? labelAnnotations : new ArrayList<>();
    }

    private String mapLabelsToCategoryEnhanced(List<Map<String, Object>> labels) {
        for (Map<String, Object> label : labels) {
            String description = ((String) label.get("description")).toLowerCase();
            String category = CATEGORY_MAPPING.get(description);
            if (category != null) {
                return category;
            }
            // Check for partial matches
            for (Map.Entry<String, String> entry : CATEGORY_MAPPING.entrySet()) {
                if (description.contains(entry.getKey()) || entry.getKey().contains(description)) {
                    return entry.getValue();
                }
            }
        }
        return "Other";
    }

    private List<String> extractColors(List<Map<String, Object>> labels) {
        List<String> colors = new ArrayList<>();
        for (Map<String, Object> label : labels) {
            String description = ((String) label.get("description")).toLowerCase();
            if (COLOR_NAMES.contains(description)) {
                colors.add(capitalizeFirst(description));
            }
        }
        return colors.isEmpty() ? List.of("Unknown") : colors;
    }

    private List<String> extractBrands(List<Map<String, Object>> labels) {
        List<String> brands = new ArrayList<>();
        for (Map<String, Object> label : labels) {
            String description = ((String) label.get("description")).toLowerCase();
            if (KNOWN_BRANDS.contains(description)) {
                brands.add(capitalizeFirst(description));
            }
        }
        return brands;
    }

    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    private EnhancedAnalysisResult fallbackEnhancedAnalysis(String imagePath) {
        EnhancedAnalysisResult result = new EnhancedAnalysisResult();
        
        String fileName = imagePath.toLowerCase();
        
        // Detect category from filename
        String detectedCategory = "Other";
        for (Map.Entry<String, String> entry : CATEGORY_MAPPING.entrySet()) {
            if (fileName.contains(entry.getKey())) {
                detectedCategory = entry.getValue();
                break;
            }
        }
        result.setCategory(detectedCategory);
        result.setConfidenceScore(50.0);
        result.setDetectedColors("Unknown");
        result.setDetectedBrands("");
        result.setLabels(Arrays.asList("object", "item", detectedCategory.toLowerCase()));
        
        return result;
    }

    // Google Cloud Vision API: Analyze image and detect category
    public String analyzeImageAndDetectCategory(String imagePath) {
        try {
            List<Map<String, Object>> labels = analyzeImageWithVisionAPIEnhanced(imagePath);
            return mapLabelsToCategoryEnhanced(labels);
        } catch (Exception e) {
            System.err.println("Error analyzing image with Vision API: " + e.getMessage());
            return fallbackCategoryDetection(imagePath);
        }
    }

    // Google Cloud Vision API: Extract AI labels from image analysis
    public List<String> analyzeImageAndExtractLabels(String imagePath) {
        try {
            List<Map<String, Object>> labels = analyzeImageWithVisionAPIEnhanced(imagePath);
            List<String> result = new ArrayList<>();
            for (Map<String, Object> label : labels) {
                String desc = (String) label.get("description");
                if (desc != null) {
                    result.add(desc.toLowerCase());
                }
            }
            return result;
        } catch (Exception e) {
            System.err.println("Error extracting labels with Vision API: " + e.getMessage());
            return fallbackLabelExtraction(imagePath);
        }
    }

    private String fallbackCategoryDetection(String imagePath) {
        String fileName = imagePath.toLowerCase();
        for (Map.Entry<String, String> entry : CATEGORY_MAPPING.entrySet()) {
            if (fileName.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return "Other";
    }

    private List<String> fallbackLabelExtraction(String imagePath) {
        String fileName = imagePath.toLowerCase();
        List<String> labels = new ArrayList<>(Arrays.asList("object", "item"));

        for (Map.Entry<String, String> entry : CATEGORY_MAPPING.entrySet()) {
            if (fileName.contains(entry.getKey())) {
                switch (entry.getValue()) {
                    case "Electronics":
                        labels.addAll(Arrays.asList("electronics", "device", "technology"));
                        break;
                    case "Accessories":
                        labels.addAll(Arrays.asList("accessory", "personal item"));
                        break;
                    case "Keys":
                        labels.addAll(Arrays.asList("metal", "lock", "access"));
                        break;
                    case "Books":
                        labels.addAll(Arrays.asList("paper", "reading", "education"));
                        break;
                    case "Clothing":
                        labels.addAll(Arrays.asList("fabric", "wear", "apparel"));
                        break;
                    case "Bags":
                        labels.addAll(Arrays.asList("container", "storage", "carrier"));
                        break;
                }
                break;
            }
        }
        return labels;
    }

    /**
     * Enhanced Analysis Result DTO
     */
    public static class EnhancedAnalysisResult {
        private String category;
        private Double confidenceScore;
        private String detectedColors;
        private String detectedBrands;
        private List<String> labels;

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public Double getConfidenceScore() {
            return confidenceScore;
        }

        public void setConfidenceScore(Double confidenceScore) {
            this.confidenceScore = confidenceScore;
        }

        public String getDetectedColors() {
            return detectedColors;
        }

        public void setDetectedColors(String detectedColors) {
            this.detectedColors = detectedColors;
        }

        public String getDetectedBrands() {
            return detectedBrands;
        }

        public void setDetectedBrands(String detectedBrands) {
            this.detectedBrands = detectedBrands;
        }

        public List<String> getLabels() {
            return labels;
        }

        public void setLabels(List<String> labels) {
            this.labels = labels;
        }
    }
}
