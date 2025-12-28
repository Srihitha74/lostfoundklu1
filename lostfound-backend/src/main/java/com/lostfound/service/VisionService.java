package com.lostfound.service;

import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        // Read image file
        byte[] imageBytes = Files.readAllBytes(Paths.get(imagePath));

        // Create Vision API client
        try (ImageAnnotatorClient vision = ImageAnnotatorClient.create()) {
            // Build the image request
            ByteString imgBytes = ByteString.copyFrom(imageBytes);
            Image img = Image.newBuilder().setContent(imgBytes).build();

            // Set up the feature for label detection
            Feature feat = Feature.newBuilder().setType(Feature.Type.LABEL_DETECTION).build();
            AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                    .addFeatures(feat)
                    .setImage(img)
                    .build();

            // Perform the request
            BatchAnnotateImagesResponse response = vision.batchAnnotateImages(List.of(request));
            List<AnnotateImageResponse> responses = response.getResponsesList();

            if (responses.isEmpty() || responses.get(0).hasError()) {
                throw new Exception("Vision API request failed");
            }

            // Extract labels
            List<String> labels = new ArrayList<>();
            for (EntityAnnotation annotation : responses.get(0).getLabelAnnotationsList()) {
                labels.add(annotation.getDescription().toLowerCase());
            }

            return labels;
        }
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