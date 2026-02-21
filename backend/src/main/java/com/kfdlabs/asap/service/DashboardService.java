package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.security.SecurityUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final EntityManager entityManager;

    public RevenueSummaryResponse getRevenueSummary(String period) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        RevenueSummaryResponse response = new RevenueSummaryResponse();

        // Calculate date range based on period
        LocalDate now = LocalDate.now();
        LocalDate startDate = switch (period != null ? period : "all") {
            case "week" -> now.minusWeeks(1);
            case "month" -> now.minusMonths(1);
            case "quarter" -> now.minusMonths(3);
            case "year" -> now.minusYears(1);
            default -> null;
        };

        String dateFilter = startDate != null ? " AND created_at >= :startDate" : "";

        // Total invoiced (non-void, non-draft)
        Query totalQuery = entityManager.createNativeQuery(
            "SELECT COALESCE(SUM(total), 0), COALESCE(SUM(amount_paid), 0), COALESCE(SUM(balance_due), 0), " +
            "COUNT(*), COUNT(*) FILTER (WHERE status = 'paid'), COUNT(*) FILTER (WHERE status = 'overdue') " +
            "FROM invoices WHERE organization_id = :orgId AND status NOT IN ('void', 'draft')" + dateFilter);
        totalQuery.setParameter("orgId", orgId);
        if (startDate != null) {
            totalQuery.setParameter("startDate", startDate.atStartOfDay());
        }
        Object[] row = (Object[]) totalQuery.getSingleResult();

        response.setTotalInvoiced(((Number) row[0]).doubleValue());
        response.setTotalPaid(((Number) row[1]).doubleValue());
        response.setTotalOutstanding(((Number) row[2]).doubleValue());
        response.setInvoiceCount(((Number) row[3]).intValue());
        response.setPaidCount(((Number) row[4]).intValue());
        response.setOverdueCount(((Number) row[5]).intValue());
        response.setPeriodLabel(period);

        return response;
    }

    public PipelineSummaryResponse getPipelineSummary() {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        PipelineSummaryResponse response = new PipelineSummaryResponse();

        response.setInboundByStatus(countByStatus("inbound_requests", orgId));
        response.setQuotesByStatus(countByStatus("quotes", orgId));
        response.setProjectsByStatus(countByStatus("projects", orgId));
        response.setInvoicesByStatus(countByStatus("invoices", orgId));

        return response;
    }

    private static final Set<String> ALLOWED_STATUS_TABLES = Set.of(
        "inbound_requests", "quotes", "projects", "invoices"
    );

    @SuppressWarnings("unchecked")
    private Map<String, Integer> countByStatus(String tableName, UUID orgId) {
        if (!ALLOWED_STATUS_TABLES.contains(tableName)) {
            throw new IllegalArgumentException("Invalid table name: " + tableName);
        }
        Query query = entityManager.createNativeQuery(
            "SELECT status, COUNT(*)::int FROM " + tableName + " WHERE organization_id = :orgId GROUP BY status");
        query.setParameter("orgId", orgId);
        List<Object[]> rows = query.getResultList();
        Map<String, Integer> result = new LinkedHashMap<>();
        for (Object[] r : rows) {
            result.put((String) r[0], ((Number) r[1]).intValue());
        }
        return result;
    }

    public UtilizationSummaryResponse getUtilization() {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        UtilizationSummaryResponse response = new UtilizationSummaryResponse();

        Query totalQ = entityManager.createNativeQuery(
            "SELECT COUNT(*) FROM resources WHERE organization_id = :orgId AND is_active = true");
        totalQ.setParameter("orgId", orgId);
        int totalResources = ((Number) totalQ.getSingleResult()).intValue();

        LocalDate today = LocalDate.now();
        Query bookedQ = entityManager.createNativeQuery(
            "SELECT COUNT(DISTINCT ra.resource_id) FROM resource_availability ra " +
            "JOIN resources r ON r.id = ra.resource_id " +
            "WHERE ra.organization_id = :orgId AND ra.status = 'booked' " +
            "AND ra.date_start <= :today AND ra.date_end >= :today");
        bookedQ.setParameter("orgId", orgId);
        bookedQ.setParameter("today", today);
        int bookedCount = ((Number) bookedQ.getSingleResult()).intValue();

        response.setTotalResources(totalResources);
        response.setBookedCount(bookedCount);
        response.setAvailableCount(totalResources - bookedCount);
        response.setUtilizationPercent(totalResources > 0 ? (bookedCount * 100.0 / totalResources) : 0.0);

        return response;
    }

    @SuppressWarnings("unchecked")
    public InventoryAlertResponse getInventoryAlerts() {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        InventoryAlertResponse response = new InventoryAlertResponse();

        // Low stock items from v_stock_overview
        Query lowStockQ = entityManager.createNativeQuery(
            "SELECT product_id, product_name, sku, location, quantity_on_hand, reorder_point " +
            "FROM v_stock_overview WHERE organization_id = :orgId AND needs_reorder = true");
        lowStockQ.setParameter("orgId", orgId);
        List<Object[]> lowStockRows = lowStockQ.getResultList();

        List<LowStockItem> lowStockItems = new ArrayList<>();
        for (Object[] r : lowStockRows) {
            LowStockItem item = new LowStockItem();
            item.setProductId((UUID) r[0]);
            item.setProductName((String) r[1]);
            item.setSku((String) r[2]);
            item.setLocation((String) r[3]);
            item.setQuantityOnHand(r[4] != null ? BigDecimal.valueOf(((Number) r[4]).doubleValue()) : BigDecimal.ZERO);
            item.setReorderPoint(r[5] != null ? BigDecimal.valueOf(((Number) r[5]).doubleValue()) : BigDecimal.ZERO);
            lowStockItems.add(item);
        }

        response.setLowStockCount(lowStockItems.size());
        response.setLowStockItems(lowStockItems);

        // Checked out count
        Query checkedOutQ = entityManager.createNativeQuery(
            "SELECT COUNT(*) FROM inventory_items WHERE organization_id = :orgId AND status = 'checked_out'");
        checkedOutQ.setParameter("orgId", orgId);
        response.setCheckedOutCount(((Number) checkedOutQ.getSingleResult()).intValue());

        // Maintenance count
        Query maintenanceQ = entityManager.createNativeQuery(
            "SELECT COUNT(*) FROM inventory_items WHERE organization_id = :orgId AND status = 'maintenance'");
        maintenanceQ.setParameter("orgId", orgId);
        response.setMaintenanceCount(((Number) maintenanceQ.getSingleResult()).intValue());

        return response;
    }

    @SuppressWarnings("unchecked")
    public List<TopClientResponse> getTopClients(int limit) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        Query query = entityManager.createNativeQuery(
            "SELECT client_id, client_name, total_projects::int, total_invoiced, total_paid, total_outstanding " +
            "FROM v_client_analytics WHERE organization_id = :orgId " +
            "ORDER BY total_invoiced DESC LIMIT :limit");
        query.setParameter("orgId", orgId);
        query.setParameter("limit", limit);

        List<Object[]> rows = query.getResultList();
        List<TopClientResponse> result = new ArrayList<>();
        for (Object[] r : rows) {
            TopClientResponse dto = new TopClientResponse();
            dto.setClientId((UUID) r[0]);
            dto.setClientName((String) r[1]);
            dto.setTotalProjects(((Number) r[2]).intValue());
            dto.setTotalInvoiced(((Number) r[3]).doubleValue());
            dto.setTotalPaid(((Number) r[4]).doubleValue());
            dto.setTotalOutstanding(((Number) r[5]).doubleValue());
            result.add(dto);
        }
        return result;
    }
}
