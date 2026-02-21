package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.EntityCollectionEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EntityCollectionEntryRepository extends JpaRepository<EntityCollectionEntry, UUID> {
    List<EntityCollectionEntry> findByEntityTypeAndEntityIdOrderByDisplayOrder(String entityType, UUID entityId);
    List<EntityCollectionEntry> findByFieldDefinitionIdAndEntityTypeAndEntityId(UUID fieldDefinitionId, String entityType, UUID entityId);
    void deleteByFieldDefinitionIdAndEntityTypeAndEntityId(UUID fieldDefinitionId, String entityType, UUID entityId);
}
