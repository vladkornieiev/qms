package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    @Query("SELECT p FROM Product p WHERE p.organization.id = :orgId " +
           "AND (:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:productType IS NULL OR p.productType = :productType) " +
           "AND (:trackingType IS NULL OR p.trackingType = :trackingType) " +
           "AND (:isActive IS NULL OR p.isActive = :isActive)")
    Page<Product> findAll(UUID orgId, String query, String productType, String trackingType, Boolean isActive, Pageable pageable);

    List<Product> findByOrganizationIdAndParentId(UUID orgId, UUID parentId);

    List<Product> findByOrganizationIdAndParentIsNull(UUID orgId);
}
