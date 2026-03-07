import { BaseApiClient } from "./base-client";
import type {
  ClientResponse,
  CreateClientRequest,
  UpdateClientRequest,
  SearchClientsRequest,
  PaginatedClientsResponse,
} from "../api-types/client.types";

export class ClientsApiClient extends BaseApiClient {
  async searchClients(
    data: SearchClientsRequest
  ): Promise<PaginatedClientsResponse> {
    return this.request("/api/clients/search", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createClient(data: CreateClientRequest): Promise<ClientResponse> {
    return this.request("/api/clients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getClient(id: string): Promise<ClientResponse> {
    return this.request(`/api/clients/${id}`);
  }

  async updateClient(
    id: string,
    data: UpdateClientRequest
  ): Promise<ClientResponse> {
    return this.request(`/api/clients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string): Promise<void> {
    return this.request(`/api/clients/${id}`, { method: "DELETE" });
  }
}
