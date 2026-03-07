package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.CustomFieldsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.CustomFieldMapper;
import com.kfdlabs.asap.service.CustomFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class CustomFieldController implements CustomFieldsApi {

    private final CustomFieldService customFieldService;
    private final CustomFieldMapper customFieldMapper;

    // ---- Definitions ----

    @Override
    public ResponseEntity<PaginatedCustomFieldDefinitionResponse> listCustomFieldDefinitions(
            String query, Integer page, Integer size, String sortBy, String order) {
        return ResponseEntity.ok(customFieldMapper.toPaginatedDefinitionDTO(
                customFieldService.findAllDefinitions(query, page, size, sortBy, order)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<CustomFieldDefinitionResponse> createCustomFieldDefinition(
            CreateCustomFieldDefinitionRequest request) {
        return ResponseEntity.status(201).body(customFieldMapper.toDefinitionDTO(
                customFieldService.createDefinition(request)));
    }

    @Override
    public ResponseEntity<CustomFieldDefinitionResponse> getCustomFieldDefinition(UUID id) {
        return ResponseEntity.ok(customFieldMapper.toDefinitionDTO(customFieldService.getDefinitionById(id)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<CustomFieldDefinitionResponse> updateCustomFieldDefinition(
            UUID id, UpdateCustomFieldDefinitionRequest request) {
        return ResponseEntity.ok(customFieldMapper.toDefinitionDTO(customFieldService.updateDefinition(id, request)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<Void> deleteCustomFieldDefinition(UUID id) {
        customFieldService.deleteDefinition(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Groups ----

    @Override
    public ResponseEntity<PaginatedCustomFieldGroupResponse> listCustomFieldGroups(
            String query, String entityType, Integer page, Integer size, String sortBy, String order) {
        return ResponseEntity.ok(customFieldMapper.toPaginatedGroupDTO(
                customFieldService.findAllGroups(query, entityType, page, size, sortBy, order)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<CustomFieldGroupResponse> createCustomFieldGroup(
            CreateCustomFieldGroupRequest request) {
        return ResponseEntity.status(201).body(customFieldMapper.toGroupDTO(
                customFieldService.createGroup(request)));
    }

    @Override
    public ResponseEntity<CustomFieldGroupResponse> getCustomFieldGroup(UUID id) {
        return ResponseEntity.ok(customFieldMapper.toGroupDTO(customFieldService.getGroupById(id)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<CustomFieldGroupResponse> updateCustomFieldGroup(
            UUID id, UpdateCustomFieldGroupRequest request) {
        return ResponseEntity.ok(customFieldMapper.toGroupDTO(customFieldService.updateGroup(id, request)));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<Void> deleteCustomFieldGroup(UUID id) {
        customFieldService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }
}
