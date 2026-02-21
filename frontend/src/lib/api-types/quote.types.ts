export interface InboundRequest {
  id: string;
  submitterName?: string;
  submitterEmail?: string;
  submitterPhone?: string;
  submitterCompany?: string;
  clientId?: string;
  templateId?: string;
  formData: Record<string, unknown>;
  status: string;
  reviewedById?: string;
  reviewedAt?: string;
  denialReason?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedInboundRequestResponse {
  items: InboundRequest[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateInboundRequestRequest {
  submitterName?: string;
  submitterEmail?: string;
  submitterPhone?: string;
  submitterCompany?: string;
  clientId?: string;
  templateId?: string;
  formData?: Record<string, unknown>;
}

export interface Quote {
  id: string;
  projectId?: string;
  clientId?: string;
  clientName?: string;
  quoteNumber: string;
  version: number;
  title?: string;
  status: string;
  issuedDate?: string;
  validUntil?: string;
  approvedAt?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  internalNotes?: string;
  terms?: string;
  externalAccountingId?: string;
  approvedByName?: string;
  approvedByEmail?: string;
  customFields: Record<string, unknown>;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteDetail extends Quote {
  lineItems: QuoteLineItem[];
}

export interface PaginatedQuoteResponse {
  items: Quote[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateQuoteRequest {
  clientId: string;
  projectId?: string;
  title?: string;
  issuedDate?: string;
  validUntil?: string;
  currency?: string;
  notes?: string;
  internalNotes?: string;
  terms?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateQuoteRequest {
  title?: string | null;
  status?: string | null;
  issuedDate?: string | null;
  validUntil?: string | null;
  currency?: string | null;
  notes?: string | null;
  internalNotes?: string | null;
  terms?: string | null;
  externalAccountingId?: string | null;
  customFields?: Record<string, unknown> | null;
}

export interface QuoteLineItem {
  id: string;
  quoteId: string;
  productId?: string;
  resourceId?: string;
  categoryId?: string;
  description: string;
  dateStart?: string;
  dateEnd?: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  lineTotal: number;
  costPerUnit?: number;
  costTotal?: number;
  section?: string;
  displayOrder: number;
  isVisible: boolean;
  notes?: string;
  createdAt: string;
}

export interface CreateQuoteLineItemRequest {
  productId?: string;
  resourceId?: string;
  categoryId?: string;
  description: string;
  dateStart?: string;
  dateEnd?: string;
  quantity?: number;
  unitPrice?: number;
  unit?: string;
  discountPercent?: number;
  discountAmount?: number;
  taxRate?: number;
  costPerUnit?: number;
  section?: string;
  displayOrder?: number;
  isVisible?: boolean;
  notes?: string;
}

export interface UpdateQuoteLineItemRequest {
  description?: string | null;
  dateStart?: string | null;
  dateEnd?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  unit?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  taxRate?: number | null;
  costPerUnit?: number | null;
  section?: string | null;
  displayOrder?: number | null;
  isVisible?: boolean | null;
  notes?: string | null;
}
