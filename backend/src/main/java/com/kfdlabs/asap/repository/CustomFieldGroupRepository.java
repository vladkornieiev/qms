package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.CustomFieldGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomFieldGroupRepository extends JpaRepository<CustomFieldGroup, UUID> {

    Optional<CustomFieldGroup> findByOrganizationIdAndName(UUID organizationId, String name);

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
