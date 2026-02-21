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
@Table(name = "inbound_requests")
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class InboundRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "submitter_name")
    private String submitterName;

    @Column(name = "submitter_email", length = 320)
    private String submitterEmail;

    @Column(name = "submitter_phone", length = 50)
    private String submitterPhone;

    @Column(name = "submitter_company")
    private String submitterCompany;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @Column(name = "template_id")
    private UUID templateId;

    @Column(name = "form_data", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> formData = Map.of();

    @Column(nullable = false, length = 30)
    private String status = "pending";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "denial_reason", columnDefinition = "TEXT")
    private String denialReason;

    @Column(name = "project_id")
    private UUID projectId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
