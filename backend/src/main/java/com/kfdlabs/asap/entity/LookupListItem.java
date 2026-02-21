package com.kfdlabs.asap.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "lookup_list_items")
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class LookupListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lookup_list_id", nullable = false)
    private LookupList lookupList;

    @Column(nullable = false)
    private String value;

    @Column(nullable = false)
    private String label;

    @Column(length = 7)
    private String color;

    @Column(length = 50)
    private String icon;

    @Column(nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata = Map.of();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private LookupListItem parent;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
