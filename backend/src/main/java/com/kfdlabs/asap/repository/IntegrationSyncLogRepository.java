package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.IntegrationSyncLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface IntegrationSyncLogRepository extends JpaRepository<IntegrationSyncLog, UUID> {

    @Query("SELECT s FROM IntegrationSyncLog s WHERE s.integration.id = :integrationId ORDER BY s.createdAt DESC")
    Page<IntegrationSyncLog> findByIntegrationId(UUID integrationId, Pageable pageable);
}
