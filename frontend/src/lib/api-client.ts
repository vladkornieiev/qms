/**
 * API Client - Central export point
 *
 * This file re-exports all API types and clients for backward compatibility.
 * Import from here to maintain existing import paths across the codebase.
 */

// Re-export all types from centralized location
export type {
  // Base types
  PaginatedResponse,
  Location,
  Picture,
  // Organization types
  Organization,
  PaginatedOrganizationsResponse,
  // User types
  UserWithOrganization,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedUsersResponse,
  // Tag types
  TagSummary,
  TagGroup,
  Tag,
  CreateTagGroupRequest,
  UpdateTagGroupRequest,
  CreateTagRequest,
  UpdateTagRequest,
  PaginatedTagGroupsResponse,
  PaginatedTagsResponse,
  // Custom field types
  CustomFieldType,
  CustomFieldDefinition,
  CustomFieldGroup,
  CreateCustomFieldDefinitionRequest,
  UpdateCustomFieldDefinitionRequest,
  CreateCustomFieldGroupRequest,
  UpdateCustomFieldGroupRequest,
  PaginatedCustomFieldDefinitionsResponse,
  PaginatedCustomFieldGroupsResponse,
  // Entity extension types
  CustomFieldValueResponse,
  CustomFieldFilter,
  // Client types
  Address,
  ClientResponse,
  ClientListItem,
  CreateClientRequest,
  UpdateClientRequest,
  SearchClientsRequest,
  PaginatedClientsResponse,
} from "./api-types";

// Re-export client classes
export {
  BaseApiClient,
  OrganizationsApiClient,
  UsersApiClient,
  TagsApiClient,
  CustomFieldsApiClient,
  ClientsApiClient,
} from "./api-clients";

// Re-export singleton instances
export {
  organizationsApi,
  usersApi,
  tagsApi,
  customFieldsApi,
  clientsApi,
} from "./api-clients";
