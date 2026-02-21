"use client";

import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

interface SidebarErrorBoundaryProps {
  children: React.ReactNode;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  console.error('Sidebar error:', error);

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm text-red-600 mb-2">
        Sidebar temporarily unavailable. Please refresh the page.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="text-xs text-red-700 underline hover:no-underline"
      >
        Try again
      </button>
    </div>
  );
}

export function SidebarErrorBoundary({ children }: SidebarErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset any state if needed
        globalThis.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}