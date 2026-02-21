export interface Project {
  id: string;
  clientId?: string;
  clientName?: string;
  projectNumber: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  venueName?: string;
  location?: Record<string, unknown>;
  onsiteContact?: Record<string, unknown>;
  totalBillable: number;
  totalCost: number;
  totalProfit: number;
  externalAccountingId?: string;
  source?: string;
  inboundRequestId?: string;
  customFields: Record<string, unknown>;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  dateRanges: ProjectDateRange[];
  resources: ProjectResourceAssignment[];
  products: ProjectProductAssignment[];
}

export interface PaginatedProjectResponse {
  items: Project[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateProjectRequest {
  clientId?: string;
  title: string;
  description?: string;
  priority?: string;
  venueName?: string;
  location?: Record<string, unknown>;
  onsiteContact?: Record<string, unknown>;
  externalAccountingId?: string;
  source?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateProjectRequest {
  clientId?: string | null;
  title?: string | null;
  description?: string | null;
  priority?: string | null;
  venueName?: string | null;
  location?: Record<string, unknown> | null;
  onsiteContact?: Record<string, unknown> | null;
  externalAccountingId?: string | null;
  source?: string | null;
  customFields?: Record<string, unknown> | null;
}

export interface ProjectDateRange {
  id: string;
  projectId: string;
  dateStart: string;
  dateEnd: string;
  label?: string;
  rateMultiplier: number;
  notes?: string;
  displayOrder: number;
  createdAt: string;
}

export interface CreateProjectDateRangeRequest {
  dateStart: string;
  dateEnd: string;
  label?: string;
  rateMultiplier?: number;
  notes?: string;
  displayOrder?: number;
}

export interface UpdateProjectDateRangeRequest {
  dateStart?: string | null;
  dateEnd?: string | null;
  label?: string | null;
  rateMultiplier?: number | null;
  notes?: string | null;
  displayOrder?: number | null;
}

export interface ProjectResourceAssignment {
  id: string;
  projectId: string;
  resourceId: string;
  resourceName: string;
  role?: string;
  billRate?: number;
  payRate?: number;
  rateUnit: string;
  perDiem?: number;
  dateRangeIds?: string[];
  status: string;
  confirmedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectResourceRequest {
  resourceId: string;
  role?: string;
  billRate?: number;
  payRate?: number;
  rateUnit?: string;
  perDiem?: number;
  dateRangeIds?: string[];
  notes?: string;
}

export interface UpdateProjectResourceRequest {
  role?: string | null;
  billRate?: number | null;
  payRate?: number | null;
  rateUnit?: string | null;
  perDiem?: number | null;
  dateRangeIds?: string[] | null;
  notes?: string | null;
}

export interface ProjectProductAssignment {
  id: string;
  projectId: string;
  productId: string;
  productName: string;
  inventoryItemId?: string;
  vendorId?: string;
  vendorName?: string;
  quantity: number;
  billRate?: number;
  costRate?: number;
  rateUnit: string;
  status: string;
  checkedOutAt?: string;
  returnedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectProductRequest {
  productId: string;
  inventoryItemId?: string;
  vendorId?: string;
  quantity?: number;
  billRate?: number;
  costRate?: number;
  rateUnit?: string;
  notes?: string;
}

export interface UpdateProjectProductRequest {
  vendorId?: string | null;
  quantity?: number | null;
  billRate?: number | null;
  costRate?: number | null;
  rateUnit?: string | null;
  notes?: string | null;
}

export interface ProjectCalendarEntry {
  projectId: string;
  projectNumber: string;
  title: string;
  status: string;
  clientName?: string;
  dateStart: string;
  dateEnd: string;
  label?: string;
}
