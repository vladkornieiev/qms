package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.TemplatesApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.TemplateMapper;
import com.kfdlabs.asap.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class TemplateController implements TemplatesApi {

    private final TemplateService templateService;
    private final TemplateMapper templateMapper;

    @Override
    public ResponseEntity<PaginatedTemplateResponse> listTemplates(
            String query, String templateType, Integer page, Integer size) {
        return ResponseEntity.ok(templateMapper.toPaginatedDTO(
                templateService.list(query, templateType, page, size)));
    }

    @Override
    public ResponseEntity<TemplateDetailResponse> getTemplateById(UUID id) {
        return ResponseEntity.ok(templateService.getDetail(id));
    }

    @Override
    public ResponseEntity<TemplateResponse> createTemplate(CreateTemplateRequest createTemplateRequest) {
        return ResponseEntity.status(201).body(templateMapper.toDTO(templateService.create(createTemplateRequest)));
    }

    @Override
    public ResponseEntity<TemplateResponse> updateTemplate(UUID id, UpdateTemplateRequest updateTemplateRequest) {
        return ResponseEntity.ok(templateMapper.toDTO(templateService.update(id, updateTemplateRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteTemplate(UUID id) {
        templateService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<TemplateDetailResponse> cloneTemplate(UUID id) {
        return ResponseEntity.status(201).body(templateService.getDetail(templateService.clone(id).getId()));
    }

    @Override
    public ResponseEntity<TemplateApplyResponse> applyTemplate(UUID id, TemplateApplyRequest templateApplyRequest) {
        return ResponseEntity.status(201).body(templateService.apply(id, templateApplyRequest));
    }

    // Template Items

    @Override
    public ResponseEntity<List<TemplateItemResponse>> listTemplateItems(UUID id) {
        return ResponseEntity.ok(templateService.listItems(id).stream()
                .map(templateMapper::toItemDTO).toList());
    }

    @Override
    public ResponseEntity<TemplateItemResponse> createTemplateItem(UUID id, CreateTemplateItemRequest createTemplateItemRequest) {
        return ResponseEntity.status(201).body(templateMapper.toItemDTO(
                templateService.createItem(id, createTemplateItemRequest)));
    }

    @Override
    public ResponseEntity<TemplateItemResponse> updateTemplateItem(UUID id, UUID itemId, UpdateTemplateItemRequest updateTemplateItemRequest) {
        return ResponseEntity.ok(templateMapper.toItemDTO(
                templateService.updateItem(id, itemId, updateTemplateItemRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteTemplateItem(UUID id, UUID itemId) {
        templateService.deleteItem(id, itemId);
        return ResponseEntity.noContent().build();
    }
}
