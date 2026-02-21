import { BaseApiClient } from "./base-client";
import type {
  Contract, PaginatedContractResponse,
  CreateContractRequest, UpdateContractRequest, ContractSignRequest
} from "../api-types/contract.types";

class ContractsClient extends BaseApiClient {
  async list(params?: { query?: string; status?: string; contractType?: string; clientId?: string; projectId?: string; page?: number; size?: number }): Promise<PaginatedContractResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedContractResponse>(`/api/contracts${query}`);
  }

  async get(id: string): Promise<Contract> {
    return this.request<Contract>(`/api/contracts/${id}`);
  }

  async create(data: CreateContractRequest): Promise<Contract> {
    return this.request<Contract>("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateContractRequest): Promise<Contract> {
    return this.request<Contract>(`/api/contracts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/contracts/${id}`, { method: "DELETE" });
  }

  async send(id: string): Promise<Contract> {
    return this.request<Contract>(`/api/contracts/${id}/send`, { method: "POST" });
  }

  async sign(id: string, data: ContractSignRequest): Promise<Contract> {
    return this.request<Contract>(`/api/contracts/${id}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
}

export const contractsClient = new ContractsClient();
