package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.InvoicesApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.InvoiceMapper;
import com.kfdlabs.asap.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class InvoiceController implements InvoicesApi {

    private final InvoiceService invoiceService;
    private final InvoiceMapper invoiceMapper;

    @Override
    public ResponseEntity<PaginatedInvoiceResponse> listInvoices(
            String query, String status, UUID clientId, UUID projectId,
            Integer page, Integer size) {
        return ResponseEntity.ok(invoiceMapper.toPaginatedDTO(
                invoiceService.list(query, status, clientId, projectId, page, size)));
    }

    @Override
    public ResponseEntity<InvoiceDetailResponse> getInvoiceById(UUID id) {
        return ResponseEntity.ok(invoiceService.getDetail(id));
    }

    @Override
    public ResponseEntity<InvoiceResponse> createInvoice(CreateInvoiceRequest createInvoiceRequest) {
        return ResponseEntity.status(201).body(invoiceMapper.toDTO(invoiceService.create(createInvoiceRequest)));
    }

    @Override
    public ResponseEntity<InvoiceResponse> createInvoiceFromQuote(UUID quoteId) {
        return ResponseEntity.status(201).body(invoiceMapper.toDTO(invoiceService.createFromQuote(quoteId)));
    }

    @Override
    public ResponseEntity<InvoiceResponse> updateInvoice(UUID id, UpdateInvoiceRequest updateInvoiceRequest) {
        return ResponseEntity.ok(invoiceMapper.toDTO(invoiceService.update(id, updateInvoiceRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteInvoice(UUID id) {
        invoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<InvoiceResponse> sendInvoice(UUID id) {
        return ResponseEntity.ok(invoiceMapper.toDTO(invoiceService.send(id)));
    }

    @Override
    public ResponseEntity<InvoiceResponse> voidInvoice(UUID id) {
        return ResponseEntity.ok(invoiceMapper.toDTO(invoiceService.voidInvoice(id)));
    }

    @Override
    public ResponseEntity<InvoiceResponse> recalculateInvoice(UUID id) {
        return ResponseEntity.ok(invoiceMapper.toDTO(invoiceService.recalculate(id)));
    }

    // Line Items

    @Override
    public ResponseEntity<List<InvoiceLineItemResponse>> listInvoiceLineItems(UUID id) {
        return ResponseEntity.ok(invoiceService.listLineItems(id).stream()
                .map(invoiceMapper::toLineItemDTO).toList());
    }

    @Override
    public ResponseEntity<InvoiceLineItemResponse> createInvoiceLineItem(UUID id, CreateInvoiceLineItemRequest createInvoiceLineItemRequest) {
        return ResponseEntity.status(201).body(invoiceMapper.toLineItemDTO(
                invoiceService.createLineItem(id, createInvoiceLineItemRequest)));
    }

    @Override
    public ResponseEntity<InvoiceLineItemResponse> updateInvoiceLineItem(UUID id, UUID lineId, UpdateInvoiceLineItemRequest updateInvoiceLineItemRequest) {
        return ResponseEntity.ok(invoiceMapper.toLineItemDTO(
                invoiceService.updateLineItem(id, lineId, updateInvoiceLineItemRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteInvoiceLineItem(UUID id, UUID lineId) {
        invoiceService.deleteLineItem(id, lineId);
        return ResponseEntity.noContent().build();
    }

    // Payments

    @Override
    public ResponseEntity<List<PaymentResponse>> listInvoicePayments(UUID id) {
        return ResponseEntity.ok(invoiceService.listPayments(id).stream()
                .map(invoiceMapper::toPaymentDTO).toList());
    }

    @Override
    public ResponseEntity<PaymentResponse> createInvoicePayment(UUID id, CreatePaymentRequest createPaymentRequest) {
        return ResponseEntity.status(201).body(invoiceMapper.toPaymentDTO(
                invoiceService.recordPayment(id, createPaymentRequest)));
    }
}
