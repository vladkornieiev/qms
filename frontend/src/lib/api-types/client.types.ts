export interface Client {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  website?: string;
  billingAddress?: Record<string, unknown>;
  shippingAddress?: Record<string, unknown>;
  notes?: string;
  externalAccountingId?: string;
  pricingTier?: string;
  customFields?: Record<string, unknown>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientContact {
  id: string;
  clientId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt?: string;
}

export interface CreateClientRequest {
  name: string;
  type?: string;
  email?: string;
  phone?: string;
  website?: string;
  billingAddress?: Record<string, unknown>;
  shippingAddress?: Record<string, unknown>;
  notes?: string;
  pricingTier?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateClientRequest {
  name?: string;
  type?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  isActive?: boolean;
  pricingTier?: string;
}

export interface CreateClientContactRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary?: boolean;
}

export interface UpdateClientContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary?: boolean;
}

export interface PaginatedClientResponse {
  items: Client[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
