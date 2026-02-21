import { BaseApiClient } from "./base-client";
import type {
  Template, TemplateDetail, PaginatedTemplateResponse,
  CreateTemplateRequest, UpdateTemplateRequest,
  TemplateItem, CreateTemplateItemRequest, UpdateTemplateItemRequest,
  TemplateApplyRequest, TemplateApplyResponse
} from "../api-types/template.types";

class TemplatesClient extends BaseApiClient {
  async list(params?: { query?: string; templateType?: string; page?: number; size?: number }): Promise<PaginatedTemplateResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedTemplateResponse>(`/api/templates${query}`);
  }

  async get(id: string): Promise<TemplateDetail> {
    return this.request<TemplateDetail>(`/api/templates/${id}`);
  }

  async create(data: CreateTemplateRequest): Promise<Template> {
    return this.request<Template>("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateTemplateRequest): Promise<Template> {
    return this.request<Template>(`/api/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/templates/${id}`, { method: "DELETE" });
  }

  async clone(id: string): Promise<TemplateDetail> {
    return this.request<TemplateDetail>(`/api/templates/${id}/clone`, { method: "POST" });
  }

  async apply(id: string, data: TemplateApplyRequest): Promise<TemplateApplyResponse> {
    return this.request<TemplateApplyResponse>(`/api/templates/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  // Template Items
  async listItems(templateId: string): Promise<TemplateItem[]> {
    return this.request<TemplateItem[]>(`/api/templates/${templateId}/items`);
  }

  async createItem(templateId: string, data: CreateTemplateItemRequest): Promise<TemplateItem> {
    return this.request<TemplateItem>(`/api/templates/${templateId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateItem(templateId: string, itemId: string, data: UpdateTemplateItemRequest): Promise<TemplateItem> {
    return this.request<TemplateItem>(`/api/templates/${templateId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteItem(templateId: string, itemId: string): Promise<void> {
    await this.request<void>(`/api/templates/${templateId}/items/${itemId}`, { method: "DELETE" });
  }
}

export const templatesClient = new TemplatesClient();
