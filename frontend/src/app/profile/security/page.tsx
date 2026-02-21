"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { SecurityContent } from "./security-content";

export default function SecurityPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-8 py-8">
          <SecurityContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
