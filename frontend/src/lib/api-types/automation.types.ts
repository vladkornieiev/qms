export interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  triggerEntity: string;
  triggerEvent: string;
  triggerConditions: Record<string, unknown>;
  actions: Record<string, unknown>[];
  executionOrder: number;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowRuleRequest {
  name: string;
  description?: string;
  isActive?: boolean;
  triggerEntity: string;
  triggerEvent: string;
  triggerConditions?: Record<string, unknown>;
  actions?: Record<string, unknown>[];
  executionOrder?: number;
}

export interface UpdateWorkflowRuleRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  triggerEntity?: string;
  triggerEvent?: string;
  triggerConditions?: Record<string, unknown>;
  actions?: Record<string, unknown>[];
  executionOrder?: number;
}

export interface PaginatedWorkflowRuleResponse {
  items: WorkflowRule[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Integration {
  id: string;
  provider: string;
  status: string;
  settings: Record<string, unknown>;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationRequest {
  provider: string;
  credentials?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface UpdateIntegrationRequest {
  settings?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
}

export interface SyncLogEntry {
  id: string;
  integrationId: string;
  direction: string;
  entityType: string;
  entityId?: string;
  externalId?: string;
  status: string;
  errorMessage?: string;
  createdAt: string;
}

export interface PaginatedSyncLogResponse {
  items: SyncLogEntry[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
