package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.EntityTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EntityTagRepository extends JpaRepository<EntityTag, UUID> {
    List<EntityTag> findByEntityTypeAndEntityId(String entityType, UUID entityId);
    List<EntityTag> findByOrganizationIdAndEntityTypeAndEntityId(UUID organizationId, String entityType, UUID entityId);
    void deleteByTagIdAndEntityTypeAndEntityId(UUID tagId, String entityType, UUID entityId);
}
