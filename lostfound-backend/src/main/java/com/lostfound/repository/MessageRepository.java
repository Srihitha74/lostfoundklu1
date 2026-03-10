package com.lostfound.repository;

import com.lostfound.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Get conversation between two users for a specific item
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.id = :user1 AND m.receiver.id = :user2) OR " +
           "(m.sender.id = :user2 AND m.receiver.id = :user1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("user1") Long user1, @Param("user2") Long user2);

    // Get all messages for a user (sent or received)
    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId ORDER BY m.createdAt DESC")
    List<Message> findAllMessagesForUser(@Param("userId") Long userId);

    // Get unread message count for a user
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.read = false")
    long countUnreadMessages(@Param("userId") Long userId);

    // Get conversation by item and users
    @Query("SELECT m FROM Message m WHERE m.item.id = :itemId AND " +
           "((m.sender.id = :user1 AND m.receiver.id = :user2) OR " +
           "(m.sender.id = :user2 AND m.receiver.id = :user1)) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversationByItem(
        @Param("itemId") Long itemId, 
        @Param("user1") Long user1, 
        @Param("user2") Long user2
    );
}
