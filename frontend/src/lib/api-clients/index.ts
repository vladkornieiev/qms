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
export { ClientsApiClient } from "./clients-client";

// Export singleton instances (recommended for most use cases)
import { OrganizationsApiClient } from "./organizations-client";
import { UsersApiClient } from "./users-client";
import { TagsApiClient } from "./tags-client";
import { CustomFieldsApiClient } from "./custom-fields-client";
import { ClientsApiClient } from "./clients-client";

export const organizationsApi = new OrganizationsApiClient();
export const usersApi = new UsersApiClient();
export const tagsApi = new TagsApiClient();
export const customFieldsApi = new CustomFieldsApiClient();
export const clientsApi = new ClientsApiClient();
