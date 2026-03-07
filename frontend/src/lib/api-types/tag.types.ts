import type { PaginatedResponse } from "./base.types";

export interface TagSummary {
  id: string;
  name: string;
  color?: string;
}

export interface TagGroup {
  id: string;
  name: string;
  color?: string;
  description?: string;
  tags?: TagSummary[];
  referenceCount?: number;
  createdAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  referenceCount?: number;
  createdAt?: string;
}

export interface CreateTagGroupRequest {
  name: string;
  color?: string;
  description?: string;
  tagIds?: string[];
}

export interface UpdateTagGroupRequest {
  name?: string;
  color?: string;
  description?: string;
  tagIds?: string[];
}

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
}

export type PaginatedTagGroupsResponse = PaginatedResponse<TagGroup>;
export type PaginatedTagsResponse = PaginatedResponse<Tag>;
