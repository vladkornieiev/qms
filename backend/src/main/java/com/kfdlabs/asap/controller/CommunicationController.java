package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.CommunicationsApi;
import com.kfdlabs.asap.dto.CommunicationLogResponse;
import com.kfdlabs.asap.mapper.ActivityMapper;
import com.kfdlabs.asap.service.CommunicationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class CommunicationController implements CommunicationsApi {

    private final CommunicationLogService communicationLogService;
    private final ActivityMapper activityMapper;

    @Override
    public ResponseEntity<List<CommunicationLogResponse>> getCommunicationsForEntity(String entityType, UUID entityId) {
        return ResponseEntity.ok(communicationLogService.getByEntity(entityType, entityId).stream()
                .map(activityMapper::toCommunicationDTO).toList());
    }
}
