package com.lostfound.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String category;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String location;

    private LocalDateTime date;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private String description;

    private String contactInfo;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // AI-assisted matching fields
    @ElementCollection
    @CollectionTable(name = "item_ai_labels", joinColumns = @JoinColumn(name = "item_id"))
    @Column(name = "label")
    private List<String> aiLabels;

    private boolean aiMatched;

    private Long matchedItemId;

    // Phase 1: Multiple Images Support
    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("uploadOrder ASC")
    private List<ItemImage> images = new ArrayList<>();

    // Phase 1: AI Detection Fields
    @Column(name = "ai_detected_category")
    private String aiDetectedCategory;

    @Column(name = "ai_confidence_score")
    private Double aiConfidenceScore;

    @Column(name = "ai_detected_colors", length = 255)
    private String aiDetectedColors;

    @Column(name = "ai_detected_brands", length = 255)
    private String aiDetectedBrands;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<String> getAiLabels() {
        return aiLabels;
    }

    public void setAiLabels(List<String> aiLabels) {
        this.aiLabels = aiLabels;
    }

    public boolean isAiMatched() {
        return aiMatched;
    }

    public void setAiMatched(boolean aiMatched) {
        this.aiMatched = aiMatched;
    }

    public Long getMatchedItemId() {
        return matchedItemId;
    }

    public void setMatchedItemId(Long matchedItemId) {
        this.matchedItemId = matchedItemId;
    }

    // Phase 1: Multiple Images Helper Methods
    public List<ItemImage> getImages() {
        return images;
    }

    public void setImages(List<ItemImage> images) {
        this.images = images;
    }

    public void addImage(ItemImage image) {
        images.add(image);
        image.setItem(this);
    }

    public void removeImage(ItemImage image) {
        images.remove(image);
        image.setItem(null);
    }

    // Phase 1: AI Detection Getters and Setters
    public String getAiDetectedCategory() {
        return aiDetectedCategory;
    }

    public void setAiDetectedCategory(String aiDetectedCategory) {
        this.aiDetectedCategory = aiDetectedCategory;
    }

    public Double getAiConfidenceScore() {
        return aiConfidenceScore;
    }

    public void setAiConfidenceScore(Double aiConfidenceScore) {
        this.aiConfidenceScore = aiConfidenceScore;
    }

    public String getAiDetectedColors() {
        return aiDetectedColors;
    }

    public void setAiDetectedColors(String aiDetectedColors) {
        this.aiDetectedColors = aiDetectedColors;
    }

    public String getAiDetectedBrands() {
        return aiDetectedBrands;
    }

    public void setAiDetectedBrands(String aiDetectedBrands) {
        this.aiDetectedBrands = aiDetectedBrands;
    }

    // Get primary image URL for backward compatibility
    public String getPrimaryImageUrl() {
        if (images != null && !images.isEmpty()) {
            return images.get(0).getImageUrl();
        }
        return imageUrl;
    }
}