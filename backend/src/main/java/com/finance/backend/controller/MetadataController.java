package com.finance.backend.controller;

import com.finance.backend.model.PaymentMethod;
import com.finance.backend.model.PaymentSubtype;
import com.finance.backend.model.User;
import com.finance.backend.repository.CategoryRepository;
import com.finance.backend.repository.PaymentMethodRepository;
import com.finance.backend.repository.PaymentSubtypeRepository;
import com.finance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/metadata")
@CrossOrigin(origins = "*")
public class MetadataController {

    @Autowired private CategoryRepository categoryRepository;
    @Autowired private PaymentMethodRepository paymentMethodRepository;
    @Autowired private PaymentSubtypeRepository paymentSubtypeRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public Map<String, Object> getMetadata() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("categories", categoryRepository.findAll());
        response.put("paymentMethods", paymentMethodRepository.findAll());

        if (currentUser != null) {
            response.put("userPaymentSubtypes", paymentSubtypeRepository.findByUser(currentUser));
        }

        return response;
    }

    @PostMapping("/custom-account")
    public ResponseEntity<?> addCustomAccount(@RequestBody Map<String, String> request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        if (currentUser == null) return ResponseEntity.status(401).body("Unauthorized");

        Long paymentMethodId = Long.parseLong(request.get("paymentMethodId"));
        String accountName = request.get("accountName");

        PaymentMethod method = paymentMethodRepository.findById(paymentMethodId).orElse(null);
        if (method == null) return ResponseEntity.badRequest().body("Invalid Payment Method");

        PaymentSubtype newSubtype = new PaymentSubtype(accountName, method, currentUser);
        PaymentSubtype saved = paymentSubtypeRepository.save(newSubtype);

        return ResponseEntity.ok(saved);
    }
}