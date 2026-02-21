package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByOrganizationIdOrderByDisplayOrder(UUID organizationId);
    List<Category> findByOrganizationIdAndParentIdOrderByDisplayOrder(UUID organizationId, UUID parentId);
    List<Category> findByOrganizationIdAndParentIsNullOrderByDisplayOrder(UUID organizationId);
    List<Category> findByOrganizationIdAndType(UUID organizationId, String type);
}
