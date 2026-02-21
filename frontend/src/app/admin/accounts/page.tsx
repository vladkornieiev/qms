"use client";

import { AccountsContent } from "./components/accounts-content";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminRoute } from "@/components/auth/admin-route";

export default function AdminAccountsPage() {
  return (
    <ProtectedRoute>
      <AdminRoute requirePlatformAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-8 py-8">
            <AccountsContent />
          </div>
          <Toaster richColors position="top-right" />
        </div>
      </AdminRoute>
    </ProtectedRoute>
  );
}
