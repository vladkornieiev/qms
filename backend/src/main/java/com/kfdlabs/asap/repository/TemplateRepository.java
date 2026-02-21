package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Template;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TemplateRepository extends JpaRepository<Template, UUID> {

    @Query("SELECT t FROM Template t WHERE t.organization.id = :orgId " +
           "AND (:query IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:templateType IS NULL OR t.templateType = :templateType)")
    Page<Template> findAll(UUID orgId, String query, String templateType, Pageable pageable);
}
