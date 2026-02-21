package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.ProjectProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectProductRepository extends JpaRepository<ProjectProduct, UUID> {

    List<ProjectProduct> findByProjectId(UUID projectId);
}
