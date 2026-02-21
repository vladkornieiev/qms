package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @Query("SELECT p FROM Project p WHERE p.organization.id = :orgId " +
           "AND (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.projectNumber) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:clientId IS NULL OR p.client.id = :clientId)")
    Page<Project> findAll(UUID orgId, String query, String status, UUID clientId, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.organization.id = :orgId")
    long countByOrganizationId(UUID orgId);
}
