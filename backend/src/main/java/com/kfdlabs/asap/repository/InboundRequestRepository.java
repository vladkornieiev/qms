package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.InboundRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InboundRequestRepository extends JpaRepository<InboundRequest, UUID> {

    @Query("SELECT r FROM InboundRequest r WHERE r.organization.id = :orgId " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:query IS NULL OR LOWER(r.submitterName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.submitterEmail) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.submitterCompany) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<InboundRequest> findAll(UUID orgId, String query, String status, Pageable pageable);
}
