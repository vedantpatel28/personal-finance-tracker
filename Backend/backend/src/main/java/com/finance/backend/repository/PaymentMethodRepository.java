package com.finance.backend.repository;
import com.finance.backend.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {

}