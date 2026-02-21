package com.kfdlabs.asap.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "products")
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Product parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(length = 100)
    private String sku;

    @Column(name = "product_type", nullable = false, length = 30)
    private String productType = "physical";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "price_unit", length = 30)
    private String priceUnit = "each";

    @Column(name = "cost_price", precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "tracking_type", nullable = false, length = 20)
    private String trackingType = "non_tracked";

    @Column(name = "unit_of_measure", length = 30)
    private String unitOfMeasure;

    @Column(name = "reorder_point")
    private Integer reorderPoint;

    @Column(name = "is_rentable", nullable = false)
    private Boolean isRentable = false;

    @Column(name = "is_sellable", nullable = false)
    private Boolean isSellable = true;

    @Column(name = "purchase_price", precision = 12, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "depreciation_method", length = 30)
    private String depreciationMethod;

    @Column(name = "useful_life_months")
    private Integer usefulLifeMonths;

    @Column(name = "custom_fields", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> customFields = Map.of();

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
