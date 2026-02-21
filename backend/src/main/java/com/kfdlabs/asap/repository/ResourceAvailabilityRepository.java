package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.ResourceAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceAvailabilityRepository extends JpaRepository<ResourceAvailability, UUID> {

    List<ResourceAvailability> findByResourceIdOrderByDateStartAsc(UUID resourceId);

    @Query("SELECT ra FROM ResourceAvailability ra WHERE ra.organization.id = :orgId " +
           "AND ra.dateStart <= :dateEnd AND ra.dateEnd >= :dateStart")
    List<ResourceAvailability> findByOrganizationIdAndDateRange(UUID orgId, LocalDate dateStart, LocalDate dateEnd);
}
