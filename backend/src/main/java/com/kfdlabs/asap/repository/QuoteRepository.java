package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Quote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, UUID> {

    @Query("SELECT q FROM Quote q WHERE q.organization.id = :orgId " +
           "AND (:query IS NULL OR LOWER(q.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(q.quoteNumber) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR q.status = :status) " +
           "AND (:clientId IS NULL OR q.client.id = :clientId) " +
           "AND (:projectId IS NULL OR q.project.id = :projectId)")
    Page<Quote> findAll(UUID orgId, String query, String status, UUID clientId, UUID projectId, Pageable pageable);

    @Query("SELECT MAX(CAST(SUBSTRING(q.quoteNumber, 3) AS int)) FROM Quote q WHERE q.organization.id = :orgId AND q.quoteNumber LIKE 'Q-%'")
    Integer findMaxQuoteNumber(UUID orgId);
}
