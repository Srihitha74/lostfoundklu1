package com.lostfound.controller;

import com.lostfound.model.User;
import com.lostfound.repository.UserRepository;
import com.lostfound.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        String token = authService.register(user);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String token = authService.login(
                loginRequest.get("email"),
                loginRequest.get("password")
        );
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/firebase-login")
    public ResponseEntity<?> firebaseLogin(@RequestBody Map<String, String> firebaseRequest) {
        // Google Technology: Firebase Authentication integration
        String token = authService.firebaseLogin(
                firebaseRequest.get("email"),
                firebaseRequest.get("uid"),
                firebaseRequest.get("name")
        );
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/update-fcm-token")
    public ResponseEntity<?> updateFcmToken(@RequestBody Map<String, String> tokenRequest) {
        // Google Technology: Firebase Cloud Messaging token storage
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        user.setFcmToken(tokenRequest.get("fcmToken"));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "FCM token updated"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of("name", user.getName(), "email", user.getEmail(), "role", user.getRole().name()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();
        User user = userRepository.findByEmail(currentEmail).orElseThrow(() -> new RuntimeException("User not found"));
        String newName = updateRequest.get("name");
        String newEmail = updateRequest.get("email");
        if (newName != null && !newName.trim().isEmpty()) {
            user.setName(newName.trim());
        }
        if (newEmail != null && !newEmail.trim().isEmpty()) {
            Optional<User> existing = userRepository.findByEmail(newEmail.trim());
            if (existing.isPresent() && !existing.get().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
            }
            user.setEmail(newEmail.trim());
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("name", user.getName(), "email", user.getEmail(), "role", user.getRole().name()));
    }
}
