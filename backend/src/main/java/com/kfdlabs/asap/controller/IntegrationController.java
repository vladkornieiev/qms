package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.IntegrationsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.IntegrationMapper;
import com.kfdlabs.asap.service.IntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class IntegrationController implements IntegrationsApi {

    private final IntegrationService integrationService;
    private final IntegrationMapper integrationMapper;

    @Override
    public ResponseEntity<List<IntegrationResponse>> listIntegrations() {
        return ResponseEntity.ok(integrationService.list().stream().map(integrationMapper::toDTO).toList());
    }

    @Override
    public ResponseEntity<IntegrationResponse> getIntegration(UUID id) {
        return ResponseEntity.ok(integrationMapper.toDTO(integrationService.getById(id)));
    }

    @Override
    public ResponseEntity<IntegrationResponse> createIntegration(CreateIntegrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(integrationMapper.toDTO(integrationService.create(request)));
    }

    @Override
    public ResponseEntity<IntegrationResponse> updateIntegration(UUID id, UpdateIntegrationRequest request) {
        return ResponseEntity.ok(integrationMapper.toDTO(integrationService.update(id, request)));
    }

    @Override
    public ResponseEntity<Void> deleteIntegration(UUID id) {
        integrationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<IntegrationResponse> syncIntegration(UUID id) {
        return ResponseEntity.ok(integrationMapper.toDTO(integrationService.sync(id)));
    }

    @Override
    public ResponseEntity<PaginatedSyncLogResponse> getIntegrationSyncLog(UUID id, Integer page, Integer size) {
        return ResponseEntity.ok(integrationMapper.toPaginatedSyncLogDTO(integrationService.getSyncLog(id, page, size)));
    }
}
