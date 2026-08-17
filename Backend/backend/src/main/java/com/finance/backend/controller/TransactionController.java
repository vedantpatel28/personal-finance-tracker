package com.finance.backend.controller;

import com.finance.backend.model.Transaction;
import com.finance.backend.model.User;
import com.finance.backend.repository.TransactionRepository;
import com.finance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Transaction> getAllUserTransactions() {
        String authenticatedUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("🔍 [FETCH TRANSACTIONS] User Context: " + authenticatedUsername);

        Optional<User> currentUser = userRepository.findByUsername(authenticatedUsername);

        if (currentUser.isPresent()) {
            List<Transaction> userTransactions = transactionRepository.findByUserId(currentUser.get().getId());
            System.out.println("📊 Found " + userTransactions.size() + " transactions for User ID #" + currentUser.get().getId());
            return userTransactions;
        }

        return Collections.emptyList();
    }

    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        String authenticatedUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new RuntimeException("Authenticated user context not found in database records."));

        transaction.setUser(currentUser);
        System.out.println("💾 [SAVE TRANSACTION] Saved item for User ID #" + currentUser.getId());
        return transactionRepository.save(transaction);
    }
}