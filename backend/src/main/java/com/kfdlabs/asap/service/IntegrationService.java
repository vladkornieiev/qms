package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.CreateIntegrationRequest;
import com.kfdlabs.asap.dto.UpdateIntegrationRequest;
import com.kfdlabs.asap.entity.Integration;
import com.kfdlabs.asap.entity.IntegrationSyncLog;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.repository.IntegrationRepository;
import com.kfdlabs.asap.repository.IntegrationSyncLogRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class IntegrationService {

    private final IntegrationRepository integrationRepository;
    private final IntegrationSyncLogRepository syncLogRepository;
    private final OrganizationRepository organizationRepository;

    public List<Integration> list() {
        return integrationRepository.findAll(SecurityUtils.getCurrentOrganizationId());
    }

    public Integration getById(UUID id) {
        Integration integration = integrationRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Integration not found"));
        if (!integration.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return integration;
    }

    @SuppressWarnings("unchecked")
    public Integration create(CreateIntegrationRequest request) {
        Organization org = organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));

        // Check if provider already connected for this org
        integrationRepository.findByProvider(org.getId(), request.getProvider()).ifPresent(existing -> {
            throw new HttpClientErrorException(HttpStatus.CONFLICT, "Integration with provider '" + request.getProvider() + "' already exists");
        });

        Integration integration = new Integration();
        integration.setOrganization(org);
        integration.setProvider(request.getProvider());
        integration.setStatus("connected");
        integration.setCredentials(request.getCredentials() != null ? (Map<String, Object>) request.getCredentials() : Map.of());
        integration.setSettings(request.getSettings() != null ? (Map<String, Object>) request.getSettings() : Map.of());
        return integrationRepository.save(integration);
    }

    @SuppressWarnings("unchecked")
    public Integration update(UUID id, UpdateIntegrationRequest request) {
        Integration integration = getById(id);
        if (request.getSettings() != null) {
            integration.setSettings((Map<String, Object>) request.getSettings());
        }
        if (request.getCredentials() != null) {
            integration.setCredentials((Map<String, Object>) request.getCredentials());
        }
        return integrationRepository.save(integration);
    }

    public void delete(UUID id) {
        Integration integration = getById(id);
        integration.setStatus("disconnected");
        integrationRepository.save(integration);
    }

    public Integration sync(UUID id) {
        Integration integration = getById(id);
        // Placeholder: actual sync logic would be provider-specific
        integration.setLastSyncedAt(LocalDateTime.now());

        // Log the sync attempt
        IntegrationSyncLog log = new IntegrationSyncLog();
        log.setOrganization(integration.getOrganization());
        log.setIntegration(integration);
        log.setDirection("push");
        log.setEntityType("manual_sync");
        log.setStatus("success");
        syncLogRepository.save(log);

        return integrationRepository.save(integration);
    }

    public Page<IntegrationSyncLog> getSyncLog(UUID integrationId, Integer page, Integer size) {
        // Validate access
        getById(integrationId);
        return syncLogRepository.findByIntegrationId(integrationId, PaginationUtils.getPageable(page, size));
    }
}
