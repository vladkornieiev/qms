import { BaseApiClient } from "./base-client";
import type {
  Invoice, InvoiceDetail, PaginatedInvoiceResponse,
  CreateInvoiceRequest, UpdateInvoiceRequest,
  InvoiceLineItem, CreateInvoiceLineItemRequest, UpdateInvoiceLineItemRequest,
  Payment, PaginatedPaymentResponse, CreatePaymentRequest
} from "../api-types/invoice.types";

class InvoicesClient extends BaseApiClient {
  async list(params?: { query?: string; status?: string; clientId?: string; projectId?: string; page?: number; size?: number }): Promise<PaginatedInvoiceResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedInvoiceResponse>(`/api/invoices${query}`);
  }

  async get(id: string): Promise<InvoiceDetail> {
    return this.request<InvoiceDetail>(`/api/invoices/${id}`);
  }

  async create(data: CreateInvoiceRequest): Promise<Invoice> {
    return this.request<Invoice>("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async createFromQuote(quoteId: string): Promise<Invoice> {
    return this.request<Invoice>(`/api/invoices/from-quote/${quoteId}`, { method: "POST" });
  }

  async update(id: string, data: UpdateInvoiceRequest): Promise<Invoice> {
    return this.request<Invoice>(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/invoices/${id}`, { method: "DELETE" });
  }

  async send(id: string): Promise<Invoice> {
    return this.request<Invoice>(`/api/invoices/${id}/send`, { method: "POST" });
  }

  async voidInvoice(id: string): Promise<Invoice> {
    return this.request<Invoice>(`/api/invoices/${id}/void`, { method: "POST" });
  }

  async recalculate(id: string): Promise<Invoice> {
    return this.request<Invoice>(`/api/invoices/${id}/recalculate`, { method: "POST" });
  }

  // Line Items
  async listLineItems(invoiceId: string): Promise<InvoiceLineItem[]> {
    return this.request<InvoiceLineItem[]>(`/api/invoices/${invoiceId}/line-items`);
  }

  async createLineItem(invoiceId: string, data: CreateInvoiceLineItemRequest): Promise<InvoiceLineItem> {
    return this.request<InvoiceLineItem>(`/api/invoices/${invoiceId}/line-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateLineItem(invoiceId: string, lineId: string, data: UpdateInvoiceLineItemRequest): Promise<InvoiceLineItem> {
    return this.request<InvoiceLineItem>(`/api/invoices/${invoiceId}/line-items/${lineId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteLineItem(invoiceId: string, lineId: string): Promise<void> {
    await this.request<void>(`/api/invoices/${invoiceId}/line-items/${lineId}`, { method: "DELETE" });
  }

  // Payments
  async listPayments(invoiceId: string): Promise<Payment[]> {
    return this.request<Payment[]>(`/api/invoices/${invoiceId}/payments`);
  }

  async recordPayment(invoiceId: string, data: CreatePaymentRequest): Promise<Payment> {
    return this.request<Payment>(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
}

class PaymentsClient extends BaseApiClient {
  async list(params?: { page?: number; size?: number }): Promise<PaginatedPaymentResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedPaymentResponse>(`/api/payments${query}`);
  }

  async get(id: string): Promise<Payment> {
    return this.request<Payment>(`/api/payments/${id}`);
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/payments/${id}`, { method: "DELETE" });
  }
}

export const invoicesClient = new InvoicesClient();
export const paymentsClient = new PaymentsClient();
