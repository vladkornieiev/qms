export interface Resource {
  id: string;
  userId?: string;
  type: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  defaultDayRate?: number;
  defaultHourRate?: number;
  currency: string;
  customFields: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResourceResponse {
  items: Resource[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateResourceRequest {
  userId?: string;
  type?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  defaultDayRate?: number;
  defaultHourRate?: number;
  currency?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateResourceRequest {
  type?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  locationCountry?: string | null;
  defaultDayRate?: number | null;
  defaultHourRate?: number | null;
  currency?: string | null;
  customFields?: Record<string, unknown> | null;
  isActive?: boolean | null;
}

export interface ResourceAvailability {
  id: string;
  resourceId: string;
  dateStart: string;
  dateEnd: string;
  status: string;
  reason?: string;
  projectId?: string;
  createdAt: string;
}

export interface CreateResourceAvailabilityRequest {
  dateStart: string;
  dateEnd: string;
  status?: string;
  reason?: string;
  projectId?: string;
}

export interface ResourcePayout {
  id: string;
  resourceId: string;
  resourceName: string;
  projectId?: string;
  description?: string;
  amount: number;
  currency: string;
  status: string;
  approvedAt?: string;
  approvedById?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: string;
  periodStart?: string;
  periodEnd?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResourcePayoutResponse {
  items: ResourcePayout[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateResourcePayoutRequest {
  resourceId: string;
  projectId?: string;
  description?: string;
  amount: number;
  currency?: string;
  periodStart?: string;
  periodEnd?: string;
  notes?: string;
}
