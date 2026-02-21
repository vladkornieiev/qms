"use client";

import { UsersContent } from "./components/users-content";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminRoute } from "@/components/auth/admin-route";
import { Navbar } from "@/components/layout/navbar";
import { PageWrapper } from "@/components/layout/page-wrapper";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute>
      <AdminRoute requirePlatformAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <PageWrapper>
            <div className="container mx-auto px-8 py-8">
              <UsersContent />
            </div>
          </PageWrapper>
          <Toaster richColors position="top-right" />
        </div>
      </AdminRoute>
    </ProtectedRoute>
  );
}
