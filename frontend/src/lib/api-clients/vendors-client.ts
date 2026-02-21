import { BaseApiClient } from "./base-client";
import type {
  Vendor, VendorContact, PaginatedVendorResponse,
  CreateVendorRequest, UpdateVendorRequest,
  CreateVendorContactRequest, UpdateVendorContactRequest
} from "../api-types/vendor.types";

class VendorsClient extends BaseApiClient {
  async list(params?: { query?: string; type?: string; isActive?: boolean; page?: number; size?: number; sortBy?: string; order?: string }): Promise<PaginatedVendorResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedVendorResponse>(`/api/vendors${query}`);
  }

  async get(id: string): Promise<Vendor> {
    return this.request<Vendor>(`/api/vendors/${id}`);
  }

  async create(data: CreateVendorRequest): Promise<Vendor> {
    return this.request<Vendor>("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateVendorRequest): Promise<Vendor> {
    return this.request<Vendor>(`/api/vendors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/vendors/${id}`, { method: "DELETE" });
  }

  async listContacts(vendorId: string): Promise<VendorContact[]> {
    return this.request<VendorContact[]>(`/api/vendors/${vendorId}/contacts`);
  }

  async createContact(vendorId: string, data: CreateVendorContactRequest): Promise<VendorContact> {
    return this.request<VendorContact>(`/api/vendors/${vendorId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateContact(vendorId: string, contactId: string, data: UpdateVendorContactRequest): Promise<VendorContact> {
    return this.request<VendorContact>(`/api/vendors/${vendorId}/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteContact(vendorId: string, contactId: string): Promise<void> {
    await this.request<void>(`/api/vendors/${vendorId}/contacts/${contactId}`, { method: "DELETE" });
  }
}

export const vendorsClient = new VendorsClient();
