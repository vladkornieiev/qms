export interface LookupList {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface LookupListDetail extends LookupList {
  items: LookupListItem[];
}

export interface LookupListItem {
  id: string;
  value: string;
  label: string;
  color?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  parentId?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CreateLookupListRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateLookupListRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateLookupListItemRequest {
  value: string;
  label: string;
  color?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  parentId?: string;
  displayOrder?: number;
}

export interface UpdateLookupListItemRequest {
  label?: string;
  color?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
  displayOrder?: number;
}
