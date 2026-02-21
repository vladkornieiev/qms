"use client";

import { useSidebar } from "./sidebar-provider";
import { cn } from "@/lib/utils";
import { LAYOUT_CONSTANTS } from "@/lib/constants/layout";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, isMobile } = useSidebar();

  return (
    <main
      className={cn(
        LAYOUT_CONSTANTS.TOP_NAV_PADDING,
        "transition-all",
        LAYOUT_CONSTANTS.TRANSITION_DURATION,
        isSidebarOpen && !isMobile ? LAYOUT_CONSTANTS.MARGIN_LEFT_EXPANDED : LAYOUT_CONSTANTS.MARGIN_LEFT_COLLAPSED,
        isMobile && "ml-0" // No margin on mobile
      )}
    >
      {children}
    </main>
  );
}
