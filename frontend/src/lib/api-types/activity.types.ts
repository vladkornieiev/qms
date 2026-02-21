export interface ActivityLog {
  id: string;
  userId?: string;
  entityType: string;
  entityId: string;
  action: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedActivityLogResponse {
  items: ActivityLog[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  readAt?: string;
  channel: string;
  createdAt: string;
}

export interface NotificationListResponse {
  items: Notification[];
  unreadCount: number;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CommunicationLog {
  id: string;
  entityType?: string;
  entityId?: string;
  channel: string;
  direction: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  bodyPreview?: string;
  status: string;
  externalMessageId?: string;
  sentAt?: string;
  createdAt: string;
}
