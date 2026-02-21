package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ContractRepository extends JpaRepository<Contract, UUID> {

    @Query("SELECT c FROM Contract c WHERE c.status = 'signed' AND c.expiresAt IS NOT NULL AND c.expiresAt BETWEEN :today AND :warningDate")
    List<Contract> findExpiringContracts(LocalDate today, LocalDate warningDate);


    @Query("SELECT c FROM Contract c WHERE c.organization.id = :orgId " +
           "AND (:query IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:contractType IS NULL OR c.contractType = :contractType) " +
           "AND (:clientId IS NULL OR c.client.id = :clientId) " +
           "AND (:projectId IS NULL OR c.project.id = :projectId)")
    Page<Contract> findAll(UUID orgId, String query, String status, String contractType, UUID clientId, UUID projectId, Pageable pageable);
}
