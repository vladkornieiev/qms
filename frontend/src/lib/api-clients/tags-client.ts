import { BaseApiClient } from "./base-client";
import type { TagGroup, Tag, CreateTagGroupRequest, UpdateTagGroupRequest, CreateTagRequest, UpdateTagRequest } from "../api-types/tag.types";

class TagsClient extends BaseApiClient {
  async listTagGroups(): Promise<TagGroup[]> {
    return this.request<TagGroup[]>("/api/tag-groups");
  }

  async getTagGroup(id: string): Promise<TagGroup> {
    return this.request<TagGroup>(`/api/tag-groups/${id}`);
  }

  async createTagGroup(data: CreateTagGroupRequest): Promise<TagGroup> {
    return this.request<TagGroup>("/api/tag-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateTagGroup(id: string, data: UpdateTagGroupRequest): Promise<TagGroup> {
    return this.request<TagGroup>(`/api/tag-groups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteTagGroup(id: string): Promise<void> {
    await this.request<void>(`/api/tag-groups/${id}`, { method: "DELETE" });
  }

  async listTags(params?: { groupId?: string; search?: string }): Promise<Tag[]> {
    const query = this.buildQueryString(params || {});
    return this.request<Tag[]>(`/api/tags${query}`);
  }

  async getTag(id: string): Promise<Tag> {
    return this.request<Tag>(`/api/tags/${id}`);
  }

  async createTag(data: CreateTagRequest): Promise<Tag> {
    return this.request<Tag>("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateTag(id: string, data: UpdateTagRequest): Promise<Tag> {
    return this.request<Tag>(`/api/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteTag(id: string): Promise<void> {
    await this.request<void>(`/api/tags/${id}`, { method: "DELETE" });
  }

  async getEntityTags(entityType: string, entityId: string): Promise<Tag[]> {
    return this.request<Tag[]>(`/api/tags/entity/${entityType}/${entityId}`);
  }

  async applyTag(entityType: string, entityId: string, tagId: string): Promise<void> {
    await this.request<void>(`/api/tags/entity/${entityType}/${entityId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    });
  }

  async removeTag(entityType: string, entityId: string, tagId: string): Promise<void> {
    await this.request<void>(`/api/tags/entity/${entityType}/${entityId}?tagId=${tagId}`, {
      method: "DELETE",
    });
  }
}

export const tagsClient = new TagsClient();
