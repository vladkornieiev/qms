"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProfileContent } from "./profile-content";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-8 py-8">
          <ProfileContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
