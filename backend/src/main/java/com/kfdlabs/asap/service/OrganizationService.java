package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.AvailableOrganizationResponse;
import com.kfdlabs.asap.dto.AvailableOrganizationsResponse;
import com.kfdlabs.asap.dto.CreateOrganizationRequest;
import com.kfdlabs.asap.dto.UpdateOrganizationRequest;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.OrganizationMember;
import com.kfdlabs.asap.mapper.OrganizationMapper;
import com.kfdlabs.asap.repository.OrganizationMemberRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.openapitools.jackson.nullable.JsonNullable.undefined;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationMapper organizationMapper;

    public Organization createOrganization(CreateOrganizationRequest request) {
        if (organizationRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.organization.slug.conflict");
        }

        Organization org = new Organization();
        org.setName(request.getName());
        org.setSlug(request.getSlug());
        org.setIsActive(true);
        org.setSettings(Map.of());
        org.setBillingInfo(Map.of());

        return organizationRepository.save(org);
    }

    public Organization getOrganizationById(UUID id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "error.organization.not.found"));
    }

    public Organization updateOrganization(UUID id, UpdateOrganizationRequest request) {
        Organization org = getOrganizationById(id);

        if (request.getName() != null && !request.getName().equals(undefined())) {
            org.setName(request.getName().orElse(""));
        }
        if (request.getSlug() != null && !request.getSlug().equals(undefined())) {
            String slug = request.getSlug().orElse("");
            organizationRepository.findBySlug(slug)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new HttpClientErrorException(HttpStatus.CONFLICT, "error.organization.slug.conflict");
                    });
            org.setSlug(slug);
        }
        if (request.getIsActive() != null && !request.getIsActive().equals(undefined())) {
            org.setIsActive(request.getIsActive().orElse(true));
        }

        return organizationRepository.save(org);
    }

    public void deleteOrganization(UUID id) {
        organizationRepository.deleteById(id);
    }

    public Page<Organization> findAllOrganizations(String query, Boolean isActive,
                                                    Integer page, Integer size, String sortBy, String order) {
        return organizationRepository.findAll(
                query == null ? "" : query,
                isActive,
                PaginationUtils.getPageable(page, size, order, sortBy));
    }

    public AvailableOrganizationsResponse findAvailableOrganizations(String email) {
        // Find all orgs where user has an active membership
        AvailableOrganizationsResponse response = new AvailableOrganizationsResponse();
        // We query through OrganizationMember
        // This is a simplified implementation
        return response;
    }

    public Page<Organization> findAvailableOrganizationsForUser(UUID userId, String name,
                                                                  Integer page, Integer size, String sortBy, String order) {
        // Get org IDs where user is a member
        List<OrganizationMember> memberships = organizationMemberRepository.findByUserIdAndIsActiveTrue(userId);
        List<UUID> orgIds = memberships.stream().map(m -> m.getOrganization().getId()).toList();

        Pageable pageable = PaginationUtils.getPageable(page, size, order, sortBy);
        return organizationRepository.findAllById(orgIds).stream()
                .filter(org -> org.getIsActive())
                .filter(org -> name == null || name.isEmpty() || org.getName().toLowerCase().contains(name.toLowerCase()))
                .collect(java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toList(),
                        list -> new org.springframework.data.domain.PageImpl<>(list, pageable, list.size())
                ));
    }
}
