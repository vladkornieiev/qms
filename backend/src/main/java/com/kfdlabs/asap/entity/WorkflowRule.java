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
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "workflow_rules")
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class WorkflowRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "trigger_entity", nullable = false, length = 50)
    private String triggerEntity;

    @Column(name = "trigger_event", nullable = false, length = 50)
    private String triggerEvent;

    @Column(name = "trigger_conditions", columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> triggerConditions;

    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Map<String, Object>> actions;

    @Column(name = "execution_order", nullable = false)
    private Integer executionOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
