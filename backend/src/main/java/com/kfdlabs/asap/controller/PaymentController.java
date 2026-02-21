package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.PaymentsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.InvoiceMapper;
import com.kfdlabs.asap.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class PaymentController implements PaymentsApi {

    private final InvoiceService invoiceService;
    private final InvoiceMapper invoiceMapper;

    @Override
    public ResponseEntity<PaginatedPaymentResponse> listPayments(Integer page, Integer size) {
        return ResponseEntity.ok(invoiceMapper.toPaginatedPaymentDTO(
                invoiceService.listAllPayments(page, size)));
    }

    @Override
    public ResponseEntity<PaymentResponse> getPaymentById(UUID id) {
        return ResponseEntity.ok(invoiceMapper.toPaymentDTO(invoiceService.getPayment(id)));
    }

    @Override
    public ResponseEntity<Void> deletePayment(UUID id) {
        invoiceService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
