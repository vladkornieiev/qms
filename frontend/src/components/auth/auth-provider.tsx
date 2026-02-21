"use client";

import React, { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { authClient } from "@/lib/auth-client";
import {
  CURRENT_USER_QUERY_KEY,
  type CurrentUserWithAttributes,
} from "@/hooks/use-current-user-with-attributes";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setInitialized } = useAuthStore();
  const queryClient = useQueryClient();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Initialize auth state on app load - only once
    const initAuth = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      // Check if we have a valid token
      if (authClient.isAuthenticated()) {
        try {
          const userData =
            await authClient.apiRequest<CurrentUserWithAttributes>(
              "/api/users/me"
            );

          queryClient.setQueryData(CURRENT_USER_QUERY_KEY, userData);

          setUser(userData);
        } catch (error) {
          console.error("Failed to initialize auth:", error);
          authClient.clearTokens();
        }
      }

      setInitialized(true);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove dependencies to prevent re-initialization

  return <>{children}</>;
}
