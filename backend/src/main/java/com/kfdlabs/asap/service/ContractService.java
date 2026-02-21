package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Contract;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.mapper.ContractMapper;
import com.kfdlabs.asap.repository.*;
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
        return contractRepository.save(contract);
    }

    public Contract update(UUID id, UpdateContractRequest request) {
        Contract contract = get(id);
        if (request.getTitle() != null) contract.setTitle(request.getTitle().orElse(contract.getTitle()));
        if (request.getTemplateContent() != null) contract.setTemplateContent(request.getTemplateContent().orElse(contract.getTemplateContent()));
        if (request.getContractType() != null) contract.setContractType(request.getContractType().orElse(contract.getContractType()));
        if (request.getStatus() != null) contract.setStatus(request.getStatus().orElse(contract.getStatus()));
        if (request.getExpiresAt() != null) contract.setExpiresAt(request.getExpiresAt().orElse(contract.getExpiresAt()));
        if (request.getNotes() != null) contract.setNotes(request.getNotes().orElse(contract.getNotes()));
        if (request.getGeneratedFileUrl() != null) contract.setGeneratedFileUrl(request.getGeneratedFileUrl().orElse(contract.getGeneratedFileUrl()));
        if (request.getSigningProvider() != null) contract.setSigningProvider(request.getSigningProvider().orElse(contract.getSigningProvider()));
        if (request.getExternalSigningId() != null) contract.setExternalSigningId(request.getExternalSigningId().orElse(contract.getExternalSigningId()));
        return contractRepository.save(contract);
    }

    public void delete(UUID id) {
        Contract contract = get(id);
        contractRepository.delete(contract);
    }

    public Contract send(UUID id) {
        Contract contract = get(id);
        contract.setStatus("sent");
        contract.setSentAt(LocalDateTime.now());
        return contractRepository.save(contract);
    }

    public Contract sign(UUID id, ContractSignRequest request) {
        Contract contract = get(id);
        contract.setStatus("signed");
        contract.setSignedAt(LocalDateTime.now());
        if (request.getSignedFileUrl() != null) contract.setSignedFileUrl(request.getSignedFileUrl());
        if (request.getSigningProvider() != null) contract.setSigningProvider(request.getSigningProvider());
        if (request.getExternalSigningId() != null) contract.setExternalSigningId(request.getExternalSigningId());
        return contractRepository.save(contract);
    }
}
