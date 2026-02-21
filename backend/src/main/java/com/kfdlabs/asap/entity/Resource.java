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
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "resources")
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 30)
    private String type = "contractor";

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(length = 320)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "location_city", length = 100)
    private String locationCity;

    @Column(name = "location_state", length = 100)
    private String locationState;

    @Column(name = "location_country", length = 100)
    private String locationCountry;

    @Column(name = "default_day_rate", precision = 10, scale = 2)
    private BigDecimal defaultDayRate;

    @Column(name = "default_hour_rate", precision = 10, scale = 2)
    private BigDecimal defaultHourRate;

    @Column(length = 3)
    private String currency = "USD";

    @Column(name = "custom_fields", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> customFields = Map.of();

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
