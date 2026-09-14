package com.finance.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "payment_methods")
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_method_id")
    private Long paymentMethodId;

    @Column(name = "payment_method_name", nullable = false, unique = true)
    private String paymentMethodName;

    @OneToMany(mappedBy = "paymentMethod", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<PaymentSubtype> subtypes;

    public PaymentMethod() {}
    public PaymentMethod(String paymentMethodName) { this.paymentMethodName = paymentMethodName; }

    public Long getPaymentMethodId() { return paymentMethodId; }
    public void setPaymentMethodId(Long paymentMethodId) { this.paymentMethodId = paymentMethodId; }

    public String getPaymentMethodName() { return paymentMethodName; }
    public void setPaymentMethodName(String paymentMethodName) { this.paymentMethodName = paymentMethodName; }

    public List<PaymentSubtype> getSubtypes() { return subtypes; }
    public void setSubtypes(List<PaymentSubtype> subtypes) { this.subtypes = subtypes; }
}