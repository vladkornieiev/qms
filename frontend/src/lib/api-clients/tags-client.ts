import { BaseApiClient } from "./base-client";
import type {
  TagGroup,
  Tag,
  CreateTagGroupRequest,
  UpdateTagGroupRequest,
  CreateTagRequest,
  UpdateTagRequest,
  PaginatedTagGroupsResponse,
  PaginatedTagsResponse,
} from "../api-types";

export class TagsApiClient extends BaseApiClient {
  // ---- Tag Groups ----

  async listTagGroups(
    params: {
      query?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      order?: string;
    } = {}
  ): Promise<PaginatedTagGroupsResponse> {
    const qs = this.buildQueryString(params);
    return this.request(`/api/tag-groups${qs}`);
  }

  async createTagGroup(data: CreateTagGroupRequest): Promise<TagGroup> {
    return this.request("/api/tag-groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTagGroup(id: string): Promise<TagGroup> {
    return this.request(`/api/tag-groups/${id}`);
  }

  async updateTagGroup(
    id: string,
    data: UpdateTagGroupRequest
  ): Promise<TagGroup> {
    return this.request(`/api/tag-groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTagGroup(id: string): Promise<void> {
    return this.request(`/api/tag-groups/${id}`, { method: "DELETE" });
  }

  // ---- Tags ----

  async listTags(
    params: {
      query?: string;
      page?: number;
      size?: number;
      sortBy?: string;
      order?: string;
      entityType?: string;
      distinct?: boolean;
    } = {}
  ): Promise<PaginatedTagsResponse> {
    const qs = this.buildQueryString(params);
    return this.request(`/api/tags${qs}`);
  }

  async createTag(data: CreateTagRequest): Promise<Tag> {
    return this.request("/api/tags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTag(id: string): Promise<Tag> {
    return this.request(`/api/tags/${id}`);
  }

  async updateTag(id: string, data: UpdateTagRequest): Promise<Tag> {
    return this.request(`/api/tags/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTag(id: string): Promise<void> {
    return this.request(`/api/tags/${id}`, { method: "DELETE" });
  }
}
