package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.CustomFieldsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.CustomFieldDefinitionMapper;
import com.kfdlabs.asap.service.CustomFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class CustomFieldController implements CustomFieldsApi {

    private final CustomFieldService customFieldService;
    private final CustomFieldDefinitionMapper mapper;

    @Override
    public ResponseEntity<List<CustomFieldDefinitionResponse>> listCustomFieldDefinitions(String entityType) {
        return ResponseEntity.ok(customFieldService.listDefinitions(entityType).stream()
                .map(mapper::toDTO).toList());
    }

    @Override
    public ResponseEntity<CustomFieldDefinitionResponse> createCustomFieldDefinition(
            String entityType, CreateCustomFieldDefinitionRequest request) {
        return ResponseEntity.status(201).body(mapper.toDTO(customFieldService.createDefinition(entityType, request)));
    }

    @Override
    public ResponseEntity<CustomFieldDefinitionResponse> updateCustomFieldDefinition(
            String entityType, UUID id, UpdateCustomFieldDefinitionRequest request) {
        return ResponseEntity.ok(mapper.toDTO(customFieldService.updateDefinition(id, request)));
    }

    @Override
    public ResponseEntity<Void> deleteCustomFieldDefinition(String entityType, UUID id) {
        customFieldService.deleteDefinition(id);
        return ResponseEntity.noContent().build();
    }
}
