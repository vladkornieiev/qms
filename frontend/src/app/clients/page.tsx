"use client";

import { ClientsContent } from "./components/clients-content";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-8 py-8">
          <ClientsContent />
        </div>
        <Toaster richColors position="top-right" />
      </div>
    </ProtectedRoute>
  );
}
