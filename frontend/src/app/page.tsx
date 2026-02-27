"use client";

import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Welcome to ASAP Platform</h1>
        <p className="text-muted-foreground">
          Use the sidebar to navigate to Users, Profile, or Administration.
        </p>
      </div>
    </div>
  );
}
