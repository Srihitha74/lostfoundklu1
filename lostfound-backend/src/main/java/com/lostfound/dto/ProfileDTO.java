package com.lostfound.dto;

import com.lostfound.model.Role;

public class ProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String profilePictureUrl;
    private String phoneNumber;
    private String yearOfStudy;
    private String universityId;
    private String department;
    private Role role;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;

    public ProfileDTO() {}

    public ProfileDTO(Long id, String name, String email, String profilePictureUrl, 
                     String phoneNumber, String yearOfStudy, String universityId, 
                     String department, Role role, java.time.LocalDateTime createdAt,
                     java.time.LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profilePictureUrl = profilePictureUrl;
        this.phoneNumber = phoneNumber;
        this.yearOfStudy = yearOfStudy;
        this.universityId = universityId;
        this.department = department;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getYearOfStudy() { return yearOfStudy; }
    public void setYearOfStudy(String yearOfStudy) { this.yearOfStudy = yearOfStudy; }
    public String getUniversityId() { return universityId; }
    public void setUniversityId(String universityId) { this.universityId = universityId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
