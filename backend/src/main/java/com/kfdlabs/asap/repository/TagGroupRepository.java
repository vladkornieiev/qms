package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.TagGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagGroupRepository extends JpaRepository<TagGroup, UUID> {

    Optional<TagGroup> findByOrganizationIdAndName(UUID organizationId, String name);

    @Query("""
            SELECT tg FROM TagGroup tg
            WHERE tg.organizationId = :orgId
            AND (:query = '' OR LOWER(tg.name) LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    Page<TagGroup> findAll(@Param("orgId") UUID orgId,
                           @Param("query") String query,
                           Pageable pageable);
}
