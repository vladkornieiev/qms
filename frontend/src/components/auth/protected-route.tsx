"use client";

import React from "react";
import { useAuthStore } from "@/store/auth-store";

import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      const currentPath = globalThis.location.pathname + globalThis.location.search;
      const loginUrl = `${redirectTo}?returnUrl=${encodeURIComponent(
        currentPath
      )}`;
      globalThis.location.href = loginUrl;
    }
    return null;
  }

  return <>{children}</>;
}
