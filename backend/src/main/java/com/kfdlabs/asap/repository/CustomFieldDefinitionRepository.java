package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.CustomFieldDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomFieldDefinitionRepository extends JpaRepository<CustomFieldDefinition, UUID> {
    List<CustomFieldDefinition> findByOrganizationIdAndEntityTypeOrderByDisplayOrder(UUID organizationId, String entityType);
}
