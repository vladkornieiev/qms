import { BaseApiClient } from "./base-client";
import type {
  Product, PaginatedProductResponse,
  CreateProductRequest, UpdateProductRequest
} from "../api-types/product.types";
import type { InventoryItem, StockLevel } from "../api-types/inventory.types";

class ProductsClient extends BaseApiClient {
  async list(params?: { query?: string; productType?: string; trackingType?: string; isActive?: boolean; page?: number; size?: number; sortBy?: string; order?: string }): Promise<PaginatedProductResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedProductResponse>(`/api/products${query}`);
  }

  async get(id: string): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`);
  }

  async create(data: CreateProductRequest): Promise<Product> {
    return this.request<Product>("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateProductRequest): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/products/${id}`, { method: "DELETE" });
  }

  async listChildren(id: string): Promise<Product[]> {
    return this.request<Product[]>(`/api/products/${id}/children`);
  }

  async listInventory(id: string): Promise<InventoryItem[]> {
    return this.request<InventoryItem[]>(`/api/products/${id}/inventory`);
  }

  async listStock(id: string): Promise<StockLevel[]> {
    return this.request<StockLevel[]>(`/api/products/${id}/stock`);
  }
}

export const productsClient = new ProductsClient();
