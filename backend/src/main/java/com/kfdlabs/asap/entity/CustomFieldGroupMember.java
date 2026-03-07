package com.kfdlabs.asap.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Data
@Entity
@Table(name = "custom_field_group_members")
@EqualsAndHashCode(of = "id")
public class CustomFieldGroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_field_group_id", nullable = false)
    private CustomFieldGroup customFieldGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_field_id", nullable = false)
    private CustomFieldDefinition customFieldDefinition;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}
