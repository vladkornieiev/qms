import { BaseApiClient } from "./base-client";
import type {
  CustomFieldDefinition,
  CreateCustomFieldDefinitionRequest,
  UpdateCustomFieldDefinitionRequest
} from "../api-types/custom-field.types";

class CustomFieldsClient extends BaseApiClient {
  async listDefinitions(entityType: string): Promise<CustomFieldDefinition[]> {
    return this.request<CustomFieldDefinition[]>(`/api/custom-fields/${entityType}`);
  }

  async createDefinition(entityType: string, data: CreateCustomFieldDefinitionRequest): Promise<CustomFieldDefinition> {
    return this.request<CustomFieldDefinition>(`/api/custom-fields/${entityType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateDefinition(entityType: string, id: string, data: UpdateCustomFieldDefinitionRequest): Promise<CustomFieldDefinition> {
    return this.request<CustomFieldDefinition>(`/api/custom-fields/${entityType}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteDefinition(entityType: string, id: string): Promise<void> {
    await this.request<void>(`/api/custom-fields/${entityType}/${id}`, { method: "DELETE" });
  }
}

export const customFieldsClient = new CustomFieldsClient();
