package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.CustomFieldGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomFieldGroupRepository extends JpaRepository<CustomFieldGroup, UUID> {

    Optional<CustomFieldGroup> findByOrganizationIdAndName(UUID organizationId, String name);

    @Query(value = "SELECT CAST(ecfg.custom_field_group_id AS VARCHAR), COUNT(*) FROM entity_custom_field_groups ecfg WHERE ecfg.custom_field_group_id IN :groupIds GROUP BY ecfg.custom_field_group_id", nativeQuery = true)
    List<Object[]> countEntityAssignmentsByGroupIds(@Param("groupIds") List<UUID> groupIds);

    @Query("""
            SELECT cfg FROM CustomFieldGroup cfg
            WHERE cfg.organizationId = :orgId
            AND (:query = '' OR LOWER(cfg.name) LIKE LOWER(CONCAT('%', :query, '%')))
            AND (:entityType = '' OR cfg.entityType = :entityType)
            """)
    Page<CustomFieldGroup> findAll(@Param("orgId") UUID orgId,
                                   @Param("query") String query,
                                   @Param("entityType") String entityType,
                                   Pageable pageable);
}
