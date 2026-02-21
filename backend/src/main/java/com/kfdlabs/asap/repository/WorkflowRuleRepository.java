package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.WorkflowRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowRuleRepository extends JpaRepository<WorkflowRule, UUID> {

    @Query("SELECT w FROM WorkflowRule w WHERE w.organization.id = :orgId ORDER BY w.executionOrder ASC")
    Page<WorkflowRule> findAll(UUID orgId, Pageable pageable);

    @Query("SELECT w FROM WorkflowRule w WHERE w.organization.id = :orgId AND w.isActive = true AND w.triggerEntity = :triggerEntity AND w.triggerEvent = :triggerEvent ORDER BY w.executionOrder ASC")
    List<WorkflowRule> findActiveByTrigger(UUID orgId, String triggerEntity, String triggerEvent);
}
