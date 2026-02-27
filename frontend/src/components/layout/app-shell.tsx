"use client";

import { useAuthStore } from "@/store/auth-store";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { PageWrapper } from "./page-wrapper";

// Routes that should NOT get the app shell (navbar/sidebar/page-wrapper)
const EXCLUDED_ROUTES = ["/login", "/auth"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  const isExcluded = EXCLUDED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isExcluded || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <PageWrapper>{children}</PageWrapper>
    </>
  );
}
