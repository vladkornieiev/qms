/**
 * Common base types used across all API clients
 */

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Location {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface Picture {
  id: string;
  name: string;
  type: string;
  url: string;
}
