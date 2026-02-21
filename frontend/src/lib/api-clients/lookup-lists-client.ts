import { BaseApiClient } from "./base-client";
import type {
  LookupList, LookupListDetail, LookupListItem,
  CreateLookupListRequest, UpdateLookupListRequest,
  CreateLookupListItemRequest, UpdateLookupListItemRequest
} from "../api-types/lookup.types";

class LookupListsClient extends BaseApiClient {
  async list(): Promise<LookupList[]> {
    return this.request<LookupList[]>("/api/lookup-lists");
  }

  async get(id: string): Promise<LookupListDetail> {
    return this.request<LookupListDetail>(`/api/lookup-lists/${id}`);
  }

  async create(data: CreateLookupListRequest): Promise<LookupList> {
    return this.request<LookupList>("/api/lookup-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateLookupListRequest): Promise<LookupList> {
    return this.request<LookupList>(`/api/lookup-lists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/lookup-lists/${id}`, { method: "DELETE" });
  }

  async listItems(listId: string): Promise<LookupListItem[]> {
    return this.request<LookupListItem[]>(`/api/lookup-lists/${listId}/items`);
  }

  async createItem(listId: string, data: CreateLookupListItemRequest): Promise<LookupListItem> {
    return this.request<LookupListItem>(`/api/lookup-lists/${listId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async updateItem(listId: string, itemId: string, data: UpdateLookupListItemRequest): Promise<LookupListItem> {
    return this.request<LookupListItem>(`/api/lookup-lists/${listId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async deleteItem(listId: string, itemId: string): Promise<void> {
    await this.request<void>(`/api/lookup-lists/${listId}/items/${itemId}`, { method: "DELETE" });
  }
}

export const lookupListsClient = new LookupListsClient();
