package com.lostfound.service;

import com.lostfound.model.Message;
import com.lostfound.model.User;
import com.lostfound.model.Item;
import com.lostfound.repository.MessageRepository;
import com.lostfound.repository.UserRepository;
import com.lostfound.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    // Send a message
    @Transactional
    public Message sendMessage(Long senderId, Long receiverId, Long itemId, String content) {
        Optional<User> sender = userRepository.findById(senderId);
        Optional<User> receiver = userRepository.findById(receiverId);
        
        // Handle itemId - could be null or invalid
        Optional<Item> item = Optional.empty();
        if (itemId != null && itemId > 0) {
            item = itemRepository.findById(itemId);
        }

        if (sender.isEmpty() || receiver.isEmpty()) {
            throw new RuntimeException("Sender or receiver not found");
        }

        Message message = new Message();
        message.setSender(sender.get());
        message.setReceiver(receiver.get());
        if (item.isPresent()) {
            message.setItem(item.get());
        }
        message.setContent(content);

        return messageRepository.save(message);
    }

    // Get conversation between two users for an item (or any conversation if itemId is 0/null)
    public List<Message> getConversation(Long user1Id, Long user2Id, Long itemId) {
        if (itemId == null || itemId == 0) {
            // Get all messages between these users regardless of item
            return messageRepository.findConversation(user1Id, user2Id);
        }
        return messageRepository.findConversationByItem(itemId, user1Id, user2Id);
    }

    // Get all messages for a user
    public List<Message> getAllMessagesForUser(Long userId) {
        return messageRepository.findAllMessagesForUser(userId);
    }

    // Get unread message count
    public long getUnreadCount(Long userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    // Mark messages as read
    @Transactional
    public void markAsRead(Long messageId) {
        Optional<Message> message = messageRepository.findById(messageId);
        if (message.isPresent()) {
            message.get().setRead(true);
            messageRepository.save(message.get());
        }
    }

    // Mark all messages from a sender as read
    @Transactional
    public void markConversationAsRead(Long userId, Long otherUserId) {
        List<Message> messages = messageRepository.findConversation(userId, otherUserId);
        for (Message message : messages) {
            if (!message.isRead() && message.getReceiver().getId().equals(userId)) {
                message.setRead(true);
                messageRepository.save(message);
            }
        }
    }
}
