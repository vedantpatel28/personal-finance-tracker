package com.finance.backend.controller;

import com.finance.backend.repository.CategoryRepository;
import com.finance.backend.repository.PaymentMethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/metadata")
@CrossOrigin(origins = "http://localhost:5173")
public class MetadataController {

    @Autowired private CategoryRepository categoryRepository;
    @Autowired private PaymentMethodRepository paymentMethodRepository;

    @GetMapping
    public Map<String, Object> getMetadata() {
        Map<String, Object> response = new HashMap<>();
        response.put("categories", categoryRepository.findAll());
        response.put("paymentMethods", paymentMethodRepository.findAll());
        return response;
    }
}