package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    @Query("SELECT r FROM Resource r WHERE r.organization.id = :orgId " +
           "AND (:query IS NULL OR LOWER(r.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:type IS NULL OR r.type = :type) " +
           "AND (:isActive IS NULL OR r.isActive = :isActive)")
    Page<Resource> findAll(UUID orgId, String query, String type, Boolean isActive, Pageable pageable);
}
