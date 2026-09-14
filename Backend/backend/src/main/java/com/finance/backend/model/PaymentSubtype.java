package com.finance.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "payment_subtypes")
public class PaymentSubtype {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_subtype_id")
    private Long paymentSubtypeId;

    @Column(name = "payment_subtype_name", nullable = false)
    private String paymentSubtypeName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id", nullable = false)
    @JsonIgnore
    private PaymentMethod paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    public PaymentSubtype() {}

    public PaymentSubtype(String paymentSubtypeName, PaymentMethod paymentMethod, User user) {
        this.paymentSubtypeName = paymentSubtypeName;
        this.paymentMethod = paymentMethod;
        this.user = user;
    }

    public Long getPaymentSubtypeId() { return paymentSubtypeId; }
    public void setPaymentSubtypeId(Long paymentSubtypeId) { this.paymentSubtypeId = paymentSubtypeId; }

    public String getPaymentSubtypeName() { return paymentSubtypeName; }
    public void setPaymentSubtypeName(String paymentSubtypeName) { this.paymentSubtypeName = paymentSubtypeName; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}