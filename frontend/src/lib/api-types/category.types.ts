export interface Category {
  id: string;
  name: string;
  code?: string;
  type: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  displayOrder: number;
  children?: Category[];
  createdAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: string;
  code?: string;
  description?: string;
  parentId?: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  code?: string;
  type?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  displayOrder?: number;
}
