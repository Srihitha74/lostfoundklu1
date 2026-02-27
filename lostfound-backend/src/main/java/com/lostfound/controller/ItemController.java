package com.lostfound.controller;

import com.lostfound.model.Item;
import com.lostfound.model.ItemImage;
import com.lostfound.model.Status;
import com.lostfound.model.User;
import com.lostfound.repository.ItemImageRepository;
import com.lostfound.repository.UserRepository;
import com.lostfound.service.ItemService;
import com.lostfound.service.VisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VisionService visionService;

    @Autowired
    private ItemImageRepository itemImageRepository;

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(itemService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return itemService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createItem(
            @RequestParam("title") String title,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam("status") String status,
            @RequestParam("location") String location,
            @RequestParam("date") String date,
            @RequestParam("description") String description,
            @RequestParam("contactInfo") String contactInfo,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            Authentication authentication) throws IOException {

        // Set user from authentication
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Item item = new Item();
        item.setTitle(title);
        item.setStatus(Status.valueOf(status.toUpperCase()));
        item.setLocation(location);
        item.setDate(java.time.LocalDateTime.parse(date.substring(0, 19)));
        item.setDescription(description);
        item.setContactInfo(contactInfo);
        item.setUser(user);

        String finalCategory = category;
        String primaryImagePath = null;
        List<String> allImagePaths = new ArrayList<>();

        // Handle multiple image uploads
        if (images != null && images.length > 0) {
            String uploadDir = "uploads/images/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            List<ItemImage> itemImages = new ArrayList<>();
            
            for (int i = 0; i < images.length; i++) {
                MultipartFile image = images[i];
                if (image != null && !image.isEmpty()) {
                    String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                    Path filePath = uploadPath.resolve(fileName);
                    Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                    
                    String imageUrl = "/uploads/images/" + fileName;
                    allImagePaths.add(filePath.toString());
                    
                    // First image is primary
                    boolean isPrimary = (i == 0);
                    
                    // Save image entity
                    ItemImage itemImage = new ItemImage(item, imageUrl, isPrimary, i);
                    itemImages.add(itemImage);
                    
                    if (isPrimary) {
                        item.setImageUrl(imageUrl);
                        primaryImagePath = filePath.toString();
                    }
                }
            }
            
            item.setImages(itemImages);
        }

        // Google AI Tool: Use Vision API to auto-detect category from first image if not provided
        if ((finalCategory == null || finalCategory.trim().isEmpty()) && !allImagePaths.isEmpty()) {
            VisionService.EnhancedAnalysisResult aiResult = visionService.analyzeImageEnhanced(allImagePaths.get(0));
            finalCategory = aiResult.getCategory();
            
            // Save AI detection results
            item.setAiDetectedCategory(aiResult.getCategory());
            item.setAiConfidenceScore(aiResult.getConfidenceScore());
            item.setAiDetectedColors(aiResult.getDetectedColors());
            item.setAiDetectedBrands(aiResult.getDetectedBrands());
        }

        // Set category, default to "Other" if still not set
        item.setCategory(finalCategory != null && !finalCategory.trim().isEmpty() ? finalCategory : "Other");

        // Google AI Tool: Extract AI labels for matching (from first image)
        if (!allImagePaths.isEmpty()) {
            List<String> aiLabels = visionService.analyzeImageAndExtractLabels(allImagePaths.get(0));
            item.setAiLabels(aiLabels);
        }

        Item savedItem = itemService.save(item);
        return ResponseEntity.ok(savedItem);
    }

    /**
     * Phase 1: New endpoint for AI image analysis
     * Returns detailed analysis: category, colors, brands, confidence score, labels
     */
    @PostMapping("/analyze-image")
    public ResponseEntity<VisionService.EnhancedAnalysisResult> analyzeImage(
            @RequestParam("image") MultipartFile image) throws IOException {
        
        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Save temp image
        String tempFileName = "temp_analysis_" + UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        Path tempPath = Paths.get("uploads/images/").resolve(tempFileName);
        Files.createDirectories(tempPath.getParent());
        Files.copy(image.getInputStream(), tempPath, StandardCopyOption.REPLACE_EXISTING);

        try {
            // Analyze image with enhanced Vision API
            VisionService.EnhancedAnalysisResult result = visionService.analyzeImageEnhanced(tempPath.toString());
            return ResponseEntity.ok(result);
        } finally {
            // Clean up temp file
            Files.deleteIfExists(tempPath);
        }
    }

    /**
     * Phase 1: Get all images for an item
     */
    @GetMapping("/{id}/images")
    public ResponseEntity<List<ItemImage>> getItemImages(@PathVariable Long id) {
        List<ItemImage> images = itemImageRepository.findByItemIdOrderByUploadOrderAsc(id);
        return ResponseEntity.ok(images);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Item>> getItemsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(itemService.findByUserId(userId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Item>> getMyItems(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(itemService.findByUserId(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Item item = itemService.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));

        // Check if the user owns the item
        if (!item.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        itemService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/suggest-category")
    public ResponseEntity<String> suggestCategory(@RequestParam("image") MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().body("Image is required");
        }

        String tempFileName = "temp_" + UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        Path tempPath = Paths.get("uploads/images/").resolve(tempFileName);
        Files.createDirectories(tempPath.getParent());
        Files.copy(image.getInputStream(), tempPath, StandardCopyOption.REPLACE_EXISTING);

        String suggestedCategory = visionService.analyzeImageAndDetectCategory(tempPath.toString());

        Files.deleteIfExists(tempPath);

        return ResponseEntity.ok(suggestedCategory);
    }
}
