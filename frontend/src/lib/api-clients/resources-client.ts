import { BaseApiClient } from "./base-client";
import type {
  Resource, PaginatedResourceResponse,
  CreateResourceRequest, UpdateResourceRequest,
  ResourceAvailability, CreateResourceAvailabilityRequest,
  ResourcePayout, PaginatedResourcePayoutResponse, CreateResourcePayoutRequest
} from "../api-types/resource.types";

class ResourcesClient extends BaseApiClient {
  async list(params?: { query?: string; type?: string; isActive?: boolean; page?: number; size?: number; sortBy?: string; order?: string }): Promise<PaginatedResourceResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedResourceResponse>(`/api/resources${query}`);
  }

  async get(id: string): Promise<Resource> {
    return this.request<Resource>(`/api/resources/${id}`);
  }

  async create(data: CreateResourceRequest): Promise<Resource> {
    return this.request<Resource>("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateResourceRequest): Promise<Resource> {
    return this.request<Resource>(`/api/resources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/resources/${id}`, { method: "DELETE" });
  }

  async listAvailability(resourceId: string): Promise<ResourceAvailability[]> {
    return this.request<ResourceAvailability[]>(`/api/resources/${resourceId}/availability`);
  }

  async createAvailability(resourceId: string, data: CreateResourceAvailabilityRequest): Promise<ResourceAvailability> {
    return this.request<ResourceAvailability>(`/api/resources/${resourceId}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async listPayouts(resourceId: string): Promise<ResourcePayout[]> {
    return this.request<ResourcePayout[]>(`/api/resources/${resourceId}/payouts`);
  }

  // Payout management
  async listAllPayouts(params?: { status?: string; resourceId?: string; page?: number; size?: number }): Promise<PaginatedResourcePayoutResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedResourcePayoutResponse>(`/api/resource-payouts${query}`);
  }

  async createPayout(data: CreateResourcePayoutRequest): Promise<ResourcePayout> {
    return this.request<ResourcePayout>("/api/resource-payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async approvePayout(id: string): Promise<ResourcePayout> {
    return this.request<ResourcePayout>(`/api/resource-payouts/${id}/approve`, { method: "POST" });
  }

  async markPayoutPaid(id: string, data: { paymentMethod?: string; paymentReference?: string }): Promise<ResourcePayout> {
    return this.request<ResourcePayout>(`/api/resource-payouts/${id}/mark-paid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
}

export const resourcesClient = new ResourcesClient();
