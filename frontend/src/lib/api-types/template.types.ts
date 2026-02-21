export interface Template {
  id: string;
  name: string;
  description?: string;
  templateType: string;
  isClientFacing: boolean;
  isActive: boolean;
  settings: Record<string, unknown>;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateDetail extends Template {
  items: TemplateItem[];
}

export interface PaginatedTemplateResponse {
  items: Template[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  templateType: string;
  isClientFacing?: boolean;
  isActive?: boolean;
  settings?: Record<string, unknown>;
}

export interface UpdateTemplateRequest {
  name?: string | null;
  description?: string | null;
  templateType?: string | null;
  isClientFacing?: boolean | null;
  isActive?: boolean | null;
  settings?: Record<string, unknown> | null;
}

export interface TemplateItem {
  id: string;
  templateId: string;
  itemType: string;
  productId?: string;
  categoryId?: string;
  label: string;
  description?: string;
  defaultQuantity?: number;
  defaultUnitPrice?: number;
  defaultUnit?: string;
  fieldType?: string;
  fieldOptions?: Record<string, unknown>;
  isRequired: boolean;
  dependsOnItemId?: string;
  dependsOnValue?: string;
  section?: string;
  displayOrder: number;
  createdAt: string;
}

export interface CreateTemplateItemRequest {
  itemType: string;
  productId?: string;
  categoryId?: string;
  label: string;
  description?: string;
  defaultQuantity?: number;
  defaultUnitPrice?: number;
  defaultUnit?: string;
  fieldType?: string;
  fieldOptions?: Record<string, unknown>;
  isRequired?: boolean;
  dependsOnItemId?: string;
  dependsOnValue?: string;
  section?: string;
  displayOrder?: number;
}

export interface UpdateTemplateItemRequest {
  label?: string | null;
  description?: string | null;
  defaultQuantity?: number | null;
  defaultUnitPrice?: number | null;
  defaultUnit?: string | null;
  fieldType?: string | null;
  fieldOptions?: Record<string, unknown> | null;
  isRequired?: boolean | null;
  section?: string | null;
  displayOrder?: number | null;
}

export interface TemplateApplyRequest {
  entityType: "quote" | "project" | "contract";
  clientId?: string;
  projectId?: string;
  title?: string;
}

export interface TemplateApplyResponse {
  entityType: string;
  entityId: string;
}
