package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.LookupList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LookupListRepository extends JpaRepository<LookupList, UUID> {
    List<LookupList> findByOrganizationId(UUID organizationId);
    Optional<LookupList> findByOrganizationIdAndSlug(UUID organizationId, String slug);
    List<LookupList> findByOrganizationIdAndIsActiveTrue(UUID organizationId);
}
