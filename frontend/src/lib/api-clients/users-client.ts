/**
 * Users API client for managing users
 */

import { BaseApiClient } from "./base-client";
import type {
  UserWithOrganization,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedUsersResponse,
} from "../api-types";

export class UsersApiClient extends BaseApiClient {
  // Admin endpoints
  async getAllUsers(
    params: {
      firstName?: string;
      lastName?: string;
      email?: string;
      organizationId?: string;
      organizationName?: string;
      // Backward-compatible params
      name?: string;
      accountId?: string;
      accountName?: string;
      query?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      order?: string;
    } = {}
  ): Promise<PaginatedUsersResponse> {
    const query = this.buildQueryString(params);
    return this.request<PaginatedUsersResponse>(`/api/admin/users${query}`);
  }

  async createUser(
    data: Omit<CreateUserRequest, "organizationId">
  ): Promise<UserWithOrganization> {
    return this.request<UserWithOrganization>("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createAdminUser(data: CreateUserRequest): Promise<UserWithOrganization> {
    return this.request<UserWithOrganization>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserById(id: string): Promise<UserWithOrganization> {
    return this.request<UserWithOrganization>(`/api/admin/users/${id}`);
  }

  async updateUser(
    id: string,
    data: UpdateUserRequest
  ): Promise<UserWithOrganization> {
    return this.request<UserWithOrganization>(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/api/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  // Non-admin endpoint - accessible by ADMIN/OWNER
  async getUsers(
    params: {
      firstName?: string;
      lastName?: string;
      email?: string;
      name?: string;
      query?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      order?: string;
    } = {}
  ): Promise<PaginatedUsersResponse> {
    const query = this.buildQueryString(params);

    return this.request<PaginatedUsersResponse>(`/api/users${query}`);
  }
}
