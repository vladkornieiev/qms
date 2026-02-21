package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.TagGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TagGroupRepository extends JpaRepository<TagGroup, UUID> {
    List<TagGroup> findByOrganizationId(UUID organizationId);
    Optional<TagGroup> findByOrganizationIdAndName(UUID organizationId, String name);
}
