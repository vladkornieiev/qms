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
        var defs = customFieldService.findAllDefinitions(query, page, size, sortBy, order);
        return ResponseEntity.ok(customFieldMapper.toPaginatedDefinitionDTO(defs));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<CustomFieldDefinitionResponse> createCustomFieldDefinition(
            CreateCustomFieldDefinitionRequest request) {
        var def = customFieldService.createDefinition(request);
        return ResponseEntity.status(201).body(customFieldMapper.toDefinitionDTO(def));
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
        var groups = customFieldService.findAllGroups(query, entityType, page, size, sortBy, order);
        return ResponseEntity.ok(customFieldMapper.toPaginatedGroupDTO(groups, customFieldService::getGroupMembers));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<CustomFieldGroupResponse> createCustomFieldGroup(
            CreateCustomFieldGroupRequest request) {
        var group = customFieldService.createGroup(request);
        var members = customFieldService.getGroupMembers(group.getId());
        return ResponseEntity.status(201).body(customFieldMapper.toGroupDTO(group, members));
    }

    @Override
    public ResponseEntity<CustomFieldGroupResponse> getCustomFieldGroup(UUID id) {
        var group = customFieldService.getGroupById(id);
        var members = customFieldService.getGroupMembers(id);
        return ResponseEntity.ok(customFieldMapper.toGroupDTO(group, members));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<CustomFieldGroupResponse> updateCustomFieldGroup(
            UUID id, UpdateCustomFieldGroupRequest request) {
        var group = customFieldService.updateGroup(id, request);
        var members = customFieldService.getGroupMembers(id);
        return ResponseEntity.ok(customFieldMapper.toGroupDTO(group, members));
    }

    @PreAuthorize("hasAnyRole('ROLE_OWNER', 'ROLE_ADMIN', 'ROLE_PLATFORM_ADMIN')")
    @Override
    public ResponseEntity<Void> deleteCustomFieldGroup(UUID id) {
        customFieldService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }
}
