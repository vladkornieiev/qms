package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.ReportsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ReportController implements ReportsApi {

    private final ReportService reportService;

    @Override
    public ResponseEntity<List<ProjectReportRow>> getProjectsReport(String format, String status) {
        return ResponseEntity.ok(reportService.getProjectsReport(status));
    }

    @Override
    public ResponseEntity<List<InvoiceAgingRow>> getInvoiceAgingReport(String format) {
        return ResponseEntity.ok(reportService.getInvoiceAgingReport());
    }

    @Override
    public ResponseEntity<List<ResourceUtilizationRow>> getResourceUtilizationReport(String format) {
        return ResponseEntity.ok(reportService.getResourceUtilizationReport());
    }

    @Override
    public ResponseEntity<List<ClientRevenueRow>> getClientRevenueReport(String format) {
        return ResponseEntity.ok(reportService.getClientRevenueReport());
    }
}
