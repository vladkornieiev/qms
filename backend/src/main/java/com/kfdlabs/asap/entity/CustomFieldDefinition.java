package com.kfdlabs.asap.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "custom_field_definitions")
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class CustomFieldDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "field_key", nullable = false, length = 100)
    private String fieldKey;

    @Column(name = "field_label", nullable = false)
    private String fieldLabel;

    @Column(name = "field_type", nullable = false, length = 30)
    private String fieldType;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Object> options;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lookup_list_id")
    private LookupList lookupList;

    @Column(name = "collection_schema", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Object> collectionSchema;

    @Column(name = "min_entries")
    private Integer minEntries;

    @Column(name = "max_entries")
    private Integer maxEntries;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    @Column(name = "default_value")
    private String defaultValue;

    @Column(name = "is_filterable", nullable = false)
    private Boolean isFilterable = false;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(length = 100)
    private String section;

    @Column(name = "show_on_form", nullable = false)
    private Boolean showOnForm = true;

    @Column(name = "show_on_card", nullable = false)
    private Boolean showOnCard = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depends_on_field_id")
    private CustomFieldDefinition dependsOnField;

    @Column(name = "depends_on_value")
    private String dependsOnValue;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
