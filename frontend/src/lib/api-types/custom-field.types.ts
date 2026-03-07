import type { PaginatedResponse } from "./base.types";

export type CustomFieldType =
  | "TEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "URL"
  | "EMAIL"
  | "PHONE"
  | "SELECT"
  | "MULTI_SELECT"
  | "FILE";

export interface CustomFieldDefinition {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  isRequired: boolean;
  options?: string[];
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomFieldGroup {
  id: string;
  name: string;
  description?: string;
  entityType: string;
  fields?: CustomFieldDefinition[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomFieldDefinitionRequest {
  fieldKey: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  isRequired?: boolean;
  options?: string[];
  displayOrder?: number;
}

export interface UpdateCustomFieldDefinitionRequest {
  fieldLabel?: string;
  fieldType?: CustomFieldType;
  isRequired?: boolean;
  options?: string[];
  displayOrder?: number;
}

export interface CreateCustomFieldGroupRequest {
  name: string;
  description?: string;
  entityType: string;
  fieldIds?: string[];
}

export interface UpdateCustomFieldGroupRequest {
  name?: string;
  description?: string;
  fieldIds?: string[];
}

export type PaginatedCustomFieldDefinitionsResponse =
  PaginatedResponse<CustomFieldDefinition>;
export type PaginatedCustomFieldGroupsResponse =
  PaginatedResponse<CustomFieldGroup>;
