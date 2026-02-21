package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.ResourcePayout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourcePayoutRepository extends JpaRepository<ResourcePayout, UUID> {

    @Query("SELECT rp FROM ResourcePayout rp WHERE rp.organization.id = :orgId " +
           "AND (:status IS NULL OR rp.status = :status) " +
           "AND (:resourceId IS NULL OR rp.resource.id = :resourceId)")
    Page<ResourcePayout> findAll(UUID orgId, String status, UUID resourceId, Pageable pageable);

    List<ResourcePayout> findByResourceId(UUID resourceId);
}
