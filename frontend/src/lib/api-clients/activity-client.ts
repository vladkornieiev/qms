import { BaseApiClient } from "./base-client";
import type {
  PaginatedActivityLogResponse, NotificationListResponse, Notification, CommunicationLog
} from "../api-types/activity.types";

class ActivityClient extends BaseApiClient {
  async getByEntity(entityType: string, entityId: string, params?: { page?: number; size?: number }): Promise<PaginatedActivityLogResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedActivityLogResponse>(`/api/activity/${entityType}/${entityId}${query}`);
  }

  async getByUser(userId: string, params?: { page?: number; size?: number }): Promise<PaginatedActivityLogResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<PaginatedActivityLogResponse>(`/api/activity/user/${userId}${query}`);
  }
}

class NotificationsClient extends BaseApiClient {
  async list(params?: { page?: number; size?: number }): Promise<NotificationListResponse> {
    const query = this.buildQueryString(params || {});
    return this.request<NotificationListResponse>(`/api/notifications${query}`);
  }

  async markRead(id: string): Promise<Notification> {
    return this.request<Notification>(`/api/notifications/${id}/read`, { method: "POST" });
  }

  async markAllRead(): Promise<void> {
    await this.request<void>("/api/notifications/read-all", { method: "POST" });
  }
}

class CommunicationsClient extends BaseApiClient {
  async getByEntity(entityType: string, entityId: string): Promise<CommunicationLog[]> {
    return this.request<CommunicationLog[]>(`/api/communications/${entityType}/${entityId}`);
  }
}

export const activityClient = new ActivityClient();
export const notificationsClient = new NotificationsClient();
export const communicationsClient = new CommunicationsClient();
