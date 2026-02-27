// package com.lostfound.service;

// import com.lostfound.model.User;
// import com.lostfound.model.Role;
// import com.lostfound.repository.UserRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import java.util.Optional;
// import org.springframework.http.HttpStatus;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;
// import org.springframework.web.server.ResponseStatusException;

// @Service
// public class AuthService {

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private JwtUtils jwtUtils;

//     @Autowired
//     private AuthenticationManager authenticationManager;

//     @Autowired
//     private PasswordEncoder passwordEncoder;

//     // ✅ REGISTER
//     public String register(User user) {

//         if (userRepository.existsByEmail(user.getEmail())) {
//             // 🔥 Proper HTTP response instead of crashing
//             throw new ResponseStatusException(
//                     HttpStatus.CONFLICT,
//                     "Email already exists"
//             );
//         }

//         user.setRole(Role.USER);

//         // 🔥 CRITICAL: Always encode password
//         user.setPassword(passwordEncoder.encode(user.getPassword()));

//         userRepository.save(user);

//         // 🔐 Generate JWT after successful register
//         return jwtUtils.generateToken(user.getEmail());
//     }

//     // ✅ LOGIN
//     public String login(String email, String password) {

//         Authentication authentication = authenticationManager.authenticate(
//                 new UsernamePasswordAuthenticationToken(email, password)
//         );

//         SecurityContextHolder.getContext().setAuthentication(authentication);

//         // 🔐 Generate JWT after successful login
//         return jwtUtils.generateToken(email);
//     }

//     // ✅ FIREBASE LOGIN
//     // Google Technology: Firebase Authentication integration
//     public String firebaseLogin(String email, String firebaseUid, String name) {
//         // Check if user exists by Firebase UID
//         Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);

//         User user;
//         if (existingUser.isPresent()) {
//             user = existingUser.get();
//             // Update email if changed
//             if (!user.getEmail().equals(email)) {
//                 user.setEmail(email);
//                 userRepository.save(user);
//             }
//         } else {
//             // Check if email already exists (legacy users)
//             Optional<User> emailUser = userRepository.findByEmail(email);
//             if (emailUser.isPresent()) {
//                 // Link existing user with Firebase UID
//                 user = emailUser.get();
//                 user.setFirebaseUid(firebaseUid);
//                 userRepository.save(user);
//             } else {
//                 // Create new user
//                 user = new User();
//                 user.setEmail(email);
//                 user.setFirebaseUid(firebaseUid);
//                 user.setName(name != null ? name : email.split("@")[0]); // Default name from email
//                 user.setRole(Role.USER);
//                 userRepository.save(user);
//             }
//         }

//         // 🔐 Generate JWT after successful Firebase authentication
//         return jwtUtils.generateToken(user.getEmail());
//     }
// }
package com.lostfound.service;

import com.lostfound.model.User;
import com.lostfound.model.Role;
import com.lostfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ REGISTER — saves to MySQL, Firebase handles email verification separately
    public String register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        user.setRole(Role.USER);
        user.setEmailVerified(false); // not verified yet
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        // Don't return JWT yet — user must verify email first
        // Return a placeholder so frontend knows registration succeeded
        return "PENDING_VERIFICATION";
    }

    // ✅ LOGIN — only works if email is verified
    public String login(String email, String password) {
        // Check if user exists and email is verified
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtUtils.generateToken(email);
    }

    // ✅ FIREBASE LOGIN — called after Firebase email verification is confirmed
    public String firebaseLogin(String email, String firebaseUid, String name, Boolean emailVerified) {
        Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);

        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            if (!user.getEmail().equals(email)) {
                user.setEmail(email);
            }
        } else {
            Optional<User> emailUser = userRepository.findByEmail(email);
            if (emailUser.isPresent()) {
                user = emailUser.get();
                user.setFirebaseUid(firebaseUid);
            } else {
                user = new User();
                user.setEmail(email);
                user.setFirebaseUid(firebaseUid);
                user.setName(name != null ? name : email.split("@")[0]);
                user.setRole(Role.USER);
            }
        }

        // ✅ Mark email as verified when Firebase confirms it
        // Also auto-verify if user has firebaseUid (they came through Firebase)
        if (Boolean.TRUE.equals(emailVerified) || 
            (emailVerified != null && emailVerified.toString().equalsIgnoreCase("true")) ||
            (user.getFirebaseUid() != null && !user.getFirebaseUid().isEmpty())) {
            user.setEmailVerified(true);
        }

        userRepository.save(user);

        // Only issue JWT if email is verified
        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED");
        }

        return jwtUtils.generateToken(user.getEmail());
    }
}