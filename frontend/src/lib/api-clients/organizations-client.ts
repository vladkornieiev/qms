/**
 * Organizations API client for managing organizations and organization switching
 */

import { BaseApiClient } from "./base-client";
import type {
  Organization,
  PaginatedOrganizationsResponse,
} from "../api-types";

export class OrganizationsApiClient extends BaseApiClient {
  async getAvailableOrganizations(): Promise<Organization[]> {
    const response = await this.request<PaginatedOrganizationsResponse>(
      "/api/organizations/available"
    );
    return response.items;
  }

  async switchOrganization(organizationId: string): Promise<void> {
    return this.request<void>("/api/organizations/switch", {
      method: "POST",
      body: JSON.stringify({ organizationId }),
    });
  }

  async getAllOrganizations(
    params: {
      query?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      order?: string;
    } = {}
  ): Promise<PaginatedOrganizationsResponse> {
    const queryString = this.buildQueryString(params);
    return this.request(`/api/admin/organizations${queryString}`);
  }

  async getOrganizationById(id: string): Promise<Organization> {
    return this.request<Organization>(`/api/admin/organizations/${id}`);
  }

  async createOrganization(data: {
    name: string;
    email?: string;
  }): Promise<Organization> {
    return this.request<Organization>("/api/admin/organizations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateOrganization(
    id: string,
    data: { name?: string; email?: string; isActive?: boolean }
  ): Promise<Organization> {
    return this.request<Organization>(`/api/admin/organizations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteOrganization(id: string): Promise<void> {
    return this.request<void>(`/api/admin/organizations/${id}`, {
      method: "DELETE",
    });
  }

  // Backward-compatible aliases
  async getAllAccounts(
    params: {
      query?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      order?: string;
    } = {}
  ): Promise<PaginatedOrganizationsResponse> {
    return this.getAllOrganizations(params);
  }

  async createAccount(data: { name: string; email?: string }): Promise<Organization> {
    return this.createOrganization(data);
  }

  async updateAccount(
    id: string,
    data: { name?: string; email?: string; isActive?: boolean }
  ): Promise<Organization> {
    return this.updateOrganization(id, data);
  }

  async deleteAccount(id: string): Promise<void> {
    return this.deleteOrganization(id);
  }
}
