/**
 * Base API client with common request handling and query string building
 */

import { authClient } from "../auth-client";

export class BaseApiClient {
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return authClient.apiRequest<T>(endpoint, options);
  }

  protected buildQueryString(params: Record<string, unknown>): string {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(key, String(v)));
        } else {
          query.append(key, String(value));
        }
      }
    });

    const queryString = query.toString();
    return queryString ? `?${queryString}` : "";
  }
}
