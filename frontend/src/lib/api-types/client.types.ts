import type { PaginatedResponse } from "./base.types";
import type { TagSummary } from "./tag.types";
import type { CustomFieldValueResponse, CustomFieldFilter } from "./entity-extensions.types";

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface ClientResponse {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  website?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  notes?: string;
  externalAccountingId?: string;
  pricingTier?: string;
  isActive: boolean;
  tags?: TagSummary[];
  customFieldValues?: CustomFieldValueResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientListItem {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  tags?: TagSummary[];
  createdAt?: string;
}

export interface CustomFieldValueInput {
  customFieldId: string;
  value: unknown;
}

export interface CreateClientRequest {
  name: string;
  type?: "COMPANY" | "INDIVIDUAL";
  email?: string;
  phone?: string;
  website?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  notes?: string;
  externalAccountingId?: string;
  pricingTier?: string;
  tagIds?: string[];
  customFieldValues?: CustomFieldValueInput[];
}

export interface UpdateClientRequest {
  name?: string;
  type?: "COMPANY" | "INDIVIDUAL";
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  billingAddress?: Address | null;
  shippingAddress?: Address | null;
  notes?: string | null;
  externalAccountingId?: string | null;
  pricingTier?: string | null;
  isActive?: boolean;
  tagIds?: string[];
  customFieldValues?: CustomFieldValueInput[];
}

export interface SearchClientsRequest {
  query?: string;
  type?: string;
  isActive?: boolean;
  tagIds?: string[];
  customFieldFilters?: CustomFieldFilter[];
  page?: number;
  size?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export type PaginatedClientsResponse = PaginatedResponse<ClientListItem>;
