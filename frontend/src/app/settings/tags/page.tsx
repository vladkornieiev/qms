"use client";

import { TagsContent } from "./components/tags-content";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function TagsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-8 py-8">
          <TagsContent />
        </div>
        <Toaster richColors position="top-right" />
      </div>
    </ProtectedRoute>
  );
}
