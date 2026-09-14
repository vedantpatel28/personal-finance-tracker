package com.finance.backend.repository;

import com.finance.backend.model.PaymentSubtype;
import com.finance.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentSubtypeRepository extends JpaRepository<PaymentSubtype, Long> {
    List<PaymentSubtype> findByUser(User user);
}