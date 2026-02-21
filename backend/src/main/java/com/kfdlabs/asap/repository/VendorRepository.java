package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID> {

    @Query("SELECT v FROM Vendor v WHERE v.organization.id = :orgId " +
           "AND (:query IS NULL OR LOWER(v.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(v.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:type IS NULL OR v.type = :type) " +
           "AND (:isActive IS NULL OR v.isActive = :isActive)")
    Page<Vendor> findAll(UUID orgId, String query, String type, Boolean isActive, Pageable pageable);
}
