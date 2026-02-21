"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { KeyboardSettingsContent } from "./keyboard-settings-content";

export default function KeyboardSettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-8 py-8">
          <KeyboardSettingsContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
