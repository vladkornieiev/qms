package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.CommunicationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommunicationLogRepository extends JpaRepository<CommunicationLog, UUID> {

    @Query("SELECT c FROM CommunicationLog c WHERE c.organization.id = :orgId AND c.entityType = :entityType AND c.entityId = :entityId ORDER BY c.createdAt DESC")
    List<CommunicationLog> findByEntity(UUID orgId, String entityType, UUID entityId);
}
