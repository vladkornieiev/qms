package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {

    @Query("SELECT i FROM InventoryItem i WHERE i.organization.id = :orgId " +
           "AND (:query IS NULL OR (LOWER(i.serialNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(i.barcode) LIKE LOWER(CONCAT('%', :query, '%')))) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:productId IS NULL OR i.product.id = :productId)")
    Page<InventoryItem> findAll(UUID orgId, String query, String status, UUID productId, Pageable pageable);

    List<InventoryItem> findByOrganizationIdAndProductId(UUID orgId, UUID productId);
}
