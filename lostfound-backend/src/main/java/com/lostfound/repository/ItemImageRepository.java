package com.lostfound.repository;

import com.lostfound.model.ItemImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemImageRepository extends JpaRepository<ItemImage, Long> {

    /**
     * Find all images for a specific item
     */
    List<ItemImage> findByItemIdOrderByUploadOrderAsc(Long itemId);

    /**
     * Find the primary image for an item
     */
    ItemImage findByItemIdAndIsPrimaryTrue(Long itemId);

    /**
     * Delete all images for a specific item
     */
    void deleteByItemId(Long itemId);

    /**
     * Count images for an item
     */
    long countByItemId(Long itemId);
}
