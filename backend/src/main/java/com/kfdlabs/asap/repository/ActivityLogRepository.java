package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {

    @Query("SELECT a FROM ActivityLog a WHERE a.organization.id = :orgId AND a.entityType = :entityType AND a.entityId = :entityId ORDER BY a.createdAt DESC")
    Page<ActivityLog> findByEntity(UUID orgId, String entityType, UUID entityId, Pageable pageable);

    @Query("SELECT a FROM ActivityLog a WHERE a.organization.id = :orgId AND a.user.id = :userId ORDER BY a.createdAt DESC")
    Page<ActivityLog> findByUser(UUID orgId, UUID userId, Pageable pageable);
}
