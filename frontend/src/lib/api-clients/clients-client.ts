import { BaseApiClient } from "./base-client";
import type {
  Client, ClientContact, PaginatedClientResponse,
  CreateClientRequest, UpdateClientRequest,
  CreateClientContactRequest, UpdateClientContactRequest
} from "../api-types/client.types";

class ClientsClient extends BaseApiClient {
  async list(params?: { query?: string; type?: string; isActive?: boolean; page?: number; size?: number; sortBy?: string; order?: string }): Promise<PaginatedClientResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedClientResponse>(`/api/clients${query}`);
  }

  async get(id: string): Promise<Client> {
    return this.request<Client>(`/api/clients/${id}`);
  }

  async create(data: CreateClientRequest): Promise<Client> {
    return this.request<Client>("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateClientRequest): Promise<Client> {
    return this.request<Client>(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/clients/${id}`, { method: "DELETE" });
  }

  async listContacts(clientId: string): Promise<ClientContact[]> {
    return this.request<ClientContact[]>(`/api/clients/${clientId}/contacts`);
  }

  async createContact(clientId: string, data: CreateClientContactRequest): Promise<ClientContact> {
    return this.request<ClientContact>(`/api/clients/${clientId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateContact(clientId: string, contactId: string, data: UpdateClientContactRequest): Promise<ClientContact> {
    return this.request<ClientContact>(`/api/clients/${clientId}/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteContact(clientId: string, contactId: string): Promise<void> {
    await this.request<void>(`/api/clients/${clientId}/contacts/${contactId}`, { method: "DELETE" });
  }
}

export const clientsClient = new ClientsClient();
