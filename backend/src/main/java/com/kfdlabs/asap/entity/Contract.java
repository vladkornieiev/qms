package com.kfdlabs.asap.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "contracts")
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(name = "contract_type", nullable = false, length = 50)
    private String contractType;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "template_content", columnDefinition = "TEXT")
    private String templateContent;

    @Column(name = "generated_file_url", columnDefinition = "TEXT")
    private String generatedFileUrl;

    @Column(nullable = false, length = 30)
    private String status = "draft";

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @Column(name = "signed_file_url", columnDefinition = "TEXT")
    private String signedFileUrl;

    @Column(name = "signing_provider", length = 50)
    private String signingProvider;

    @Column(name = "external_signing_id", length = 255)
    private String externalSigningId;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
