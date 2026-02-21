package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.Resource;
import com.kfdlabs.asap.entity.ResourceAvailability;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.ResourceAvailabilityRepository;
import com.kfdlabs.asap.repository.ResourceRepository;
import com.kfdlabs.asap.repository.UserRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceAvailabilityRepository availabilityRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public Page<Resource> listResources(String query, String type, Boolean isActive,
                                         Integer page, Integer size, String sortBy, String order) {
        return resourceRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                query, type, isActive, PaginationUtils.getPageable(page, size, order, sortBy));
    }

    public Resource getResource(UUID id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Resource not found"));
        if (!resource.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return resource;
    }

    public Resource createResource(CreateResourceRequest request) {
        Resource resource = new Resource();
        resource.setOrganization(getCurrentOrg());
        resource.setFirstName(request.getFirstName());
        resource.setLastName(request.getLastName());
        if (request.getUserId() != null) resource.setUser(userRepository.findById(request.getUserId()).orElse(null));
        if (request.getType() != null) resource.setType(request.getType());
        if (request.getEmail() != null) resource.setEmail(request.getEmail());
        if (request.getPhone() != null) resource.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) resource.setAvatarUrl(request.getAvatarUrl());
        if (request.getLocationCity() != null) resource.setLocationCity(request.getLocationCity());
        if (request.getLocationState() != null) resource.setLocationState(request.getLocationState());
        if (request.getLocationCountry() != null) resource.setLocationCountry(request.getLocationCountry());
        if (request.getDefaultDayRate() != null) resource.setDefaultDayRate(request.getDefaultDayRate());
        if (request.getDefaultHourRate() != null) resource.setDefaultHourRate(request.getDefaultHourRate());
        if (request.getCurrency() != null) resource.setCurrency(request.getCurrency());
        if (request.getCustomFields() != null) resource.setCustomFields(request.getCustomFields());
        return resourceRepository.save(resource);
    }

    public Resource updateResource(UUID id, UpdateResourceRequest request) {
        Resource resource = getResource(id);
        if (request.getType() != null) resource.setType(request.getType().orElse(resource.getType()));
        if (request.getFirstName() != null) resource.setFirstName(request.getFirstName().orElse(resource.getFirstName()));
        if (request.getLastName() != null) resource.setLastName(request.getLastName().orElse(resource.getLastName()));
        if (request.getEmail() != null) resource.setEmail(request.getEmail().orElse(resource.getEmail()));
        if (request.getPhone() != null) resource.setPhone(request.getPhone().orElse(resource.getPhone()));
        if (request.getAvatarUrl() != null) resource.setAvatarUrl(request.getAvatarUrl().orElse(resource.getAvatarUrl()));
        if (request.getLocationCity() != null) resource.setLocationCity(request.getLocationCity().orElse(resource.getLocationCity()));
        if (request.getLocationState() != null) resource.setLocationState(request.getLocationState().orElse(resource.getLocationState()));
        if (request.getLocationCountry() != null) resource.setLocationCountry(request.getLocationCountry().orElse(resource.getLocationCountry()));
        if (request.getDefaultDayRate() != null) resource.setDefaultDayRate(request.getDefaultDayRate().orElse(resource.getDefaultDayRate()));
        if (request.getDefaultHourRate() != null) resource.setDefaultHourRate(request.getDefaultHourRate().orElse(resource.getDefaultHourRate()));
        if (request.getCurrency() != null) resource.setCurrency(request.getCurrency().orElse(resource.getCurrency()));
        if (request.getIsActive() != null) resource.setIsActive(request.getIsActive().orElse(resource.getIsActive()));
        if (request.getCustomFields() != null) resource.setCustomFields(request.getCustomFields().orElse(resource.getCustomFields()));
        return resourceRepository.save(resource);
    }

    public void deleteResource(UUID id) {
        Resource resource = getResource(id);
        resource.setIsActive(false);
        resourceRepository.save(resource);
    }

    // Availability
    public List<ResourceAvailability> listAvailability(UUID resourceId) {
        getResource(resourceId); // verify access
        return availabilityRepository.findByResourceIdOrderByDateStartAsc(resourceId);
    }

    public ResourceAvailability createAvailability(UUID resourceId, CreateResourceAvailabilityRequest request) {
        Resource resource = getResource(resourceId);
        ResourceAvailability avail = new ResourceAvailability();
        avail.setOrganization(resource.getOrganization());
        avail.setResource(resource);
        avail.setDateStart(request.getDateStart());
        avail.setDateEnd(request.getDateEnd());
        if (request.getStatus() != null) avail.setStatus(request.getStatus());
        if (request.getReason() != null) avail.setReason(request.getReason());
        if (request.getProjectId() != null) avail.setProjectId(request.getProjectId());
        return availabilityRepository.save(avail);
    }

    public ResourceAvailability updateAvailability(UUID resourceId, UUID availId, UpdateResourceAvailabilityRequest request) {
        getResource(resourceId); // verify access
        ResourceAvailability avail = availabilityRepository.findById(availId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Availability not found"));
        if (request.getDateStart() != null) avail.setDateStart(request.getDateStart().orElse(avail.getDateStart()));
        if (request.getDateEnd() != null) avail.setDateEnd(request.getDateEnd().orElse(avail.getDateEnd()));
        if (request.getStatus() != null) avail.setStatus(request.getStatus().orElse(avail.getStatus()));
        if (request.getReason() != null) avail.setReason(request.getReason().orElse(avail.getReason()));
        if (request.getProjectId() != null) avail.setProjectId(request.getProjectId().orElse(avail.getProjectId()));
        return availabilityRepository.save(avail);
    }

    public void deleteAvailability(UUID resourceId, UUID availId) {
        getResource(resourceId); // verify access
        availabilityRepository.deleteById(availId);
    }
}
