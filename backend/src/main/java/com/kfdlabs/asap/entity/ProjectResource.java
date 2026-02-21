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
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "project_resources")
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class ProjectResource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(length = 100)
    private String role;

    @Column(name = "bill_rate", precision = 10, scale = 2)
    private BigDecimal billRate;

    @Column(name = "pay_rate", precision = 10, scale = 2)
    private BigDecimal payRate;

    @Column(name = "rate_unit", length = 20)
    private String rateUnit = "day";

    @Column(name = "per_diem", precision = 10, scale = 2)
    private BigDecimal perDiem;

    @Column(name = "date_range_ids", columnDefinition = "uuid[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<UUID> dateRangeIds;

    @Column(nullable = false, length = 30)
    private String status = "pending";

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
