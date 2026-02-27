package com.lostfound.service;

import com.lostfound.model.Role;
import com.lostfound.model.User;
import com.lostfound.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        logger.info("Loading user by email: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found: {}", email);
                    return new UsernameNotFoundException("User not found: " + email);
                });

        logger.info("User found: {}, role: {}", user.getEmail(), user.getRole());
        
        // Handle case where role might be null - default to USER
        String roleName = "USER";
        if (user.getRole() != null) {
            roleName = user.getRole().name();
        } else {
            logger.warn("User {} has no role, defaulting to USER", email);
        }
        
        logger.info("Creating UserDetails with role: {}", roleName);

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword() != null ? user.getPassword() : "")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + roleName)))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
