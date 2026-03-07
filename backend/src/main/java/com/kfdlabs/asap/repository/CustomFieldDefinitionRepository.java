package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.CustomFieldDefinition;
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
public interface CustomFieldDefinitionRepository extends JpaRepository<CustomFieldDefinition, UUID> {

    Optional<CustomFieldDefinition> findByOrganizationIdAndFieldKey(UUID organizationId, String fieldKey);

    @Query(value = "SELECT CAST(cfv.custom_field_id AS VARCHAR), COUNT(*) FROM custom_field_values cfv WHERE cfv.custom_field_id IN :fieldIds GROUP BY cfv.custom_field_id", nativeQuery = true)
    List<Object[]> countValuesByFieldIds(@Param("fieldIds") List<UUID> fieldIds);

    @Query("""
            SELECT cfd FROM CustomFieldDefinition cfd
            WHERE cfd.organizationId = :orgId
            AND (:query = '' OR LOWER(cfd.fieldLabel) LIKE LOWER(CONCAT('%', :query, '%'))
                              OR LOWER(cfd.fieldKey) LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    Page<CustomFieldDefinition> findAll(@Param("orgId") UUID orgId,
                                        @Param("query") String query,
                                        Pageable pageable);
}
