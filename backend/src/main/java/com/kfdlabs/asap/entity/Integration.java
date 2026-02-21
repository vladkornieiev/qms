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
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "integrations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "provider"})
})
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class Integration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(nullable = false, length = 30)
    private String status = "connected";

    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> credentials;

    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> settings;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
