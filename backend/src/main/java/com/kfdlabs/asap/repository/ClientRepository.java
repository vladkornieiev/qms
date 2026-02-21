package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {

    @Query("SELECT c FROM Client c WHERE c.organization.id = :orgId " +
           "AND (:query IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:type IS NULL OR c.type = :type) " +
           "AND (:isActive IS NULL OR c.isActive = :isActive)")
    Page<Client> findAll(UUID orgId, String query, String type, Boolean isActive, Pageable pageable);
}
