import { BaseApiClient } from "./base-client";
import type {
  Project, ProjectDetail, PaginatedProjectResponse,
  CreateProjectRequest, UpdateProjectRequest,
  ProjectDateRange, CreateProjectDateRangeRequest, UpdateProjectDateRangeRequest,
  ProjectResourceAssignment, CreateProjectResourceRequest, UpdateProjectResourceRequest,
  ProjectProductAssignment, CreateProjectProductRequest, UpdateProjectProductRequest,
  ProjectCalendarEntry
} from "../api-types/project.types";

class ProjectsClient extends BaseApiClient {
  // Projects CRUD
  async list(params?: { query?: string; status?: string; clientId?: string; page?: number; size?: number; sort?: string }): Promise<PaginatedProjectResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedProjectResponse>(`/api/projects${query}`);
  }

  async get(id: string): Promise<ProjectDetail> {
    return this.request<ProjectDetail>(`/api/projects/${id}`);
  }

  async create(data: CreateProjectRequest): Promise<Project> {
    return this.request<Project>("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateProjectRequest): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/projects/${id}`, { method: "DELETE" });
  }

  async updateStatus(id: string, status: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async recalculate(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}/recalculate`, { method: "POST" });
  }

  // Date Ranges
  async listDateRanges(projectId: string): Promise<ProjectDateRange[]> {
    return this.request<ProjectDateRange[]>(`/api/projects/${projectId}/date-ranges`);
  }

  async createDateRange(projectId: string, data: CreateProjectDateRangeRequest): Promise<ProjectDateRange> {
    return this.request<ProjectDateRange>(`/api/projects/${projectId}/date-ranges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateDateRange(projectId: string, rangeId: string, data: UpdateProjectDateRangeRequest): Promise<ProjectDateRange> {
    return this.request<ProjectDateRange>(`/api/projects/${projectId}/date-ranges/${rangeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteDateRange(projectId: string, rangeId: string): Promise<void> {
    await this.request<void>(`/api/projects/${projectId}/date-ranges/${rangeId}`, { method: "DELETE" });
  }

  // Resources
  async listResources(projectId: string): Promise<ProjectResourceAssignment[]> {
    return this.request<ProjectResourceAssignment[]>(`/api/projects/${projectId}/resources`);
  }

  async assignResource(projectId: string, data: CreateProjectResourceRequest): Promise<ProjectResourceAssignment> {
    return this.request<ProjectResourceAssignment>(`/api/projects/${projectId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateResource(projectId: string, prId: string, data: UpdateProjectResourceRequest): Promise<ProjectResourceAssignment> {
    return this.request<ProjectResourceAssignment>(`/api/projects/${projectId}/resources/${prId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async removeResource(projectId: string, prId: string): Promise<void> {
    await this.request<void>(`/api/projects/${projectId}/resources/${prId}`, { method: "DELETE" });
  }

  async confirmResource(projectId: string, prId: string): Promise<ProjectResourceAssignment> {
    return this.request<ProjectResourceAssignment>(`/api/projects/${projectId}/resources/${prId}/confirm`, { method: "POST" });
  }

  // Products
  async listProducts(projectId: string): Promise<ProjectProductAssignment[]> {
    return this.request<ProjectProductAssignment[]>(`/api/projects/${projectId}/products`);
  }

  async assignProduct(projectId: string, data: CreateProjectProductRequest): Promise<ProjectProductAssignment> {
    return this.request<ProjectProductAssignment>(`/api/projects/${projectId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateProduct(projectId: string, ppId: string, data: UpdateProjectProductRequest): Promise<ProjectProductAssignment> {
    return this.request<ProjectProductAssignment>(`/api/projects/${projectId}/products/${ppId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async removeProduct(projectId: string, ppId: string): Promise<void> {
    await this.request<void>(`/api/projects/${projectId}/products/${ppId}`, { method: "DELETE" });
  }

  async checkOutProduct(projectId: string, ppId: string): Promise<ProjectProductAssignment> {
    return this.request<ProjectProductAssignment>(`/api/projects/${projectId}/products/${ppId}/check-out`, { method: "POST" });
  }

  async returnProduct(projectId: string, ppId: string): Promise<ProjectProductAssignment> {
    return this.request<ProjectProductAssignment>(`/api/projects/${projectId}/products/${ppId}/return`, { method: "POST" });
  }

  // Calendar
  async getCalendar(start: string, end: string): Promise<ProjectCalendarEntry[]> {
    return this.request<ProjectCalendarEntry[]>(`/api/projects/calendar?start=${start}&end=${end}`);
  }
}

export const projectsClient = new ProjectsClient();
