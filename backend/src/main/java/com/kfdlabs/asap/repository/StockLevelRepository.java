package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.StockLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockLevelRepository extends JpaRepository<StockLevel, UUID> {

    List<StockLevel> findByOrganizationIdAndProductId(UUID orgId, UUID productId);

    Optional<StockLevel> findByProductIdAndLocation(UUID productId, String location);

    @Query("SELECT sl FROM StockLevel sl JOIN FETCH sl.product p JOIN FETCH sl.organization WHERE p.reorderPoint IS NOT NULL AND p.isActive = true AND sl.quantityOnHand <= p.reorderPoint")
    List<StockLevel> findBelowReorderPoint();
}
