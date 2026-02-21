package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    @Query("SELECT i FROM Invoice i WHERE i.organization.id = :orgId " +
           "AND (:query IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:clientId IS NULL OR i.client.id = :clientId) " +
           "AND (:projectId IS NULL OR i.project.id = :projectId)")
    Page<Invoice> findAll(UUID orgId, String query, String status, UUID clientId, UUID projectId, Pageable pageable);

    @Query("SELECT MAX(CAST(SUBSTRING(i.invoiceNumber, 5) AS int)) FROM Invoice i WHERE i.organization.id = :orgId AND i.invoiceNumber LIKE 'INV-%'")
    Integer findMaxInvoiceNumber(UUID orgId);
}
