/**
 * Central export point for all API clients
 * Import clients from here instead of individual files
 */

// Export client classes for advanced use cases
export { BaseApiClient } from "./base-client";
export { OrganizationsApiClient } from "./organizations-client";
export { UsersApiClient } from "./users-client";

// Backward-compatible alias
export { OrganizationsApiClient as AccountsApiClient } from "./organizations-client";

// Export singleton instances (recommended for most use cases)
import { OrganizationsApiClient } from "./organizations-client";
import { UsersApiClient } from "./users-client";

export const organizationsApi = new OrganizationsApiClient();
export const usersApi = new UsersApiClient();

// Backward-compatible alias
export const accountsApi = organizationsApi;
