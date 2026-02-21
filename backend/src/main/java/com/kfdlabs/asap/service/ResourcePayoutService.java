package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.Resource;
import com.kfdlabs.asap.entity.ResourcePayout;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.repository.ResourcePayoutRepository;
import com.kfdlabs.asap.repository.ResourceRepository;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ResourcePayoutService {

    private final ResourcePayoutRepository payoutRepository;
    private final ResourceRepository resourceRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final StatusTransitionValidator statusValidator;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public Page<ResourcePayout> listPayouts(String status, UUID resourceId,
                                             Integer page, Integer size, String sortBy, String order) {
        return payoutRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                status, resourceId, PaginationUtils.getPageable(page, size, order, sortBy));
    }

    public ResourcePayout getPayout(UUID id) {
        ResourcePayout payout = payoutRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Payout not found"));
        if (!payout.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return payout;
    }

    public List<ResourcePayout> listByResource(UUID resourceId) {
        return payoutRepository.findByResourceId(resourceId);
    }

    public ResourcePayout createPayout(CreateResourcePayoutRequest request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Resource not found"));
        ResourcePayout payout = new ResourcePayout();
        payout.setOrganization(getCurrentOrg());
        payout.setResource(resource);
        payout.setAmount(request.getAmount());
        if (request.getProjectId() != null) payout.setProjectId(request.getProjectId());
        if (request.getDescription() != null) payout.setDescription(request.getDescription());
        if (request.getCurrency() != null) payout.setCurrency(request.getCurrency());
        if (request.getPeriodStart() != null) payout.setPeriodStart(request.getPeriodStart());
        if (request.getPeriodEnd() != null) payout.setPeriodEnd(request.getPeriodEnd());
        if (request.getNotes() != null) payout.setNotes(request.getNotes());
        return payoutRepository.save(payout);
    }

    public ResourcePayout updatePayout(UUID id, UpdateResourcePayoutRequest request) {
        ResourcePayout payout = getPayout(id);
        if (request.getDescription() != null) payout.setDescription(request.getDescription().orElse(payout.getDescription()));
        if (request.getAmount() != null) payout.setAmount(request.getAmount().orElse(payout.getAmount()));
        if (request.getCurrency() != null) payout.setCurrency(request.getCurrency().orElse(payout.getCurrency()));
        if (request.getStatus() != null) {
            String newStatus = request.getStatus().orElse(payout.getStatus());
            statusValidator.validateResourcePayoutTransition(payout.getStatus(), newStatus);
            payout.setStatus(newStatus);
        }
        if (request.getPaymentMethod() != null) payout.setPaymentMethod(request.getPaymentMethod().orElse(payout.getPaymentMethod()));
        if (request.getPaymentReference() != null) payout.setPaymentReference(request.getPaymentReference().orElse(payout.getPaymentReference()));
        if (request.getPeriodStart() != null) payout.setPeriodStart(request.getPeriodStart().orElse(payout.getPeriodStart()));
        if (request.getPeriodEnd() != null) payout.setPeriodEnd(request.getPeriodEnd().orElse(payout.getPeriodEnd()));
        if (request.getNotes() != null) payout.setNotes(request.getNotes().orElse(payout.getNotes()));
        return payoutRepository.save(payout);
    }

    public void deletePayout(UUID id) {
        ResourcePayout payout = getPayout(id);
        payoutRepository.delete(payout);
    }

    public ResourcePayout approvePayout(UUID id) {
        if (!SecurityUtils.isAdmin()) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Only admins or owners can approve payouts");
        }
        ResourcePayout payout = getPayout(id);
        statusValidator.validateResourcePayoutTransition(payout.getStatus(), "approved");
        payout.setStatus("approved");
        payout.setApprovedAt(LocalDateTime.now());
        payout.setApprovedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        return payoutRepository.save(payout);
    }

    public ResourcePayout markPaid(UUID id, MarkPayoutPaidRequest request) {
        ResourcePayout payout = getPayout(id);
        statusValidator.validateResourcePayoutTransition(payout.getStatus(), "paid");
        payout.setStatus("paid");
        payout.setPaidAt(LocalDateTime.now());
        if (request.getPaymentMethod() != null) payout.setPaymentMethod(request.getPaymentMethod());
        if (request.getPaymentReference() != null) payout.setPaymentReference(request.getPaymentReference());
        return payoutRepository.save(payout);
    }
}
