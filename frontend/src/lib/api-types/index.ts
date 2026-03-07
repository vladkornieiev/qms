/**
 * Central export point for all API types
 * Import types from here instead of individual files
 */

// Base types
export type {
  PaginatedResponse,
  Location,
  Picture,
} from "./base.types";

// Organization types
export type {
  Organization,
  PaginatedOrganizationsResponse,
} from "./organization.types";

// User types
export type {
  UserWithOrganization,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedUsersResponse,
} from "./user.types";

// Tag types
export type {
  TagSummary,
  TagGroup,
  Tag,
  CreateTagGroupRequest,
  UpdateTagGroupRequest,
  CreateTagRequest,
  UpdateTagRequest,
  PaginatedTagGroupsResponse,
  PaginatedTagsResponse,
} from "./tag.types";

// Custom field types
export type {
  CustomFieldType,
  CustomFieldDefinition,
  CustomFieldGroup,
  CreateCustomFieldDefinitionRequest,
  UpdateCustomFieldDefinitionRequest,
  CreateCustomFieldGroupRequest,
  UpdateCustomFieldGroupRequest,
  PaginatedCustomFieldDefinitionsResponse,
  PaginatedCustomFieldGroupsResponse,
} from "./custom-field.types";

// Entity extension types
export type {
  CustomFieldValueResponse,
  CustomFieldFilter,
} from "./entity-extensions.types";

// Client types
export type {
  Address,
  ClientResponse,
  ClientListItem,
  CreateClientRequest,
  UpdateClientRequest,
  SearchClientsRequest,
  PaginatedClientsResponse,
} from "./client.types";
