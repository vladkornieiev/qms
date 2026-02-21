package com.kfdlabs.asap.service;

import com.kfdlabs.asap.entity.CommunicationLog;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.repository.CommunicationLogRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.UserRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CommunicationLogService {

    private final CommunicationLogRepository communicationLogRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public List<CommunicationLog> getByEntity(String entityType, UUID entityId) {
        return communicationLogRepository.findByEntity(SecurityUtils.getCurrentOrganizationId(), entityType, entityId);
    }

    public CommunicationLog logCommunication(String entityType, UUID entityId, String channel,
                                              String direction, String recipientName,
                                              String recipientEmail, String subject, String bodyPreview,
                                              String status) {
        Organization org = organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
        CommunicationLog entry = new CommunicationLog();
        entry.setOrganization(org);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setChannel(channel);
        entry.setDirection(direction != null ? direction : "outbound");
        entry.setRecipientName(recipientName);
        entry.setRecipientEmail(recipientEmail);
        entry.setSubject(subject);
        entry.setBodyPreview(bodyPreview);
        entry.setStatus(status != null ? status : "sent");
        entry.setSentBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        entry.setSentAt(LocalDateTime.now());
        return communicationLogRepository.save(entry);
    }
}
