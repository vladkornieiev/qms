package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.ProjectDateRange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectDateRangeRepository extends JpaRepository<ProjectDateRange, UUID> {

    List<ProjectDateRange> findByProjectIdOrderByDisplayOrderAsc(UUID projectId);

    @Query("SELECT dr FROM ProjectDateRange dr WHERE dr.organization.id = :orgId " +
           "AND dr.dateStart <= :end AND dr.dateEnd >= :start ORDER BY dr.dateStart ASC")
    List<ProjectDateRange> findByDateRange(UUID orgId, LocalDate start, LocalDate end);
}
