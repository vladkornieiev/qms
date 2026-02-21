export interface Vendor {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  website?: string;
  billingAddress?: Record<string, unknown>;
  notes?: string;
  externalAccountingId?: string;
  paymentInfo?: Record<string, unknown>;
  customFields?: Record<string, unknown>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorContact {
  id: string;
  vendorId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt?: string;
}

export interface CreateVendorRequest {
  name: string;
  type?: string;
  email?: string;
  phone?: string;
  website?: string;
  billingAddress?: Record<string, unknown>;
  notes?: string;
  paymentInfo?: Record<string, unknown>;
  customFields?: Record<string, unknown>;
}

export interface UpdateVendorRequest {
  name?: string;
  type?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CreateVendorContactRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary?: boolean;
}

export interface UpdateVendorContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary?: boolean;
}

export interface PaginatedVendorResponse {
  items: Vendor[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
