package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.service.BulkOperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bulk")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class BulkOperationsController {

    private final BulkOperationsService bulkOperationsService;

    @PostMapping("/invoices/send")
    public ResponseEntity<Map<String, Object>> bulkSendInvoices(@RequestBody List<UUID> invoiceIds) {
        Map<String, Object> result = bulkOperationsService.bulkSendInvoices(invoiceIds);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/invoices/remind")
    public ResponseEntity<Map<String, Object>> bulkSendReminders(@RequestBody List<UUID> invoiceIds) {
        Map<String, Object> result = bulkOperationsService.bulkSendPaymentReminders(invoiceIds);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/quotes/send")
    public ResponseEntity<Map<String, Object>> bulkSendQuotes(@RequestBody List<UUID> quoteIds) {
        Map<String, Object> result = bulkOperationsService.bulkSendQuotes(quoteIds);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/invoices/void")
    public ResponseEntity<Map<String, Object>> bulkVoidInvoices(@RequestBody List<UUID> invoiceIds) {
        Map<String, Object> result = bulkOperationsService.bulkVoidInvoices(invoiceIds);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/notifications")
    public ResponseEntity<Map<String, Object>> bulkDeleteNotifications(@RequestBody List<UUID> notificationIds) {
        Map<String, Object> result = bulkOperationsService.bulkDeleteNotifications(notificationIds);
        return ResponseEntity.ok(result);
    }
}
