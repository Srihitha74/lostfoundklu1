package com.lostfound.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id")
    @JsonIgnoreProperties({"password", "firebaseUid", "emailVerified", "profilePictureUrl",
        "phoneNumber", "yearOfStudy", "universityId", "department", "createdAt", "updatedAt",
        "roles", "authorities", "hibernateLazyInitializer", "handler"})
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id")
    @JsonIgnoreProperties({"password", "firebaseUid", "emailVerified", "profilePictureUrl",
        "phoneNumber", "yearOfStudy", "universityId", "department", "createdAt", "updatedAt",
        "roles", "authorities", "hibernateLazyInitializer", "handler"})
    private User receiver;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id")
    @JsonIgnoreProperties({"user", "images", "hibernateLazyInitializer", "handler"})
    private Item item;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Column(name = "`read`")
    private boolean read = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }

    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
}

// package com.lostfound.model;

// import jakarta.persistence.*;
// import java.time.LocalDateTime;
// import com.fasterxml.jackson.annotation.JsonFormat;

// @Entity
// @Table(name = "messages")
// public class Message {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @ManyToOne
//     @JoinColumn(name = "sender_id")
//     private User sender;

//     @ManyToOne
//     @JoinColumn(name = "receiver_id")
//     private User receiver;

//     @ManyToOne
//     @JoinColumn(name = "item_id")
//     private Item item;

//     @Column(columnDefinition = "TEXT")
//     private String content;

//     @Column(name = "created_at")
//     @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
//     private LocalDateTime createdAt;

//     @Column(name = "`read`")
//     private boolean read = false;

//     @PrePersist
//     protected void onCreate() {
//         createdAt = LocalDateTime.now();
//     }

//     // Getters and Setters
//     public Long getId() {
//         return id;
//     }

//     public void setId(Long id) {
//         this.id = id;
//     }

//     public User getSender() {
//         return sender;
//     }

//     public void setSender(User sender) {
//         this.sender = sender;
//     }

//     public User getReceiver() {
//         return receiver;
//     }

//     public void setReceiver(User receiver) {
//         this.receiver = receiver;
//     }

//     public Item getItem() {
//         return item;
//     }

//     public void setItem(Item item) {
//         this.item = item;
//     }

//     public String getContent() {
//         return content;
//     }

//     public void setContent(String content) {
//         this.content = content;
//     }

//     public LocalDateTime getCreatedAt() {
//         return createdAt;
//     }

//     public void setCreatedAt(LocalDateTime createdAt) {
//         this.createdAt = createdAt;
//     }

//     public boolean isRead() {
//         return read;
//     }

//     public void setRead(boolean read) {
//         this.read = read;
//     }
// }
// // package com.lostfound.model;

// // import jakarta.persistence.*;
// // import java.time.LocalDateTime;
// // import com.fasterxml.jackson.annotation.JsonFormat;
// // import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
// // import com.lostfound.dto.ProfileDTO;

// // @Entity
// // @Table(name = "messages")
// // public class Message {

// //     @Id
// //     @GeneratedValue(strategy = GenerationType.IDENTITY)
// //     private Long id;

// //     @ManyToOne(fetch = FetchType.EAGER)
// //     @JoinColumn(name = "sender_id")
// //     @JsonIgnoreProperties({"password", "firebaseUid", "emailVerified", "profilePictureUrl",
// //         "phoneNumber", "yearOfStudy", "universityId", "department", "createdAt", "updatedAt",
// //         "roles", "authorities", "hibernateLazyInitializer", "handler"})
// //     private User sender;

// //     @ManyToOne(fetch = FetchType.EAGER)
// //     @JoinColumn(name = "receiver_id")
// //     @JsonIgnoreProperties({"password", "firebaseUid", "emailVerified", "profilePictureUrl",
// //         "phoneNumber", "yearOfStudy", "universityId", "department", "createdAt", "updatedAt",
// //         "roles", "authorities", "hibernateLazyInitializer", "handler"})
// //     private User receiver;

// //     @ManyToOne(fetch = FetchType.EAGER)
// //     @JoinColumn(name = "item_id")
// //     @JsonIgnoreProperties({"user", "images", "hibernateLazyInitializer", "handler"})
// //     private Item item;

// //     @Column(columnDefinition = "TEXT")
// //     private String content;

// //     @Column(name = "created_at")
// //     @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
// //     private LocalDateTime createdAt;

// //     @Column(name = "`read`")
// //     private boolean read = false;

// //     @PrePersist
// //     protected void onCreate() {
// //         createdAt = LocalDateTime.now();
// //     }

// //     public Long getId() { return id; }
// //     public void setId(Long id) { this.id = id; }

// //     public User getSender() { return sender; }
// //     public void setSender(User sender) { this.sender = sender; }

// //     public User getReceiver() { return receiver; }
// //     public void setReceiver(User receiver) { this.receiver = receiver; }

// //     public Item getItem() { return item; }
// //     public void setItem(Item item) { this.item = item; }

// //     public String getContent() { return content; }
// //     public void setContent(String content) { this.content = content; }

// //     public LocalDateTime getCreatedAt() { return createdAt; }
// //     public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

// //     public boolean isRead() { return read; }
// //     public void setRead(boolean read) { this.read = read; }
// // }