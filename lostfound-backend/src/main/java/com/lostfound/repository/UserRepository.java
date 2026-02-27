package com.lostfound.repository;

import com.lostfound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByFirebaseUid(String firebaseUid);

    Optional<User> findByUniversityId(String universityId);

    boolean existsByEmail(String email);

    boolean existsByUniversityId(String universityId);
}
