package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.InboundRequestsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.QuoteMapper;
import com.kfdlabs.asap.service.InboundRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class InboundRequestController implements InboundRequestsApi {

    private final InboundRequestService inboundRequestService;
    private final QuoteMapper quoteMapper;

    @Override
    public ResponseEntity<PaginatedInboundRequestResponse> listInboundRequests(
            String query, String status, Integer page, Integer size) {
        return ResponseEntity.ok(quoteMapper.toPaginatedInboundRequestDTO(
                inboundRequestService.list(query, status, page, size)));
    }

    @Override
    public ResponseEntity<InboundRequestResponse> getInboundRequestById(UUID id) {
        return ResponseEntity.ok(quoteMapper.toInboundRequestDTO(inboundRequestService.get(id)));
    }

    @Override
    public ResponseEntity<InboundRequestResponse> createInboundRequest(CreateInboundRequestRequest createInboundRequestRequest) {
        return ResponseEntity.status(201).body(quoteMapper.toInboundRequestDTO(
                inboundRequestService.create(createInboundRequestRequest)));
    }

    @Override
    public ResponseEntity<InboundRequestResponse> updateInboundRequest(UUID id, UpdateInboundRequestRequest updateInboundRequestRequest) {
        return ResponseEntity.ok(quoteMapper.toInboundRequestDTO(
                inboundRequestService.update(id, updateInboundRequestRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteInboundRequest(UUID id) {
        inboundRequestService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<InboundRequestResponse> reviewInboundRequest(UUID id, ReviewInboundRequestRequest reviewInboundRequestRequest) {
        return ResponseEntity.ok(quoteMapper.toInboundRequestDTO(
                inboundRequestService.review(id, reviewInboundRequestRequest)));
    }

    @Override
    public ResponseEntity<InboundRequestResponse> convertInboundRequest(UUID id) {
        return ResponseEntity.ok(quoteMapper.toInboundRequestDTO(
                inboundRequestService.convert(id)));
    }
}
