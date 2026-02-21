package com.kfdlabs.asap.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "template_items")
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class TemplateItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private Template template;

    @Column(name = "item_type", nullable = false, length = 30)
    private String itemType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 255)
    private String label;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "default_quantity", precision = 10, scale = 2)
    private BigDecimal defaultQuantity;

    @Column(name = "default_unit_price", precision = 12, scale = 2)
    private BigDecimal defaultUnitPrice;

    @Column(name = "default_unit", length = 30)
    private String defaultUnit;

    @Column(name = "field_type", length = 30)
    private String fieldType;

    @Column(name = "field_options", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> fieldOptions;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depends_on_item_id")
    private TemplateItem dependsOnItem;

    @Column(name = "depends_on_value", columnDefinition = "TEXT")
    private String dependsOnValue;

    @Column(length = 100)
    private String section;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
