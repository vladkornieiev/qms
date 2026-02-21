package com.kfdlabs.asap.service;

import com.kfdlabs.asap.entity.ActivityLog;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.repository.ActivityLogRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
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

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public void log(String entityType, UUID entityId, String action, Map<String, Object> changes, Map<String, Object> metadata) {
        Organization org = organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
        ActivityLog entry = new ActivityLog();
        entry.setOrganization(org);
        entry.setUser(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setAction(action);
        entry.setChanges(changes);
        entry.setMetadata(metadata);
        activityLogRepository.save(entry);
    }

    public Page<ActivityLog> getByEntity(String entityType, UUID entityId, Integer page, Integer size) {
        return activityLogRepository.findByEntity(SecurityUtils.getCurrentOrganizationId(),
                entityType, entityId, PaginationUtils.getPageable(page, size));
    }

    public Page<ActivityLog> getByUser(UUID userId, Integer page, Integer size) {
        return activityLogRepository.findByUser(SecurityUtils.getCurrentOrganizationId(),
                userId, PaginationUtils.getPageable(page, size));
    }
}
