package com.finance.backend.controller;

import com.finance.backend.dto.AuthResponse;
import com.finance.backend.model.User;
import com.finance.backend.repository.UserRepository;
import com.finance.backend.config.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        Optional<User> targetAccount = userRepository.findByUsername(user.getUsername());

        if (targetAccount.isPresent() && passwordEncoder.matches(user.getPassword(), targetAccount.get().getPassword())) {
            String compiledToken = jwtUtils.generateToken(
                    targetAccount.get().getUsername(),
                    targetAccount.get().getId()
            );
            return ResponseEntity.ok(new AuthResponse(compiledToken));
        }

        return ResponseEntity.status(401).body("Error: Invalid username or password!");
    }
}