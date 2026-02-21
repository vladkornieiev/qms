package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Contract;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.event.EntityEvent;
import com.kfdlabs.asap.mapper.ContractMapper;
import com.kfdlabs.asap.repository.*;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ContractService {

    private final ContractRepository contractRepository;
    private final OrganizationRepository organizationRepository;
    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final ResourceRepository resourceRepository;
    private final VendorRepository vendorRepository;
    private final ContractMapper contractMapper;
    private final StatusTransitionValidator statusValidator;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailService emailService;
    private final CommunicationLogService communicationLogService;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public Page<Contract> list(String query, String status, String contractType, UUID clientId, UUID projectId, Integer page, Integer size) {
        return contractRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                query, status, contractType, clientId, projectId, PaginationUtils.getPageable(page, size));
    }

    public Contract get(UUID id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Contract not found"));
        if (!contract.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return contract;
    }

    public Contract create(CreateContractRequest request) {
        Organization org = getCurrentOrg();
        Contract contract = new Contract();
        contract.setOrganization(org);
        contract.setContractType(request.getContractType());
        contract.setTitle(request.getTitle());
        if (request.getProjectId() != null) contract.setProject(projectRepository.findById(request.getProjectId()).orElse(null));
        if (request.getClientId() != null) contract.setClient(clientRepository.findById(request.getClientId()).orElse(null));
        if (request.getResourceId() != null) contract.setResource(resourceRepository.findById(request.getResourceId()).orElse(null));
        if (request.getVendorId() != null) contract.setVendor(vendorRepository.findById(request.getVendorId()).orElse(null));
        if (request.getTemplateContent() != null) contract.setTemplateContent(request.getTemplateContent());
        if (request.getExpiresAt() != null) contract.setExpiresAt(request.getExpiresAt());
        if (request.getNotes() != null) contract.setNotes(request.getNotes());
        Contract saved = contractRepository.save(contract);
        eventPublisher.publishEvent(new EntityEvent(
                this, "contract", "created", saved.getId(),
                saved.getOrganization().getId(), null, null, saved));
        return saved;
    }

    public Contract update(UUID id, UpdateContractRequest request) {
        Contract contract = get(id);
        if (request.getStatus() != null) {
            String newStatus = request.getStatus().orElse(contract.getStatus());
            statusValidator.validateContractTransition(contract.getStatus(), newStatus);
            contract.setStatus(newStatus);
        }
        if (request.getTitle() != null) contract.setTitle(request.getTitle().orElse(contract.getTitle()));
        if (request.getTemplateContent() != null) contract.setTemplateContent(request.getTemplateContent().orElse(contract.getTemplateContent()));
        if (request.getContractType() != null) contract.setContractType(request.getContractType().orElse(contract.getContractType()));
        if (request.getExpiresAt() != null) contract.setExpiresAt(request.getExpiresAt().orElse(contract.getExpiresAt()));
        if (request.getNotes() != null) contract.setNotes(request.getNotes().orElse(contract.getNotes()));
        if (request.getGeneratedFileUrl() != null) contract.setGeneratedFileUrl(request.getGeneratedFileUrl().orElse(contract.getGeneratedFileUrl()));
        if (request.getSigningProvider() != null) contract.setSigningProvider(request.getSigningProvider().orElse(contract.getSigningProvider()));
        if (request.getExternalSigningId() != null) contract.setExternalSigningId(request.getExternalSigningId().orElse(contract.getExternalSigningId()));
        return contractRepository.save(contract);
    }

    public void delete(UUID id) {
        Contract contract = get(id);
        if ("signed".equals(contract.getStatus())) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Cannot delete a signed contract");
        }
        contractRepository.delete(contract);
    }

    public Contract send(UUID id) {
        Contract contract = get(id);
        statusValidator.validateContractTransition(contract.getStatus(), "sent");
        String oldStatus = contract.getStatus();
        contract.setStatus("sent");
        contract.setSentAt(LocalDateTime.now());
        Contract saved = contractRepository.save(contract);
        eventPublisher.publishEvent(new EntityEvent(
                this, "contract", "status_changed", contract.getId(),
                contract.getOrganization().getId(), oldStatus, "sent", saved));
        // Send email to client if they have an email
        if (saved.getClient() != null && saved.getClient().getEmail() != null) {
            try {
                emailService.sendContractEmail(
                        saved.getClient().getEmail(),
                        saved.getTitle(),
                        saved.getContractType(),
                        saved.getClient().getName(),
                        saved.getExpiresAt() != null ? saved.getExpiresAt().toString() : "N/A",
                        null);
                communicationLogService.logCommunication("contract", saved.getId(),
                        "email", "outbound", saved.getClient().getName(),
                        saved.getClient().getEmail(), "Contract: " + saved.getTitle(),
                        null, "sent");
            } catch (Exception e) {
                log.warn("Failed to send contract email for contract '{}': {}", saved.getTitle(), e.getMessage());
            }
        }
        return saved;
    }

    public Contract sign(UUID id, ContractSignRequest request) {
        Contract contract = get(id);
        statusValidator.validateContractTransition(contract.getStatus(), "signed");
        String oldStatus = contract.getStatus();
        contract.setStatus("signed");
        contract.setSignedAt(LocalDateTime.now());
        if (request.getSignedFileUrl() != null) contract.setSignedFileUrl(request.getSignedFileUrl());
        if (request.getSigningProvider() != null) contract.setSigningProvider(request.getSigningProvider());
        if (request.getExternalSigningId() != null) contract.setExternalSigningId(request.getExternalSigningId());
        Contract saved = contractRepository.save(contract);
        eventPublisher.publishEvent(new EntityEvent(
                this, "contract", "status_changed", contract.getId(),
                contract.getOrganization().getId(), oldStatus, "signed", saved));
        return saved;
    }
}
