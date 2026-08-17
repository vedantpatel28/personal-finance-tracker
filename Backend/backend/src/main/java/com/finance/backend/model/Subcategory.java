package com.finance.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "subcategories")
public class Subcategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subcategory_id")
    private Long subcategoryId;

    @Column(name = "subcategory_name", nullable = false)
    private String subcategoryName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnore
    private Category category;

    public Subcategory() {}
    public Subcategory(String subcategoryName, Category category) {
        this.subcategoryName = subcategoryName;
        this.category = category;
    }

    public Long getSubcategoryId() { return subcategoryId; }
    public void setSubcategoryId(Long subcategoryId) { this.subcategoryId = subcategoryId; }

    public String getSubcategoryName() { return subcategoryName; }
    public void setSubcategoryName(String subcategoryName) { this.subcategoryName = subcategoryName; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
}