package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.CustomFieldValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomFieldValueRepository extends JpaRepository<CustomFieldValue, UUID> {

    @Query("SELECT cfv FROM CustomFieldValue cfv JOIN FETCH cfv.customFieldDefinition WHERE cfv.entityId = :entityId")
    List<CustomFieldValue> findByEntityId(@Param("entityId") UUID entityId);

    @Query("SELECT cfv FROM CustomFieldValue cfv JOIN FETCH cfv.customFieldDefinition WHERE cfv.entityId IN :entityIds")
    List<CustomFieldValue> findByEntityIdIn(@Param("entityIds") List<UUID> entityIds);

    Optional<CustomFieldValue> findByCustomFieldDefinitionIdAndEntityId(UUID fieldId, UUID entityId);

    void deleteByEntityId(UUID entityId);

    @Query("SELECT DISTINCT cfv.customFieldDefinition.id FROM CustomFieldValue cfv WHERE cfv.organizationId = :orgId")
    List<UUID> findDistinctFieldIdsInUse(@Param("orgId") UUID orgId);
}
