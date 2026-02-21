package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.ResourcesApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.ResourceMapper;
import com.kfdlabs.asap.service.ResourcePayoutService;
import com.kfdlabs.asap.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ResourceController implements ResourcesApi {

    private final ResourceService resourceService;
    private final ResourcePayoutService payoutService;
    private final ResourceMapper resourceMapper;

    @Override
    public ResponseEntity<PaginatedResourceResponse> listResources(
            String query, String type, Boolean isActive,
            Integer page, Integer size, String sortBy, String order) {
        return ResponseEntity.ok(resourceMapper.toPaginatedDTO(
                resourceService.listResources(query, type, isActive, page, size, sortBy, order)));
    }

    @Override
    public ResponseEntity<ResourceResponse> getResourceById(UUID id) {
        return ResponseEntity.ok(resourceMapper.toDTO(resourceService.getResource(id)));
    }

    @Override
    public ResponseEntity<ResourceResponse> createResource(CreateResourceRequest createResourceRequest) {
        return ResponseEntity.status(201).body(resourceMapper.toDTO(resourceService.createResource(createResourceRequest)));
    }

    @Override
    public ResponseEntity<ResourceResponse> updateResource(UUID id, UpdateResourceRequest updateResourceRequest) {
        return ResponseEntity.ok(resourceMapper.toDTO(resourceService.updateResource(id, updateResourceRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteResource(UUID id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<ResourceAvailabilityResponse>> listResourceAvailability(UUID id) {
        return ResponseEntity.ok(resourceService.listAvailability(id).stream()
                .map(resourceMapper::toAvailabilityDTO).toList());
    }

    @Override
    public ResponseEntity<ResourceAvailabilityResponse> createResourceAvailability(UUID id, CreateResourceAvailabilityRequest createResourceAvailabilityRequest) {
        return ResponseEntity.status(201).body(resourceMapper.toAvailabilityDTO(
                resourceService.createAvailability(id, createResourceAvailabilityRequest)));
    }

    @Override
    public ResponseEntity<ResourceAvailabilityResponse> updateResourceAvailability(UUID id, UUID availId, UpdateResourceAvailabilityRequest updateResourceAvailabilityRequest) {
        return ResponseEntity.ok(resourceMapper.toAvailabilityDTO(
                resourceService.updateAvailability(id, availId, updateResourceAvailabilityRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteResourceAvailability(UUID id, UUID availId) {
        resourceService.deleteAvailability(id, availId);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<ResourcePayoutResponse>> listResourcePayouts(UUID id) {
        return ResponseEntity.ok(payoutService.listByResource(id).stream()
                .map(resourceMapper::toPayoutDTO).toList());
    }
}
