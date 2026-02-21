package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.ResourcePayoutsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.ResourceMapper;
import com.kfdlabs.asap.service.ResourcePayoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ResourcePayoutController implements ResourcePayoutsApi {

    private final ResourcePayoutService payoutService;
    private final ResourceMapper resourceMapper;

    @Override
    public ResponseEntity<PaginatedResourcePayoutResponse> listAllPayouts(
            String status, UUID resourceId,
            Integer page, Integer size, String sortBy, String order) {
        return ResponseEntity.ok(resourceMapper.toPaginatedPayoutDTO(
                payoutService.listPayouts(status, resourceId, page, size, sortBy, order)));
    }

    @Override
    public ResponseEntity<ResourcePayoutResponse> getPayoutById(UUID id) {
        return ResponseEntity.ok(resourceMapper.toPayoutDTO(payoutService.getPayout(id)));
    }

    @Override
    public ResponseEntity<ResourcePayoutResponse> createPayout(CreateResourcePayoutRequest createResourcePayoutRequest) {
        return ResponseEntity.status(201).body(resourceMapper.toPayoutDTO(
                payoutService.createPayout(createResourcePayoutRequest)));
    }

    @Override
    public ResponseEntity<ResourcePayoutResponse> updatePayout(UUID id, UpdateResourcePayoutRequest updateResourcePayoutRequest) {
        return ResponseEntity.ok(resourceMapper.toPayoutDTO(payoutService.updatePayout(id, updateResourcePayoutRequest)));
    }

    @Override
    public ResponseEntity<Void> deletePayout(UUID id) {
        payoutService.deletePayout(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<ResourcePayoutResponse> approvePayout(UUID id) {
        return ResponseEntity.ok(resourceMapper.toPayoutDTO(payoutService.approvePayout(id)));
    }

    @Override
    public ResponseEntity<ResourcePayoutResponse> markPayoutPaid(UUID id, MarkPayoutPaidRequest markPayoutPaidRequest) {
        return ResponseEntity.ok(resourceMapper.toPayoutDTO(payoutService.markPaid(id, markPayoutPaidRequest)));
    }
}
