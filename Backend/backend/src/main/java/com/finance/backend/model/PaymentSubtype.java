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

    public PaymentSubtype() {}
    public PaymentSubtype(String paymentSubtypeName, PaymentMethod paymentMethod) {
        this.paymentSubtypeName = paymentSubtypeName;
        this.paymentMethod = paymentMethod;
    }

    public Long getPaymentSubtypeId() { return paymentSubtypeId; }
    public void setPaymentSubtypeId(Long paymentSubtypeId) { this.paymentSubtypeId = paymentSubtypeId; }

    public String getPaymentSubtypeName() { return paymentSubtypeName; }
    public void setPaymentSubtypeName(String paymentSubtypeName) { this.paymentSubtypeName = paymentSubtypeName; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
}