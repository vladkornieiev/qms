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

export type PaginatedOrganizationsResponse = PaginatedResponse<Organization>;
