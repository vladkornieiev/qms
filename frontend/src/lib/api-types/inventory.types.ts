export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  vendorId?: string;
  serialNumber?: string;
  barcode?: string;
  status: string;
  condition?: string;
  ownership: string;
  location?: string;
  notes?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  customFields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedInventoryItemResponse {
  items: InventoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateInventoryItemRequest {
  productId: string;
  vendorId?: string;
  serialNumber?: string;
  barcode?: string;
  status?: string;
  condition?: string;
  ownership?: string;
  location?: string;
  notes?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  customFields?: Record<string, unknown>;
}

export interface UpdateInventoryItemRequest {
  vendorId?: string | null;
  serialNumber?: string | null;
  barcode?: string | null;
  status?: string | null;
  condition?: string | null;
  ownership?: string | null;
  location?: string | null;
  notes?: string | null;
  purchasePrice?: number | null;
  purchaseDate?: string | null;
  customFields?: Record<string, unknown> | null;
}

export interface StockLevel {
  id: string;
  productId: string;
  productName: string;
  location: string;
  quantityOnHand: number;
  quantityReserved: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId?: string;
  productId?: string;
  stockLevelId?: string;
  quantity?: number;
  projectId?: string;
  transactionType: string;
  performedById?: string;
  notes?: string;
  createdAt: string;
}

export interface PaginatedInventoryTransactionResponse {
  items: InventoryTransaction[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CheckOutRequest {
  projectId?: string;
  notes?: string;
}

export interface CheckInRequest {
  condition?: string;
  location?: string;
  notes?: string;
}

export interface TransferItemRequest {
  location: string;
  notes?: string;
}

export interface ConsumeStockRequest {
  quantity: number;
  projectId?: string;
  notes?: string;
}

export interface RestockRequest {
  quantity: number;
  notes?: string;
}

export interface TransferStockRequest {
  toLocation: string;
  quantity: number;
  notes?: string;
}
