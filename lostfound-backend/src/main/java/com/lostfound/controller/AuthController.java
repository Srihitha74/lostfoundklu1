package com.lostfound.controller;

import com.lostfound.dto.ProfileDTO;
import com.lostfound.model.User;
import com.lostfound.repository.UserRepository;
import com.lostfound.service.AuthService;
import com.lostfound.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            String token = authService.register(user);
            return ResponseEntity.ok(Map.of("token", token, "message", "Registration successful"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String token = authService.login(loginRequest.get("email"), loginRequest.get("password"));
            return ResponseEntity.ok(Map.of("token", token, "message", "Login successful"));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if ("EMAIL_NOT_VERIFIED".equals(e.getReason())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "EMAIL_NOT_VERIFIED",
                                     "message", "Please verify your email before logging in."));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> resetRequest) {
        try {
            String email = resetRequest.get("email");
            String newPassword = resetRequest.get("newPassword");
            
            if (email == null || newPassword == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email and new password are required"));
            }
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/firebase-login")
    public ResponseEntity<?> firebaseLogin(@RequestBody Map<String, Object> firebaseRequest) {
        try {
            // Handle emailVerified - could be Boolean or String
            Boolean emailVerified = false;
            Object emailVerifiedObj = firebaseRequest.get("emailVerified");
            if (emailVerifiedObj != null) {
                if (emailVerifiedObj instanceof Boolean) {
                    emailVerified = (Boolean) emailVerifiedObj;
                } else if (emailVerifiedObj instanceof String) {
                    emailVerified = ((String) emailVerifiedObj).equalsIgnoreCase("true");
                }
            }
            
            String token = authService.firebaseLogin(
                    (String) firebaseRequest.get("email"),
                    (String) firebaseRequest.get("uid"),
                    (String) firebaseRequest.get("name"),
                    emailVerified
            );
            return ResponseEntity.ok(Map.of("token", token, "message", "Firebase login successful"));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if ("EMAIL_NOT_VERIFIED".equals(e.getReason())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "EMAIL_NOT_VERIFIED", 
                                     "message", "Please verify your email before logging in."));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/update-fcm-token")
    public ResponseEntity<?> updateFcmToken(@RequestBody Map<String, String> tokenRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            user.setFcmToken(tokenRequest.get("fcmToken"));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "FCM token updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
            }
            String email = authentication.getName();
            ProfileDTO profile = profileService.getProfile(email);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileDTO updates, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
            }
            String email = authentication.getName();
            ProfileDTO updatedProfile = profileService.updateProfile(email, updates);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/profile/upload-picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
            }
            String email = authentication.getName();
            ProfileDTO updatedProfile = profileService.uploadProfilePicture(email, file);
            return ResponseEntity.ok(updatedProfile);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/profile/delete-picture")
    public ResponseEntity<?> deleteProfilePicture(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
            }
            String email = authentication.getName();
            ProfileDTO updatedProfile = profileService.deleteProfilePicture(email);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
