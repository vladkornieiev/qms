package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.QuotesApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.QuoteMapper;
import com.kfdlabs.asap.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class QuoteController implements QuotesApi {

    private final QuoteService quoteService;
    private final QuoteMapper quoteMapper;

    @Override
    public ResponseEntity<PaginatedQuoteResponse> listQuotes(
            String query, String status, UUID clientId, UUID projectId,
            Integer page, Integer size) {
        return ResponseEntity.ok(quoteMapper.toPaginatedQuoteDTO(
                quoteService.list(query, status, clientId, projectId, page, size)));
    }

    @Override
    public ResponseEntity<QuoteDetailResponse> getQuoteById(UUID id) {
        return ResponseEntity.ok(quoteService.getDetail(id));
    }

    @Override
    public ResponseEntity<QuoteResponse> createQuote(CreateQuoteRequest createQuoteRequest) {
        return ResponseEntity.status(201).body(quoteMapper.toQuoteDTO(quoteService.create(createQuoteRequest)));
    }

    @Override
    public ResponseEntity<QuoteResponse> updateQuote(UUID id, UpdateQuoteRequest updateQuoteRequest) {
        return ResponseEntity.ok(quoteMapper.toQuoteDTO(quoteService.update(id, updateQuoteRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteQuote(UUID id) {
        quoteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<QuoteResponse> sendQuote(UUID id) {
        return ResponseEntity.ok(quoteMapper.toQuoteDTO(quoteService.send(id)));
    }

    @Override
    public ResponseEntity<QuoteResponse> createNewQuoteVersion(UUID id) {
        return ResponseEntity.status(201).body(quoteMapper.toQuoteDTO(quoteService.createNewVersion(id)));
    }

    @Override
    public ResponseEntity<QuoteResponse> recalculateQuote(UUID id) {
        return ResponseEntity.ok(quoteMapper.toQuoteDTO(quoteService.recalculate(id)));
    }

    @Override
    public ResponseEntity<QuoteResponse> approveQuote(UUID id, QuoteApprovalRequest quoteApprovalRequest) {
        return ResponseEntity.ok(quoteMapper.toQuoteDTO(quoteService.approve(id, quoteApprovalRequest)));
    }

    // Line Items

    @Override
    public ResponseEntity<List<QuoteLineItemResponse>> listQuoteLineItems(UUID id) {
        return ResponseEntity.ok(quoteService.listLineItems(id).stream()
                .map(quoteMapper::toLineItemDTO).toList());
    }

    @Override
    public ResponseEntity<QuoteLineItemResponse> createQuoteLineItem(UUID id, CreateQuoteLineItemRequest createQuoteLineItemRequest) {
        return ResponseEntity.status(201).body(quoteMapper.toLineItemDTO(
                quoteService.createLineItem(id, createQuoteLineItemRequest)));
    }

    @Override
    public ResponseEntity<QuoteLineItemResponse> updateQuoteLineItem(UUID id, UUID lineId, UpdateQuoteLineItemRequest updateQuoteLineItemRequest) {
        return ResponseEntity.ok(quoteMapper.toLineItemDTO(
                quoteService.updateLineItem(id, lineId, updateQuoteLineItemRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteQuoteLineItem(UUID id, UUID lineId) {
        quoteService.deleteLineItem(id, lineId);
        return ResponseEntity.noContent().build();
    }
}
