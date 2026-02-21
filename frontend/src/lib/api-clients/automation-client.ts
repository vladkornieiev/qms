import { BaseApiClient } from "./base-client";
import type {
  WorkflowRule,
  CreateWorkflowRuleRequest,
  UpdateWorkflowRuleRequest,
  PaginatedWorkflowRuleResponse,
  Integration,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  PaginatedSyncLogResponse,
} from "../api-types/automation.types";

class WorkflowRulesClient extends BaseApiClient {
  async list(params?: { page?: number; size?: number }): Promise<PaginatedWorkflowRuleResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedWorkflowRuleResponse>(`/api/workflow-rules${query}`);
  }

  async get(id: string): Promise<WorkflowRule> {
    return this.request<WorkflowRule>(`/api/workflow-rules/${id}`);
  }

  async create(data: CreateWorkflowRuleRequest): Promise<WorkflowRule> {
    return this.request<WorkflowRule>("/api/workflow-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateWorkflowRuleRequest): Promise<WorkflowRule> {
    return this.request<WorkflowRule>(`/api/workflow-rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/workflow-rules/${id}`, { method: "DELETE" });
  }

  async toggle(id: string): Promise<WorkflowRule> {
    return this.request<WorkflowRule>(`/api/workflow-rules/${id}/toggle`, { method: "POST" });
  }
}

class IntegrationsClient extends BaseApiClient {
  async list(): Promise<Integration[]> {
    return this.request<Integration[]>("/api/integrations");
  }

  async get(id: string): Promise<Integration> {
    return this.request<Integration>(`/api/integrations/${id}`);
  }

  async create(data: CreateIntegrationRequest): Promise<Integration> {
    return this.request<Integration>("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateIntegrationRequest): Promise<Integration> {
    return this.request<Integration>(`/api/integrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/integrations/${id}`, { method: "DELETE" });
  }

  async sync(id: string): Promise<Integration> {
    return this.request<Integration>(`/api/integrations/${id}/sync`, { method: "POST" });
  }

  async getSyncLog(id: string, params?: { page?: number; size?: number }): Promise<PaginatedSyncLogResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedSyncLogResponse>(`/api/integrations/${id}/sync-log${query}`);
  }
}

export const workflowRulesClient = new WorkflowRulesClient();
export const integrationsClient = new IntegrationsClient();
