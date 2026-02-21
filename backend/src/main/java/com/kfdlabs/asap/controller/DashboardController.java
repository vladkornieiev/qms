package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.DashboardApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class DashboardController implements DashboardApi {

    private final DashboardService dashboardService;

    @Override
    public ResponseEntity<RevenueSummaryResponse> getDashboardRevenue(String period) {
        return ResponseEntity.ok(dashboardService.getRevenueSummary(period));
    }

    @Override
    public ResponseEntity<PipelineSummaryResponse> getDashboardPipeline() {
        return ResponseEntity.ok(dashboardService.getPipelineSummary());
    }

    @Override
    public ResponseEntity<UtilizationSummaryResponse> getDashboardUtilization() {
        return ResponseEntity.ok(dashboardService.getUtilization());
    }

    @Override
    public ResponseEntity<InventoryAlertResponse> getDashboardInventoryAlerts() {
        return ResponseEntity.ok(dashboardService.getInventoryAlerts());
    }

    @Override
    public ResponseEntity<List<TopClientResponse>> getDashboardTopClients(Integer limit) {
        return ResponseEntity.ok(dashboardService.getTopClients(limit != null ? limit : 10));
    }
}
