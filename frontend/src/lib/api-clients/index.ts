/**
 * Central export point for all API clients
 * Import clients from here instead of individual files
 */

// Export client classes for advanced use cases
export { BaseApiClient } from "./base-client";
export { OrganizationsApiClient } from "./organizations-client";
export { UsersApiClient } from "./users-client";
export { TagsApiClient } from "./tags-client";
export { CustomFieldsApiClient } from "./custom-fields-client";

// Backward-compatible alias
export { OrganizationsApiClient as AccountsApiClient } from "./organizations-client";

// Export singleton instances (recommended for most use cases)
import { OrganizationsApiClient } from "./organizations-client";
import { UsersApiClient } from "./users-client";
import { TagsApiClient } from "./tags-client";
import { CustomFieldsApiClient } from "./custom-fields-client";

export const organizationsApi = new OrganizationsApiClient();
export const usersApi = new UsersApiClient();
export const tagsApi = new TagsApiClient();
export const customFieldsApi = new CustomFieldsApiClient();

// Backward-compatible alias
export const accountsApi = organizationsApi;
