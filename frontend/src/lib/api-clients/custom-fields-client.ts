import { BaseApiClient } from "./base-client";
import type {
  CustomFieldDefinition,
  CustomFieldGroup,
  CreateCustomFieldDefinitionRequest,
  UpdateCustomFieldDefinitionRequest,
  CreateCustomFieldGroupRequest,
  UpdateCustomFieldGroupRequest,
  PaginatedCustomFieldDefinitionsResponse,
  PaginatedCustomFieldGroupsResponse,
} from "../api-types";

export class CustomFieldsApiClient extends BaseApiClient {
  // ---- Definitions ----

  async listDefinitions(
    params: {
      query?: string;
      entityType?: string;
      distinct?: boolean;
      page?: number;
      size?: number;
      sortBy?: string;
      order?: string;
    } = {}
  ): Promise<PaginatedCustomFieldDefinitionsResponse> {
    const qs = this.buildQueryString(params);
    return this.request(`/api/custom-field-definitions${qs}`);
  }

  async createDefinition(
    data: CreateCustomFieldDefinitionRequest
  ): Promise<CustomFieldDefinition> {
    return this.request("/api/custom-field-definitions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDefinition(id: string): Promise<CustomFieldDefinition> {
    return this.request(`/api/custom-field-definitions/${id}`);
  }

  async updateDefinition(
    id: string,
    data: UpdateCustomFieldDefinitionRequest
  ): Promise<CustomFieldDefinition> {
    return this.request(`/api/custom-field-definitions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteDefinition(id: string): Promise<void> {
    return this.request(`/api/custom-field-definitions/${id}`, {
      method: "DELETE",
    });
  }

  // ---- Groups ----

  async listGroups(
    params: {
      query?: string;
      entityType?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      order?: string;
    } = {}
  ): Promise<PaginatedCustomFieldGroupsResponse> {
    const qs = this.buildQueryString(params);
    return this.request(`/api/custom-field-groups${qs}`);
  }

  async createGroup(
    data: CreateCustomFieldGroupRequest
  ): Promise<CustomFieldGroup> {
    return this.request("/api/custom-field-groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getGroup(id: string): Promise<CustomFieldGroup> {
    return this.request(`/api/custom-field-groups/${id}`);
  }

  async updateGroup(
    id: string,
    data: UpdateCustomFieldGroupRequest
  ): Promise<CustomFieldGroup> {
    return this.request(`/api/custom-field-groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(id: string): Promise<void> {
    return this.request(`/api/custom-field-groups/${id}`, {
      method: "DELETE",
    });
  }
}
