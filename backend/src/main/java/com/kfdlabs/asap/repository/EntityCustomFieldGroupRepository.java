package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.EntityCustomFieldGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EntityCustomFieldGroupRepository extends JpaRepository<EntityCustomFieldGroup, UUID> {

    List<EntityCustomFieldGroup> findByEntityTypeAndEntityId(String entityType, UUID entityId);

    List<EntityCustomFieldGroup> findByEntityTypeAndEntityIdIn(String entityType, List<UUID> entityIds);

    void deleteByEntityTypeAndEntityId(String entityType, UUID entityId);
}
