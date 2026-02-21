import { BaseApiClient } from "./base-client";
import type {
  InventoryItem, PaginatedInventoryItemResponse,
  CreateInventoryItemRequest, UpdateInventoryItemRequest,
  StockLevel, InventoryTransaction, PaginatedInventoryTransactionResponse,
  CheckOutRequest, CheckInRequest, TransferItemRequest,
  ConsumeStockRequest, RestockRequest, TransferStockRequest
} from "../api-types/inventory.types";

class InventoryClient extends BaseApiClient {
  async listItems(params?: { query?: string; status?: string; productId?: string; page?: number; size?: number; sortBy?: string; order?: string }): Promise<PaginatedInventoryItemResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedInventoryItemResponse>(`/api/inventory-items${query}`);
  }

  async getItem(id: string): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/api/inventory-items/${id}`);
  }

  async createItem(data: CreateInventoryItemRequest): Promise<InventoryItem> {
    return this.request<InventoryItem>("/api/inventory-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateItem(id: string, data: UpdateInventoryItemRequest): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/api/inventory-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: string): Promise<void> {
    await this.request<void>(`/api/inventory-items/${id}`, { method: "DELETE" });
  }

  async checkOut(id: string, data: CheckOutRequest): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/api/inventory-items/${id}/check-out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async checkIn(id: string, data: CheckInRequest): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/api/inventory-items/${id}/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async transferItem(id: string, data: TransferItemRequest): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/api/inventory-items/${id}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async consumeStock(stockLevelId: string, data: ConsumeStockRequest): Promise<StockLevel> {
    return this.request<StockLevel>(`/api/stock-levels/${stockLevelId}/consume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async restockLevel(stockLevelId: string, data: RestockRequest): Promise<StockLevel> {
    return this.request<StockLevel>(`/api/stock-levels/${stockLevelId}/restock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async transferStock(stockLevelId: string, data: TransferStockRequest): Promise<StockLevel> {
    return this.request<StockLevel>(`/api/stock-levels/${stockLevelId}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async listTransactions(params?: { inventoryItemId?: string; productId?: string; projectId?: string; page?: number; size?: number }): Promise<PaginatedInventoryTransactionResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedInventoryTransactionResponse>(`/api/inventory-transactions${query}`);
  }
}

export const inventoryClient = new InventoryClient();
