package com.lostfound.repository;

import com.lostfound.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByUserId(Long userId);
    
    @Query("SELECT i FROM Item i LEFT JOIN FETCH i.user LEFT JOIN FETCH i.images")
    List<Item> findAllWithUser();
    
    @Query("SELECT i FROM Item i LEFT JOIN FETCH i.user LEFT JOIN FETCH i.images WHERE i.user.id = :userId")
    List<Item> findByUserIdWithUser(@Param("userId") Long userId);
    
    @Query("SELECT i FROM Item i LEFT JOIN FETCH i.user LEFT JOIN FETCH i.images WHERE i.id = :id")
    Optional<Item> findByIdWithUser(@Param("id") Long id);
}