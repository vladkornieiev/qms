package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.ActivityApi;
import com.kfdlabs.asap.dto.PaginatedActivityLogResponse;
import com.kfdlabs.asap.mapper.ActivityMapper;
import com.kfdlabs.asap.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ActivityController implements ActivityApi {

    private final ActivityLogService activityLogService;
    private final ActivityMapper activityMapper;

    @Override
    public ResponseEntity<PaginatedActivityLogResponse> getActivityForEntity(
            String entityType, UUID entityId, Integer page, Integer size) {
        return ResponseEntity.ok(activityMapper.toPaginatedActivityDTO(
                activityLogService.getByEntity(entityType, entityId, page, size)));
    }

    @Override
    public ResponseEntity<PaginatedActivityLogResponse> getActivityByUser(UUID userId, Integer page, Integer size) {
        return ResponseEntity.ok(activityMapper.toPaginatedActivityDTO(
                activityLogService.getByUser(userId, page, size)));
    }
}
