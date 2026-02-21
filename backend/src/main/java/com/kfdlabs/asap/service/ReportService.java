package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.security.SecurityUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final EntityManager entityManager;

    @SuppressWarnings("unchecked")
    public List<ProjectReportRow> getProjectsReport(String status) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        String sql = "SELECT project_id, project_number, title, status, client_name, " +
                     "total_billable, total_cost, total_profit, created_at " +
                     "FROM v_project_financials WHERE organization_id = :orgId";
        if (status != null && !status.isBlank()) {
            sql += " AND status = :status";
        }
        sql += " ORDER BY created_at DESC";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("orgId", orgId);
        if (status != null && !status.isBlank()) {
            query.setParameter("status", status);
        }

        List<Object[]> rows = query.getResultList();
        List<ProjectReportRow> result = new ArrayList<>();
        for (Object[] r : rows) {
            ProjectReportRow row = new ProjectReportRow();
            row.setProjectId((UUID) r[0]);
            row.setProjectNumber((String) r[1]);
            row.setTitle((String) r[2]);
            row.setStatus((String) r[3]);
            row.setClientName((String) r[4]);
            row.setTotalBillable(r[5] != null ? ((Number) r[5]).doubleValue() : 0);
            row.setTotalCost(r[6] != null ? ((Number) r[6]).doubleValue() : 0);
            row.setTotalProfit(r[7] != null ? ((Number) r[7]).doubleValue() : 0);
            if (r[8] != null) {
                if (r[8] instanceof LocalDateTime ldt) {
                    row.setCreatedAt(ldt);
                } else if (r[8] instanceof java.sql.Timestamp ts) {
                    row.setCreatedAt(ts.toLocalDateTime());
                } else if (r[8] instanceof OffsetDateTime odt) {
                    row.setCreatedAt(odt.toLocalDateTime());
                }
            }
            result.add(row);
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    public List<InvoiceAgingRow> getInvoiceAgingReport() {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        Query query = entityManager.createNativeQuery(
            "SELECT i.id, i.invoice_number, c.name AS client_name, i.status, i.total, i.balance_due, " +
            "i.issued_date, i.due_date, " +
            "CASE WHEN i.due_date < CURRENT_DATE AND i.status NOT IN ('paid','void') " +
            "THEN (CURRENT_DATE - i.due_date) ELSE 0 END AS days_overdue " +
            "FROM invoices i LEFT JOIN clients c ON c.id = i.client_id " +
            "WHERE i.organization_id = :orgId AND i.status NOT IN ('void', 'draft') " +
            "ORDER BY days_overdue DESC, i.due_date ASC");
        query.setParameter("orgId", orgId);

        List<Object[]> rows = query.getResultList();
        List<InvoiceAgingRow> result = new ArrayList<>();
        for (Object[] r : rows) {
            InvoiceAgingRow row = new InvoiceAgingRow();
            row.setInvoiceId((UUID) r[0]);
            row.setInvoiceNumber((String) r[1]);
            row.setClientName((String) r[2]);
            row.setStatus((String) r[3]);
            row.setTotal(r[4] != null ? ((Number) r[4]).doubleValue() : 0);
            row.setBalanceDue(r[5] != null ? ((Number) r[5]).doubleValue() : 0);
            if (r[6] != null) row.setIssuedDate(((java.sql.Date) r[6]).toLocalDate());
            if (r[7] != null) row.setDueDate(((java.sql.Date) r[7]).toLocalDate());
            row.setDaysOverdue(r[8] != null ? ((Number) r[8]).intValue() : 0);
            result.add(row);
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    public List<ResourceUtilizationRow> getResourceUtilizationReport() {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        Query query = entityManager.createNativeQuery(
            "SELECT r.id, CONCAT(r.first_name, ' ', r.last_name) AS resource_name, r.type, " +
            "COALESCE((SELECT SUM(ra.date_end - ra.date_start + 1) FROM resource_availability ra " +
            "  WHERE ra.resource_id = r.id AND ra.status = 'booked'), 0)::int AS total_booked_days, " +
            "COALESCE((SELECT SUM(ra.date_end - ra.date_start + 1) FROM resource_availability ra " +
            "  WHERE ra.resource_id = r.id AND ra.status = 'available'), 0)::int AS total_available_days, " +
            "COALESCE((SELECT SUM(pr.bill_rate) FROM project_resources pr WHERE pr.resource_id = r.id), 0) AS total_billed " +
            "FROM resources r WHERE r.organization_id = :orgId AND r.is_active = true " +
            "ORDER BY total_booked_days DESC");
        query.setParameter("orgId", orgId);

        List<Object[]> rows = query.getResultList();
        List<ResourceUtilizationRow> result = new ArrayList<>();
        for (Object[] r : rows) {
            ResourceUtilizationRow row = new ResourceUtilizationRow();
            row.setResourceId((UUID) r[0]);
            row.setResourceName((String) r[1]);
            row.setType((String) r[2]);
            int bookedDays = ((Number) r[3]).intValue();
            int availableDays = ((Number) r[4]).intValue();
            row.setTotalBookedDays(bookedDays);
            row.setTotalAvailableDays(availableDays);
            int totalDays = bookedDays + availableDays;
            row.setUtilizationPercent(totalDays > 0 ? (bookedDays * 100.0 / totalDays) : 0);
            row.setTotalBilled(((Number) r[5]).doubleValue());
            result.add(row);
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    public List<ClientRevenueRow> getClientRevenueReport() {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();

        Query query = entityManager.createNativeQuery(
            "SELECT client_id, client_name, total_projects::int, completed_projects::int, active_projects::int, " +
            "total_invoiced, total_paid, total_outstanding " +
            "FROM v_client_analytics WHERE organization_id = :orgId " +
            "ORDER BY total_invoiced DESC");
        query.setParameter("orgId", orgId);

        List<Object[]> rows = query.getResultList();
        List<ClientRevenueRow> result = new ArrayList<>();
        for (Object[] r : rows) {
            ClientRevenueRow row = new ClientRevenueRow();
            row.setClientId((UUID) r[0]);
            row.setClientName((String) r[1]);
            row.setTotalProjects(((Number) r[2]).intValue());
            row.setCompletedProjects(((Number) r[3]).intValue());
            row.setActiveProjects(((Number) r[4]).intValue());
            row.setTotalInvoiced(((Number) r[5]).doubleValue());
            row.setTotalPaid(((Number) r[6]).doubleValue());
            row.setTotalOutstanding(((Number) r[7]).doubleValue());
            result.add(row);
        }
        return result;
    }
}
