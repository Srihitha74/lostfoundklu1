package com.lostfound.service;

import com.lostfound.dto.ProfileDTO;
import com.lostfound.model.User;
import com.lostfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public ProfileDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return convertToDTO(user);
    }

    public ProfileDTO updateProfile(String email, ProfileDTO updates) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (updates.getName() != null && !updates.getName().trim().isEmpty()) {
            user.setName(updates.getName().trim());
        }

        if (updates.getPhoneNumber() != null && !updates.getPhoneNumber().trim().isEmpty()) {
            String phone = updates.getPhoneNumber().replaceAll("[^0-9]", "");
            if (phone.length() != 10) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number must be 10 digits");
            }
            user.setPhoneNumber(phone);
        }

        if (updates.getYearOfStudy() != null && !updates.getYearOfStudy().trim().isEmpty()) {
            user.setYearOfStudy(updates.getYearOfStudy().trim());
        }

        if (updates.getUniversityId() != null && !updates.getUniversityId().trim().isEmpty()) {
            String newUniversityId = updates.getUniversityId().trim();
            if (!newUniversityId.equals(user.getUniversityId())) {
                if (userRepository.existsByUniversityId(newUniversityId)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "University ID already in use");
                }
                user.setUniversityId(newUniversityId);
            }
        }

        if (updates.getDepartment() != null && !updates.getDepartment().trim().isEmpty()) {
            user.setDepartment(updates.getDepartment().trim());
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public ProfileDTO uploadProfilePicture(String email, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File must be an image");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size must be less than 5MB");
        }

        if (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().isEmpty()) {
            deleteOldProfilePicture(user.getProfilePictureUrl());
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = "profile_" + user.getId() + "_" + UUID.randomUUID().toString() + extension;

        Path uploadPath = Paths.get("uploads/profiles/");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String profilePictureUrl = "/uploads/profiles/" + filename;
        user.setProfilePictureUrl(profilePictureUrl);

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public ProfileDTO deleteProfilePicture(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().isEmpty()) {
            deleteOldProfilePicture(user.getProfilePictureUrl());
            user.setProfilePictureUrl(null);
            User updatedUser = userRepository.save(user);
            return convertToDTO(updatedUser);
        }

        return convertToDTO(user);
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getPassword() == null || !passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private void deleteOldProfilePicture(String profilePictureUrl) {
        try {
            if (profilePictureUrl.startsWith("/uploads/profiles/")) {
                String filename = profilePictureUrl.substring("/uploads/profiles/".length());
                Path filePath = Paths.get("uploads/profiles/").resolve(filename);
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            System.err.println("Failed to delete old profile picture: " + e.getMessage());
        }
    }

    private ProfileDTO convertToDTO(User user) {
        return new ProfileDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getProfilePictureUrl(),
            user.getPhoneNumber(),
            user.getYearOfStudy(),
            user.getUniversityId(),
            user.getDepartment(),
            user.getRole(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
