"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  Shield,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-provider";
import { LAYOUT_CONSTANTS } from "@/lib/constants/layout";
import { usePermissions } from "@/hooks/use-permissions";
import {
  useHotkey,
  useCheatSheetHotkey,
  usePreferencesDialogHotkey,
} from "@/hooks/use-hotkey";
import type { LucideIcon } from "lucide-react";
import { SidebarLink } from "./sidebar-link";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  requireAdmin?: boolean;
  requirePlatformAdmin?: boolean;
}

const mainNavItems: NavItem[] = [
  { href: "/users", icon: Users, label: "Users", requireAdmin: true },
];

const adminNavItems: NavItem[] = [
  {
    href: "/admin/users",
    icon: Users,
    label: "Users",
    requirePlatformAdmin: true,
  },
  {
    href: "/admin/accounts",
    icon: Building2,
    label: "Organizations",
    requirePlatformAdmin: true,
  },
];

function isAdminContext(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith("/admin");
}

export function Sidebar() {
  const { isSidebarOpen, setIsSidebarOpen, isMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { canManageUsers, isPlatformAdmin } =
    usePermissions();

  const inAdminContext = useMemo(() => isAdminContext(pathname), [pathname]);

  const visibleMainItems = mainNavItems.filter((item) => {
    if (item.requireAdmin) return canManageUsers();
    return true;
  });

  const visibleAdminItems = adminNavItems.filter((item) => {
    if (item.requirePlatformAdmin) return isPlatformAdmin();
    return canManageUsers();
  });

  const firstAdminHref = visibleAdminItems[0]?.href || "/admin/users";

  // Register global hotkeys
  useHotkey(
    "global.toggle-sidebar",
    () => setIsSidebarOpen(!isSidebarOpen),
    {},
    [isSidebarOpen, setIsSidebarOpen]
  );
  useCheatSheetHotkey();
  usePreferencesDialogHotkey();

  // Navigation hotkeys - context-aware
  useHotkey(
    "global.go-to-dashboard",
    () => router.push(inAdminContext ? firstAdminHref : "/"),
    {},
    [router, inAdminContext, firstAdminHref]
  );
  useHotkey(
    "global.go-to-users",
    () => router.push(inAdminContext ? "/admin/users" : "/users"),
    {},
    [router, inAdminContext]
  );
  useHotkey(
    "global.go-to-accounts",
    () => {
      if (isPlatformAdmin()) {
        router.push("/admin/accounts");
      }
    },
    {},
    [router]
  );
  useHotkey(
    "global.toggle-context",
    () => {
      if (inAdminContext) {
        router.push("/");
      } else if (visibleAdminItems.length > 0) {
        router.push(firstAdminHref);
      }
    },
    {},
    [router, inAdminContext, visibleAdminItems.length, firstAdminHref]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="main-sidebar"
        className={cn(
          "fixed left-0 top-16 bottom-0 z-40 border-r transition-all",
          LAYOUT_CONSTANTS.TRANSITION_DURATION,
          isSidebarOpen
            ? LAYOUT_CONSTANTS.SIDEBAR_WIDTH_EXPANDED
            : LAYOUT_CONSTANTS.SIDEBAR_WIDTH_COLLAPSED,
          isMobile && !isSidebarOpen && "-translate-x-full",
          inAdminContext ? "bg-muted/50" : "bg-background"
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isSidebarOpen}
          aria-controls="main-sidebar"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>

        {/* Navigation Links */}
        <TooltipProvider delayDuration={300}>
          <nav className="p-4 space-y-2" aria-label="Main navigation">
            {/* Context-aware navigation */}
            {inAdminContext ? (
              <>
                {/* Switch to Workspace link when in admin context */}
                <SidebarLink
                  href="/"
                  icon={LayoutDashboard}
                  label="Workspace"
                  isSidebarOpen={isSidebarOpen}
                  isActive={false}
                />

                {/* Separator */}
                <div className="py-2">
                  <div className="border-t"></div>
                </div>

                {/* Admin Section Header */}
                {isSidebarOpen && (
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Administration</span>
                  </div>
                )}

                {/* Admin Navigation Items */}
                {visibleAdminItems.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isSidebarOpen={isSidebarOpen}
                    isActive={
                      pathname === item.href ||
                      pathname?.startsWith(item.href + "/")
                    }
                  />
                ))}
              </>
            ) : (
              <>
                {/* Main Navigation when in workspace context */}
                <SidebarLink
                  href="/"
                  icon={Home}
                  label="Home"
                  isSidebarOpen={isSidebarOpen}
                  isActive={pathname === "/"}
                />
                {visibleMainItems.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isSidebarOpen={isSidebarOpen}
                    isActive={
                      pathname === item.href ||
                      pathname?.startsWith(item.href + "/")
                    }
                  />
                ))}

                {/* Switch to Admin link - Only show if user has admin permissions */}
                {visibleAdminItems.length > 0 && (
                  <>
                    {/* Separator */}
                    <div className="py-2">
                      <div className="border-t"></div>
                    </div>

                    {/* Admin Switch Link */}
                    <SidebarLink
                      href={firstAdminHref}
                      icon={Shield}
                      label="Administration"
                      isSidebarOpen={isSidebarOpen}
                      isActive={false}
                    />
                  </>
                )}
              </>
            )}
          </nav>
        </TooltipProvider>
      </aside>
    </>
  );
}
