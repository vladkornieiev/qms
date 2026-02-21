export interface TagGroup {
  id: string;
  name: string;
  color?: string;
  description?: string;
  createdAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  tagGroupId?: string;
  tagGroupName?: string;
  createdAt?: string;
}

export interface CreateTagGroupRequest {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateTagGroupRequest {
  name?: string;
  color?: string;
  description?: string;
}

export interface CreateTagRequest {
  name: string;
  color?: string;
  tagGroupId?: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
  tagGroupId?: string;
}
