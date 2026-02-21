import { BaseApiClient } from "./base-client";
import type {
  RevenueSummary,
  PipelineSummary,
  UtilizationSummary,
  InventoryAlerts,
  TopClient,
  ProjectReportRow,
  InvoiceAgingRow,
  ResourceUtilizationRow,
  ClientRevenueRow,
} from "../api-types/dashboard.types";

class DashboardClient extends BaseApiClient {
  async getRevenue(period?: string): Promise<RevenueSummary> {
    const query = this.buildQueryString({ period });
    return this.request<RevenueSummary>(`/api/dashboard/revenue${query}`);
  }

  async getPipeline(): Promise<PipelineSummary> {
    return this.request<PipelineSummary>("/api/dashboard/pipeline");
  }

  async getUtilization(): Promise<UtilizationSummary> {
    return this.request<UtilizationSummary>("/api/dashboard/utilization");
  }

  async getInventoryAlerts(): Promise<InventoryAlerts> {
    return this.request<InventoryAlerts>("/api/dashboard/inventory-alerts");
  }

  async getTopClients(limit?: number): Promise<TopClient[]> {
    const query = this.buildQueryString({ limit });
    return this.request<TopClient[]>(`/api/dashboard/top-clients${query}`);
  }
}

class ReportsClient extends BaseApiClient {
  async getProjects(params?: { format?: string; status?: string }): Promise<ProjectReportRow[]> {
    const query = this.buildQueryString(params || {});
    return this.request<ProjectReportRow[]>(`/api/reports/projects${query}`);
  }

  async getInvoiceAging(params?: { format?: string }): Promise<InvoiceAgingRow[]> {
    const query = this.buildQueryString(params || {});
    return this.request<InvoiceAgingRow[]>(`/api/reports/invoices${query}`);
  }

  async getResourceUtilization(params?: { format?: string }): Promise<ResourceUtilizationRow[]> {
    const query = this.buildQueryString(params || {});
    return this.request<ResourceUtilizationRow[]>(`/api/reports/resources${query}`);
  }

  async getClientRevenue(params?: { format?: string }): Promise<ClientRevenueRow[]> {
    const query = this.buildQueryString(params || {});
    return this.request<ClientRevenueRow[]>(`/api/reports/clients${query}`);
  }
}

export const dashboardClient = new DashboardClient();
export const reportsClient = new ReportsClient();
