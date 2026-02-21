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
  Account,
  PaginatedOrganizationsResponse,
  PaginatedAccountsResponse,
  // User types
  UserWithOrganization,
  UserWithAccount,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedUsersResponse,
} from "./api-types";

// Re-export client classes
export {
  BaseApiClient,
  OrganizationsApiClient,
  AccountsApiClient,
  UsersApiClient,
} from "./api-clients";

// Re-export singleton instances
export {
  organizationsApi,
  accountsApi,
  usersApi,
} from "./api-clients";
