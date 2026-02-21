export interface Product {
  id: string;
  parentId?: string;
  categoryId?: string;
  name: string;
  sku?: string;
  productType: string;
  description?: string;
  unitPrice?: number;
  priceUnit?: string;
  costPrice?: number;
  trackingType: string;
  unitOfMeasure?: string;
  reorderPoint?: number;
  isRentable: boolean;
  isSellable: boolean;
  purchasePrice?: number;
  purchaseDate?: string;
  depreciationMethod?: string;
  usefulLifeMonths?: number;
  customFields: Record<string, unknown>;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProductResponse {
  items: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateProductRequest {
  parentId?: string;
  categoryId?: string;
  name: string;
  sku?: string;
  productType?: string;
  description?: string;
  unitPrice?: number;
  priceUnit?: string;
  costPrice?: number;
  trackingType?: string;
  unitOfMeasure?: string;
  reorderPoint?: number;
  isRentable?: boolean;
  isSellable?: boolean;
  purchasePrice?: number;
  purchaseDate?: string;
  depreciationMethod?: string;
  usefulLifeMonths?: number;
  customFields?: Record<string, unknown>;
}

export interface UpdateProductRequest {
  parentId?: string | null;
  categoryId?: string | null;
  name?: string | null;
  sku?: string | null;
  productType?: string | null;
  description?: string | null;
  unitPrice?: number | null;
  priceUnit?: string | null;
  costPrice?: number | null;
  trackingType?: string | null;
  unitOfMeasure?: string | null;
  reorderPoint?: number | null;
  isRentable?: boolean | null;
  isSellable?: boolean | null;
  purchasePrice?: number | null;
  purchaseDate?: string | null;
  depreciationMethod?: string | null;
  usefulLifeMonths?: number | null;
  customFields?: Record<string, unknown> | null;
  isActive?: boolean | null;
  displayOrder?: number | null;
}
