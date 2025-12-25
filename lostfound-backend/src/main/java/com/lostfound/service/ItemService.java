package com.lostfound.service;

import com.lostfound.model.Item;
import com.lostfound.model.Status;
import com.lostfound.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    public Item save(Item item) {
        Item savedItem = itemRepository.save(item);

        // Perform AI-assisted matching for newly created items
        performAiMatching(savedItem);

        return savedItem;
    }

    private void performAiMatching(Item newItem) {
        List<Item> items = itemRepository.findAll();

        for (Item existing : items) {
            if (existing.getId().equals(newItem.getId())) continue;
            if (existing.getStatus().equals(newItem.getStatus())) continue;

            if (!existing.getAiLabels().isEmpty() && !newItem.getAiLabels().isEmpty()) {
                existing.setAiMatched(true);
                newItem.setAiMatched(true);

                existing.setMatchedItemId(newItem.getId());
                newItem.setMatchedItemId(existing.getId());

                itemRepository.save(existing);
                itemRepository.save(newItem);

                System.out.println("🤖 AI MATCH FOUND BETWEEN " +
                        newItem.getId() + " AND " + existing.getId());

                break;
            }
        }
    }

    public Optional<Item> findById(Long id) {
        return itemRepository.findById(id);
    }

    public List<Item> findAll() {
        return itemRepository.findAll();
    }

    public List<Item> findByUserId(Long userId) {
        return itemRepository.findByUserId(userId);
    }

    public void deleteById(Long id) {
        itemRepository.deleteById(id);
    }
}