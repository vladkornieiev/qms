package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.InboundRequest;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.Project;
import com.kfdlabs.asap.repository.InboundRequestRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.ProjectRepository;
import com.kfdlabs.asap.repository.UserRepository;
import com.kfdlabs.asap.repository.ClientRepository;
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
public class InboundRequestService {

    private final InboundRequestRepository inboundRequestRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public Page<InboundRequest> list(String query, String status, Integer page, Integer size) {
        return inboundRequestRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                query, status, PaginationUtils.getPageable(page, size));
    }

    public InboundRequest get(UUID id) {
        InboundRequest req = inboundRequestRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Inbound request not found"));
        if (!req.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return req;
    }

    public InboundRequest create(CreateInboundRequestRequest request) {
        InboundRequest req = new InboundRequest();
        req.setOrganization(getCurrentOrg());
        if (request.getSubmitterName() != null) req.setSubmitterName(request.getSubmitterName());
        if (request.getSubmitterEmail() != null) req.setSubmitterEmail(request.getSubmitterEmail());
        if (request.getSubmitterPhone() != null) req.setSubmitterPhone(request.getSubmitterPhone());
        if (request.getSubmitterCompany() != null) req.setSubmitterCompany(request.getSubmitterCompany());
        if (request.getClientId() != null) req.setClient(clientRepository.findById(request.getClientId()).orElse(null));
        if (request.getTemplateId() != null) req.setTemplateId(request.getTemplateId());
        if (request.getFormData() != null) req.setFormData(request.getFormData());
        return inboundRequestRepository.save(req);
    }

    public InboundRequest update(UUID id, UpdateInboundRequestRequest request) {
        InboundRequest req = get(id);
        if (request.getSubmitterName() != null) req.setSubmitterName(request.getSubmitterName().orElse(req.getSubmitterName()));
        if (request.getSubmitterEmail() != null) req.setSubmitterEmail(request.getSubmitterEmail().orElse(req.getSubmitterEmail()));
        if (request.getSubmitterPhone() != null) req.setSubmitterPhone(request.getSubmitterPhone().orElse(req.getSubmitterPhone()));
        if (request.getSubmitterCompany() != null) req.setSubmitterCompany(request.getSubmitterCompany().orElse(req.getSubmitterCompany()));
        if (request.getClientId() != null) {
            UUID cId = request.getClientId().orElse(null);
            req.setClient(cId != null ? clientRepository.findById(cId).orElse(null) : null);
        }
        if (request.getFormData() != null) req.setFormData(request.getFormData().orElse(req.getFormData()));
        return inboundRequestRepository.save(req);
    }

    public void delete(UUID id) {
        InboundRequest req = get(id);
        inboundRequestRepository.delete(req);
    }

    public InboundRequest review(UUID id, ReviewInboundRequestRequest request) {
        InboundRequest req = get(id);
        String decision = request.getDecision();
        if ("approved".equals(decision)) {
            req.setStatus("approved");
        } else if ("denied".equals(decision)) {
            req.setStatus("denied");
            if (request.getDenialReason() != null) req.setDenialReason(request.getDenialReason());
        } else {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Invalid decision: " + decision);
        }
        req.setReviewedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        req.setReviewedAt(LocalDateTime.now());
        return inboundRequestRepository.save(req);
    }

    public InboundRequest convert(UUID id) {
        InboundRequest req = get(id);
        if (req.getProjectId() != null) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Already converted to a project");
        }
        Project project = new Project();
        project.setOrganization(req.getOrganization());
        project.setTitle(req.getSubmitterCompany() != null ? req.getSubmitterCompany() + " Project" : "New Project");
        project.setProjectNumber(String.format("PRJ-%05d", projectRepository.count() + 1));
        project.setClient(req.getClient());
        project.setSource("inbound_request");
        project.setCreatedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        project = projectRepository.save(project);
        req.setProjectId(project.getId());
        req.setStatus("approved");
        return inboundRequestRepository.save(req);
    }
}
