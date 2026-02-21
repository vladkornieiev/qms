package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.service.PdfGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class PdfController {

    private final PdfGenerationService pdfGenerationService;

    @GetMapping("/invoices/{id}/pdf")
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable UUID id) {
        byte[] pdf = pdfGenerationService.generateInvoicePdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/quotes/{id}/pdf")
    public ResponseEntity<byte[]> getQuotePdf(@PathVariable UUID id) {
        byte[] pdf = pdfGenerationService.generateQuotePdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=quote-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/contracts/{id}/pdf")
    public ResponseEntity<byte[]> getContractPdf(@PathVariable UUID id) {
        byte[] pdf = pdfGenerationService.generateContractPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=contract-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
