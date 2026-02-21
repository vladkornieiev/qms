/**
 * Organization-related types
 */

import type { PaginatedResponse } from "./base.types";

export interface Organization {
  id: string;
  name: string;
  email?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Backward-compatible alias
export type Account = Organization;

export type PaginatedOrganizationsResponse = PaginatedResponse<Organization>;
export type PaginatedAccountsResponse = PaginatedOrganizationsResponse;
