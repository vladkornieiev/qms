package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, UUID> {

    @Query("SELECT t FROM InventoryTransaction t WHERE t.organization.id = :orgId " +
           "AND (:inventoryItemId IS NULL OR t.inventoryItem.id = :inventoryItemId) " +
           "AND (:productId IS NULL OR t.product.id = :productId) " +
           "AND (:projectId IS NULL OR t.projectId = :projectId) " +
           "ORDER BY t.createdAt DESC")
    Page<InventoryTransaction> findAll(UUID orgId, UUID inventoryItemId, UUID productId, UUID projectId, Pageable pageable);
}
