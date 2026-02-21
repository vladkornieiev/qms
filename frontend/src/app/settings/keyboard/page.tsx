"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Navbar } from "@/components/layout/navbar";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { KeyboardSettingsContent } from "./keyboard-settings-content";

export default function KeyboardSettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <PageWrapper>
          <div className="container mx-auto px-8 py-8">
            <KeyboardSettingsContent />
          </div>
        </PageWrapper>
      </div>
    </ProtectedRoute>
  );
}
