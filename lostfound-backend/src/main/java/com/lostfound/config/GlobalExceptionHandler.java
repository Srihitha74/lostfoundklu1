package com.lostfound.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.orm.jpa.JpaSystemException;
import org.hibernate.LazyInitializationException;

import jakarta.persistence.EntityNotFoundException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(LazyInitializationException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<Map<String, String>> handleLazyInitialization(LazyInitializationException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Failed to load related data: " + ex.getMessage());
        error.put("message", "Please try again or contact support if the problem persists");
        System.err.println("LazyInitializationException: " + ex.getMessage());
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(JpaSystemException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<Map<String, String>> handleJpaSystem(JpaSystemException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Database error: " + ex.getMessage());
        error.put("message", "Please try again or contact support if the problem persists");
        System.err.println("JpaSystemException: " + ex.getMessage());
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
    public ResponseEntity<Map<String, String>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "File too large");
        error.put("message", "Maximum file size is 5MB");
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Bad request: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Internal server error: " + ex.getMessage());
        error.put("message", "An unexpected error occurred");
        System.err.println("Unhandled exception: " + ex.getMessage());
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
