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

        // Perform keyword-based matching for newly created items
        performAiMatching(savedItem);

        return savedItem;
    }

    private void performAiMatching(Item newItem) {
        List<Item> items = itemRepository.findAll();

        for (Item existing : items) {
            if (existing.getId().equals(newItem.getId())) continue;
            if (existing.getStatus().equals(newItem.getStatus())) continue;

            // Check keyword similarity in title and description
            boolean keywordMatch = hasKeywordMatch(newItem, existing);

            // Check if categories match or have common AI labels
            boolean categoryMatch = existing.getCategory() != null && newItem.getCategory() != null &&
                                   existing.getCategory().equalsIgnoreCase(newItem.getCategory());

            boolean labelMatch = hasCommonLabels(existing.getAiLabels(), newItem.getAiLabels());

            if (keywordMatch || (categoryMatch && labelMatch && !existing.getAiLabels().isEmpty() && !newItem.getAiLabels().isEmpty())) {
                existing.setAiMatched(true);
                newItem.setAiMatched(true);

                existing.setMatchedItemId(newItem.getId());
                newItem.setMatchedItemId(existing.getId());

                itemRepository.save(existing);
                itemRepository.save(newItem);

                System.out.println("🤖 MATCH FOUND BETWEEN " +
                        newItem.getId() + " (" + newItem.getTitle() + ") AND " + existing.getId() + " (" + existing.getTitle() + ")");

                break;
            }
        }
    }

    private boolean hasKeywordMatch(Item item1, Item item2) {
        String text1 = (item1.getTitle() + " " + item1.getDescription()).toLowerCase();
        String text2 = (item2.getTitle() + " " + item2.getDescription()).toLowerCase();

        // Common keywords to check
        String[] keywords = {"iphone", "samsung", "wallet", "keys", "bag", "laptop", "watch", "phone", "charger", "headphones", "earbuds", "airpods"};

        for (String keyword : keywords) {
            if (text1.contains(keyword) && text2.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    private boolean hasCommonLabels(List<String> labels1, List<String> labels2) {
        if (labels1 == null || labels2 == null) return false;
        return labels1.stream().anyMatch(label -> labels2.contains(label));
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