package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    @Query(value = """
            SELECT t FROM Tag t
            WHERE t.organizationId = :orgId
            AND (:query = '' OR LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')))
            """,
            countQuery = """
            SELECT COUNT(t) FROM Tag t
            WHERE t.organizationId = :orgId
            AND (:query = '' OR LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    Page<Tag> findAll(@Param("orgId") UUID orgId,
                      @Param("query") String query,
                      Pageable pageable);

    Optional<Tag> findByOrganizationIdAndName(UUID organizationId, String name);
}
