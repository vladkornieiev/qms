import { BaseApiClient } from "./base-client";
import type {
  InboundRequest, PaginatedInboundRequestResponse, CreateInboundRequestRequest,
  Quote, QuoteDetail, PaginatedQuoteResponse,
  CreateQuoteRequest, UpdateQuoteRequest,
  QuoteLineItem, CreateQuoteLineItemRequest, UpdateQuoteLineItemRequest
} from "../api-types/quote.types";

class InboundRequestsClient extends BaseApiClient {
  async list(params?: { query?: string; status?: string; page?: number; size?: number }): Promise<PaginatedInboundRequestResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedInboundRequestResponse>(`/api/inbound-requests${query}`);
  }

  async get(id: string): Promise<InboundRequest> {
    return this.request<InboundRequest>(`/api/inbound-requests/${id}`);
  }

  async create(data: CreateInboundRequestRequest): Promise<InboundRequest> {
    return this.request<InboundRequest>("/api/inbound-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/inbound-requests/${id}`, { method: "DELETE" });
  }

  async review(id: string, decision: string, denialReason?: string): Promise<InboundRequest> {
    return this.request<InboundRequest>(`/api/inbound-requests/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, denialReason }),
    });
  }

  async convert(id: string): Promise<InboundRequest> {
    return this.request<InboundRequest>(`/api/inbound-requests/${id}/convert`, { method: "POST" });
  }
}

class QuotesClient extends BaseApiClient {
  async list(params?: { query?: string; status?: string; clientId?: string; projectId?: string; page?: number; size?: number }): Promise<PaginatedQuoteResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedQuoteResponse>(`/api/quotes${query}`);
  }

  async get(id: string): Promise<QuoteDetail> {
    return this.request<QuoteDetail>(`/api/quotes/${id}`);
  }

  async create(data: CreateQuoteRequest): Promise<Quote> {
    return this.request<Quote>("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateQuoteRequest): Promise<Quote> {
    return this.request<Quote>(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/quotes/${id}`, { method: "DELETE" });
  }

  async send(id: string): Promise<Quote> {
    return this.request<Quote>(`/api/quotes/${id}/send`, { method: "POST" });
  }

  async createNewVersion(id: string): Promise<Quote> {
    return this.request<Quote>(`/api/quotes/${id}/new-version`, { method: "POST" });
  }

  async recalculate(id: string): Promise<Quote> {
    return this.request<Quote>(`/api/quotes/${id}/recalculate`, { method: "POST" });
  }

  async approve(id: string, data: { approvedByName?: string; approvedByEmail?: string; signatureUrl?: string }): Promise<Quote> {
    return this.request<Quote>(`/api/quotes/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  // Line Items
  async listLineItems(quoteId: string): Promise<QuoteLineItem[]> {
    return this.request<QuoteLineItem[]>(`/api/quotes/${quoteId}/line-items`);
  }

  async createLineItem(quoteId: string, data: CreateQuoteLineItemRequest): Promise<QuoteLineItem> {
    return this.request<QuoteLineItem>(`/api/quotes/${quoteId}/line-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateLineItem(quoteId: string, lineId: string, data: UpdateQuoteLineItemRequest): Promise<QuoteLineItem> {
    return this.request<QuoteLineItem>(`/api/quotes/${quoteId}/line-items/${lineId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteLineItem(quoteId: string, lineId: string): Promise<void> {
    await this.request<void>(`/api/quotes/${quoteId}/line-items/${lineId}`, { method: "DELETE" });
  }
}

export const inboundRequestsClient = new InboundRequestsClient();
export const quotesClient = new QuotesClient();
