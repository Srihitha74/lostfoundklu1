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
        Map.entry("wallet", "Accessories"),
        Map.entry("purse", "Accessories"),
        Map.entry("key", "Keys"),
        Map.entry("keys", "Keys"),
        Map.entry("book", "Books"),
        Map.entry("books", "Books"),
        Map.entry("shirt", "Clothing"),
        Map.entry("jacket", "Clothing"),
        Map.entry("clothing", "Clothing"),
        Map.entry("bag", "Bags"),
        Map.entry("backpack", "Bags")
    );

    // Google Cloud Vision API: Analyze image and detect category
    public String analyzeImageAndDetectCategory(String imagePath) {
        try {
            List<String> labels = analyzeImageWithVisionAPI(imagePath);
            return mapLabelsToCategory(labels);
        } catch (Exception e) {
            System.err.println("Error analyzing image with Vision API: " + e.getMessage());
            // Fallback to filename-based detection
            return fallbackCategoryDetection(imagePath);
        }
    }

    // Google Cloud Vision API: Extract AI labels from image analysis
    public List<String> analyzeImageAndExtractLabels(String imagePath) {
        try {
            return analyzeImageWithVisionAPI(imagePath);
        } catch (Exception e) {
            System.err.println("Error extracting labels with Vision API: " + e.getMessage());
            // Fallback to filename-based labels
            return fallbackLabelExtraction(imagePath);
        }
    }

    private List<String> analyzeImageWithVisionAPI(String imagePath) throws Exception {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new Exception("Google Cloud Vision API key not configured");
        }

        // Read image file
        byte[] imageBytes = Files.readAllBytes(Paths.get(imagePath));
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        // Build REST API request
        String url = "https://vision.googleapis.com/v1/images:annotate?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
            "requests", List.of(
                Map.of(
                    "image", Map.of("content", base64Image),
                    "features", List.of(Map.of("type", "LABEL_DETECTION", "maxResults", 10))
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

        // Parse response
        Map responseBody = response.getBody();
        List<Map> responses = (List<Map>) responseBody.get("responses");
        if (responses == null || responses.isEmpty()) {
            throw new Exception("No responses from Vision API");
        }

        Map firstResponse = responses.get(0);
        if (firstResponse.containsKey("error")) {
            throw new Exception("Vision API error: " + firstResponse.get("error"));
        }

        List<Map> labelAnnotations = (List<Map>) firstResponse.get("labelAnnotations");
        if (labelAnnotations == null) {
            return new ArrayList<>();
        }

        List<String> labels = new ArrayList<>();
        for (Map annotation : labelAnnotations) {
            String description = (String) annotation.get("description");
            if (description != null) {
                labels.add(description.toLowerCase());
            }
        }

        return labels;
    }

    private String mapLabelsToCategory(List<String> labels) {
        for (String label : labels) {
            String category = CATEGORY_MAPPING.get(label);
            if (category != null) {
                return category;
            }
        }
        return "Unknown"; // Default category
    }

    private String fallbackCategoryDetection(String imagePath) {
        String fileName = imagePath.toLowerCase();
        for (Map.Entry<String, String> entry : CATEGORY_MAPPING.entrySet()) {
            if (fileName.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return "Unknown";
    }

    private List<String> fallbackLabelExtraction(String imagePath) {
        String fileName = imagePath.toLowerCase();
        List<String> labels = new ArrayList<>(Arrays.asList("object", "item"));

        for (Map.Entry<String, String> entry : CATEGORY_MAPPING.entrySet()) {
            if (fileName.contains(entry.getKey())) {
                // Add some related labels
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
}