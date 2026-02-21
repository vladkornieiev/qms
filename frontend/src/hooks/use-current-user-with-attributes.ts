"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth-store";

export const CURRENT_USER_QUERY_KEY = ["current-user-with-attributes"] as const;

export interface CurrentUserWithAttributes {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  emailConfirmed: boolean;
  roles: string[];
  organizationName?: string;
  createdAt: string;
  updatedAt: string;
  attributes?: Record<string, unknown>;
}

export function useCurrentUserWithAttributes() {
  const { user } = useAuthStore();

  return useQuery<CurrentUserWithAttributes | null>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      if (!authClient.isAuthenticated()) {
        return null;
      }
      return authClient.apiRequest<CurrentUserWithAttributes>("/api/users/me");
    },
    enabled: !!user,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useSetCurrentUserCache() {
  const queryClient = useQueryClient();

  return (data: CurrentUserWithAttributes | null) => {
    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, data);
  };
}

export function useInvalidateCurrentUserCache() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
  };
}
