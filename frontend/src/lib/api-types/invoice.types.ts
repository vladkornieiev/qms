export interface Invoice {
  id: string;
  quoteId?: string;
  projectId?: string;
  clientId?: string;
  clientName?: string;
  invoiceNumber: string;
  status: string;
  issuedDate?: string;
  dueDate?: string;
  paidAt?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  externalAccountingId?: string;
  notes?: string;
  internalNotes?: string;
  terms?: string;
  customFields: Record<string, unknown>;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceDetail extends Invoice {
  lineItems: InvoiceLineItem[];
  payments: Payment[];
}

export interface PaginatedInvoiceResponse {
  items: Invoice[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateInvoiceRequest {
  clientId: string;
  projectId?: string;
  quoteId?: string;
  issuedDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  internalNotes?: string;
  terms?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateInvoiceRequest {
  status?: string | null;
  issuedDate?: string | null;
  dueDate?: string | null;
  currency?: string | null;
  notes?: string | null;
  internalNotes?: string | null;
  terms?: string | null;
  externalAccountingId?: string | null;
  customFields?: Record<string, unknown> | null;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  quoteLineItemId?: string;
  productId?: string;
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
  section?: string;
  displayOrder: number;
  notes?: string;
  createdAt: string;
}

export interface CreateInvoiceLineItemRequest {
  productId?: string;
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
  section?: string;
  displayOrder?: number;
  notes?: string;
}

export interface UpdateInvoiceLineItemRequest {
  description?: string | null;
  dateStart?: string | null;
  dateEnd?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  unit?: string | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  taxRate?: number | null;
  section?: string | null;
  displayOrder?: number | null;
  notes?: string | null;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate: string;
  notes?: string;
  externalPaymentId?: string;
  createdAt: string;
}

export interface PaginatedPaymentResponse {
  items: Payment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreatePaymentRequest {
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  paymentReference?: string;
  currency?: string;
  notes?: string;
}
