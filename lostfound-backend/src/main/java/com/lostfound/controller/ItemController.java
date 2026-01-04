package com.lostfound.controller;

import com.lostfound.model.Item;
import com.lostfound.model.Status;
import com.lostfound.model.User;
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
import java.util.List;
import java.util.UUID;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VisionService visionService;


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
    public ResponseEntity<Item> createItem(
            @RequestParam("title") String title,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam("status") String status,
            @RequestParam("location") String location,
            @RequestParam("date") String date,
            @RequestParam("description") String description,
            @RequestParam("contactInfo") String contactInfo,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication) throws IOException {

        // Set user from authentication
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Item item = new Item();
        item.setTitle(title);
        item.setStatus(Status.valueOf(status.toUpperCase()));
        item.setLocation(location);
        item.setDate(java.time.LocalDateTime.parse(date.substring(0, 19))); // Parse ISO string
        item.setDescription(description);
        item.setContactInfo(contactInfo);
        item.setUser(user);

        String finalCategory = category;
        String imagePath = null;

        // Handle image upload
        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/images/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            item.setImageUrl("/uploads/images/" + fileName);
            imagePath = filePath.toString();

            // Google AI Tool: Use Vision API to auto-detect category if not provided
            if (finalCategory == null || finalCategory.trim().isEmpty()) {
                finalCategory = visionService.analyzeImageAndDetectCategory(imagePath);
            }

            // Google AI Tool: Extract AI labels for matching
            List<String> aiLabels = visionService.analyzeImageAndExtractLabels(imagePath);
            item.setAiLabels(aiLabels);
        }

        // Set category, default to "Unknown" if still not set
        item.setCategory(finalCategory != null && !finalCategory.trim().isEmpty() ? finalCategory : "Unknown");

        Item savedItem = itemService.save(item);
        return ResponseEntity.ok(savedItem);
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
            return ResponseEntity.status(403).build(); // Forbidden
        }

        itemService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/suggest-category")
    public ResponseEntity<String> suggestCategory(@RequestParam("image") MultipartFile image) throws IOException {
        // Google AI Tool: Provide category suggestion based on image analysis
        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().body("Image is required");
        }

        // Save temp image
        String tempFileName = "temp_" + UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        Path tempPath = Paths.get("uploads/images/").resolve(tempFileName);
        Files.createDirectories(tempPath.getParent());
        Files.copy(image.getInputStream(), tempPath, StandardCopyOption.REPLACE_EXISTING);

        // Analyze image
        String suggestedCategory = visionService.analyzeImageAndDetectCategory(tempPath.toString());

        // Clean up temp file
        Files.deleteIfExists(tempPath);

        return ResponseEntity.ok(suggestedCategory);
    }
}