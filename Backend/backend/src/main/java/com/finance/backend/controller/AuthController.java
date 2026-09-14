package com.finance.backend.controller;

import com.finance.backend.config.JwtUtils;
import com.finance.backend.dto.AuthResponse;
import com.finance.backend.model.PasswordResetToken;
import com.finance.backend.model.User;
import com.finance.backend.repository.PasswordResetTokenRepository;
import com.finance.backend.repository.UserRepository;
import com.finance.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private PasswordResetTokenRepository tokenRepository;
    @Autowired private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        String username = user.getUsername() != null ? user.getUsername().trim() : "";
        String email = user.getEmail() != null ? user.getEmail().trim().toLowerCase() : "";
        String rawPassword = user.getPassword() != null ? user.getPassword().trim() : "";

        if (username.isEmpty() || email.isEmpty() || rawPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already registered!");
        }

        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.saveAndFlush(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        String identifier = request.get("username") != null ? request.get("username").trim() : "";
        String rawPassword = request.get("password") != null ? request.get("password").trim() : "";

        if (identifier.isEmpty() || rawPassword.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid username or password!");
        }

        // Support login with EITHER username OR registered email
        Optional<User> targetAccount = userRepository.findByUsername(identifier);
        if (targetAccount.isEmpty()) {
            targetAccount = userRepository.findByEmail(identifier.toLowerCase());
        }

        if (targetAccount.isEmpty()) {
            System.out.println("❌ LOGIN FAILED: No account found for [" + identifier + "]");
            return ResponseEntity.status(401).body("Invalid username or password!");
        }

        User existingUser = targetAccount.get();
        boolean passwordMatches = passwordEncoder.matches(rawPassword, existingUser.getPassword());

        System.out.println("🔍 LOGIN ATTEMPT for: " + existingUser.getUsername());
        System.out.println("🔍 Raw Password Received Length: " + rawPassword.length());
        System.out.println("🔍 Password Matches: " + passwordMatches);

        if (passwordMatches) {
            String token = jwtUtils.generateToken(existingUser.getUsername(), existingUser.getId());
            return ResponseEntity.ok(new AuthResponse(token));
        }

        return ResponseEntity.status(401).body("Invalid username or password!");
    }

    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String rawEmail = request.get("email");
        if (rawEmail == null || rawEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email address is required.");
        }

        String email = rawEmail.trim().toLowerCase();
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("No account found with this email address.");
        }

        User user = userOptional.get();

        // Remove existing reset tokens for this user
        tokenRepository.deleteByUser(user);
        tokenRepository.flush();

        // Generate 6-digit numeric verification OTP
        SecureRandom random = new SecureRandom();
        String resetToken = String.format("%06d", random.nextInt(1000000));

        PasswordResetToken myToken = new PasswordResetToken(resetToken, user, 15);
        tokenRepository.saveAndFlush(myToken);

        try {
            emailService.sendResetPasswordEmail(user.getEmail(), resetToken);
            System.out.println("✅ Reset code [" + resetToken + "] sent to " + user.getEmail());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to dispatch email. Please verify SMTP credentials.");
        }

        return ResponseEntity.ok(Map.of(
                "message", "A 6-digit verification code has been dispatched to your email address."
        ));
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token") != null ? request.get("token").trim() : "";
        String newPassword = request.get("newPassword") != null ? request.get("newPassword").trim() : "";

        if (token.isEmpty() || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("Token and new password are required.");
        }

        Optional<PasswordResetToken> resetTokenOpt = tokenRepository.findByToken(token);
        if (resetTokenOpt.isEmpty() || resetTokenOpt.get().isExpired()) {
            return ResponseEntity.badRequest().body("Invalid or expired verification code.");
        }

        // Fetch user directly by ID from repository to prevent detached entity update issues
        Long userId = resetTokenOpt.get().getUser().getId();
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("Associated user no longer exists.");
        }

        // Encode new password and flush to PostgreSQL
        String newEncodedHash = passwordEncoder.encode(newPassword);
        user.setPassword(newEncodedHash);
        userRepository.saveAndFlush(user);

        // Delete used token and commit
        tokenRepository.deleteByUser(user);
        tokenRepository.flush();

        System.out.println("✅ Password successfully updated in database for user: " + user.getUsername());

        return ResponseEntity.ok("Password reset successfully. You can now login with your new password.");
    }
}