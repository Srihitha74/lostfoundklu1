package com.lostfound.config;

import com.lostfound.service.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/register") || 
               path.startsWith("/api/auth/login") || 
               path.startsWith("/api/auth/firebase-login") ||
               path.startsWith("/api/auth/reset-password") ||
               path.startsWith("/uploads/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();
        logger.info("Processing request: {} {}", request.getMethod(), path);

        String jwt = getJwtFromRequest(request);

        if (jwt != null) {
            logger.info("JWT token present, validating...");
            try {
                boolean isValid = jwtUtils.validateJwtToken(jwt);
                logger.info("JWT validation result: {}", isValid);
                
                if (isValid) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    logger.info("Username from JWT: {}", username);
                    
                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        logger.info("User loaded: {}, authorities: {}", username, userDetails.getAuthorities());
                        
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.info("Authentication SET for user: {}", username);
                    } catch (UsernameNotFoundException e) {
                        logger.error("User NOT FOUND in database: {}", username, e);
                    }
                } else {
                    logger.warn("JWT token is INVALID");
                }
            } catch (Exception e) {
                logger.error("Exception during JWT processing: {} - {}", e.getClass().getName(), e.getMessage(), e);
            }
        } else {
            logger.warn("No JWT token in request for path: {}", path);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            logger.info("Extracted token (first 20 chars): {}", token.substring(0, Math.min(20, token.length())));
            return token;
        }
        return null;
    }
}
