"use client";

import { useAuthStore } from "@/store/auth-store";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { PageWrapper } from "./page-wrapper";

// Routes that should NOT get the app shell (navbar/sidebar/page-wrapper)
const EXCLUDED_ROUTES = ["/login", "/auth", "/onboarding"];
// Public route group
const PUBLIC_ROUTES = ["/about", "/services", "/solutions", "/faqs"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  const isExcluded =
    pathname === "/" ||
    EXCLUDED_ROUTES.some((route) => pathname.startsWith(route)) ||
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

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
