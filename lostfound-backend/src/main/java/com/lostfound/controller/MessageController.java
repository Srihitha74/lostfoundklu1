package com.lostfound.controller;

import com.lostfound.model.Message;
import com.lostfound.model.User;
import com.lostfound.repository.UserRepository;
import com.lostfound.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
// CORS handled globally by SecurityConfig via cors.allowed-origins property
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserRepository userRepository;

    // Send a message
    @PostMapping
    public ResponseEntity<?> sendMessage(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User sender = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Long receiverId = null;
            Long itemId = null;
            String content = null;

            Object receiverIdObj = request.get("receiverId");
            Object itemIdObj     = request.get("itemId");
            Object contentObj    = request.get("content");

            if (receiverIdObj instanceof Number)
                receiverId = ((Number) receiverIdObj).longValue();
            else if (receiverIdObj instanceof String)
                receiverId = Long.parseLong((String) receiverIdObj);

            if (itemIdObj instanceof Number)
                itemId = ((Number) itemIdObj).longValue();
            else if (itemIdObj instanceof String)
                itemId = Long.parseLong((String) itemIdObj);

            if (contentObj instanceof String)
                content = (String) contentObj;

            if (receiverId == null)
                return ResponseEntity.badRequest().body(Map.of("error", "receiverId is required"));

            if (content == null || content.trim().isEmpty())
                return ResponseEntity.badRequest().body(Map.of("error", "content is required"));

            Message message = messageService.sendMessage(
                    sender.getId(),
                    receiverId,
                    itemId,
                    content.trim()
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Message sent successfully",
                    "data", message
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    // Get conversation between current user and another user
    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(
            @RequestParam Long otherUserId,
            @RequestParam(required = false, defaultValue = "0") Long itemId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Message> messages = messageService.getConversation(
                    currentUser.getId(),
                    otherUserId,
                    itemId
            );

            messageService.markConversationAsRead(currentUser.getId(), otherUserId);

            return ResponseEntity.ok(messages);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    // Get all messages for current user
    @GetMapping("/all")
    public ResponseEntity<?> getAllMessages(Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Message> messages = messageService.getAllMessagesForUser(currentUser.getId());
            return ResponseEntity.ok(messages);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    // Get unread message count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            long count = messageService.getUnreadCount(currentUser.getId());
            return ResponseEntity.ok(Map.of("count", count));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    // Mark a specific message as read
    @PutMapping("/{messageId}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long messageId,
            Authentication authentication) {
        try {
            messageService.markAsRead(messageId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}