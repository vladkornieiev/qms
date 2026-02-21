package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.OrganizationMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, UUID> {

    List<OrganizationMember> findByOrganizationId(UUID organizationId);

    Page<OrganizationMember> findByOrganizationId(UUID organizationId, Pageable pageable);

    Optional<OrganizationMember> findByOrganizationIdAndUserId(UUID organizationId, UUID userId);

    Optional<OrganizationMember> findByOrganizationIdAndUserIdAndIsActiveTrue(UUID organizationId, UUID userId);

    List<OrganizationMember> findByUserId(UUID userId);

    List<OrganizationMember> findByUserIdAndIsActiveTrue(UUID userId);

    long countByUserId(UUID userId);

    long countByUserIdAndIsActiveTrue(UUID userId);
}
