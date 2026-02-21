package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {
    List<Tag> findByOrganizationId(UUID organizationId);
    List<Tag> findByOrganizationIdAndTagGroupId(UUID organizationId, UUID tagGroupId);
    List<Tag> findByOrganizationIdAndNameContainingIgnoreCase(UUID organizationId, String name);
}
