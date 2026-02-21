/**
 * User-related types
 */

import type { PaginatedResponse } from "./base.types";
import type { Organization } from "./organization.types";

export interface UserWithOrganization {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  emailConfirmed: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
}

// Backward-compatible alias
export type UserWithAccount = UserWithOrganization;

export interface CreateUserRequest {
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles?: string[];
  sendEmail?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  roles?: string[];
}

export type PaginatedUsersResponse = PaginatedResponse<UserWithOrganization>;
