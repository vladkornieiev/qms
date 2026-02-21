package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    Optional<Organization> findBySlug(String slug);

    @Query("""
            SELECT o FROM Organization o
            WHERE (:query = '' OR LOWER(o.name) LIKE LOWER(CONCAT('%', :query, '%'))
                                OR LOWER(o.slug) LIKE LOWER(CONCAT('%', :query, '%')))
            AND (:isActive IS NULL OR o.isActive = :isActive)
            """)
    Page<Organization> findAll(@Param("query") String query,
                               @Param("isActive") Boolean isActive,
                               Pageable pageable);
}
