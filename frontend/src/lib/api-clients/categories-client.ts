import { BaseApiClient } from "./base-client";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../api-types/category.types";

class CategoriesClient extends BaseApiClient {
  async list(type?: string): Promise<Category[]> {
    const query = type ? `?type=${type}` : "";
    return this.request<Category[]>(`/api/categories${query}`);
  }

  async get(id: string): Promise<Category> {
    return this.request<Category>(`/api/categories/${id}`);
  }

  async create(data: CreateCategoryRequest): Promise<Category> {
    return this.request<Category>("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    return this.request<Category>(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/categories/${id}`, { method: "DELETE" });
  }
}

export const categoriesClient = new CategoriesClient();
