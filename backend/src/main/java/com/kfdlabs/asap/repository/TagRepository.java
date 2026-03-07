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
            LEFT JOIN FETCH t.tagGroup
            WHERE t.organizationId = :orgId
            AND (:query = '' OR LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')))
            AND (:tagGroupId IS NULL OR t.tagGroup.id = :tagGroupId)
            """,
            countQuery = """
            SELECT COUNT(t) FROM Tag t
            WHERE t.organizationId = :orgId
            AND (:query = '' OR LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')))
            AND (:tagGroupId IS NULL OR t.tagGroup.id = :tagGroupId)
            """)
    Page<Tag> findAll(@Param("orgId") UUID orgId,
                      @Param("query") String query,
                      @Param("tagGroupId") UUID tagGroupId,
                      Pageable pageable);

    @Query("""
            SELECT t FROM Tag t
            WHERE t.organizationId = :orgId
            AND t.name = :name
            AND ((:tagGroupId IS NULL AND t.tagGroup IS NULL) OR t.tagGroup.id = :tagGroupId)
            """)
    Optional<Tag> findByOrgAndNameAndGroup(@Param("orgId") UUID orgId,
                                           @Param("name") String name,
                                           @Param("tagGroupId") UUID tagGroupId);
}
