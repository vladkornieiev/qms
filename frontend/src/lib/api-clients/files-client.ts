import { BaseApiClient } from "./base-client";
import type { FileAttachment } from "../api-types/file.types";

class FilesClient extends BaseApiClient {
  async list(entityType: string, entityId: string): Promise<FileAttachment[]> {
    return this.request<FileAttachment[]>(`/api/files/${entityType}/${entityId}`);
  }

  async get(id: string): Promise<FileAttachment> {
    return this.request<FileAttachment>(`/api/files/${id}`);
  }

  async upload(entityType: string, entityId: string, file: File, category?: string): Promise<FileAttachment> {
    const formData = new FormData();
    formData.append("file", file);
    if (category) formData.append("category", category);
    return this.request<FileAttachment>(`/api/files/${entityType}/${entityId}`, {
      method: "POST",
      body: formData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/files/${id}`, { method: "DELETE" });
  }
}

export const filesClient = new FilesClient();
