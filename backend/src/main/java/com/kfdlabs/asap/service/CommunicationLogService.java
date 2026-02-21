package com.kfdlabs.asap.service;

import com.kfdlabs.asap.entity.CommunicationLog;
import com.kfdlabs.asap.repository.CommunicationLogRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CommunicationLogService {

    private final CommunicationLogRepository communicationLogRepository;

    public List<CommunicationLog> getByEntity(String entityType, UUID entityId) {
        return communicationLogRepository.findByEntity(SecurityUtils.getCurrentOrganizationId(), entityType, entityId);
    }
}
