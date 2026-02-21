"use client";

import React from "react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export const NAV_ITEM_BASE_CLASSES =
  "flex items-center rounded-md text-sm font-medium transition-colors";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isSidebarOpen: boolean;
}

export function SidebarLink({
  href,
  icon: Icon,
  label,
  isActive,
  isSidebarOpen,
}: SidebarLinkProps) {
  const linkContent = (
    <Link
      href={href}
      className={cn(
        NAV_ITEM_BASE_CLASSES,
        isSidebarOpen ? "space-x-3 px-3 py-2" : "justify-center py-2",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      {isSidebarOpen && <span>{label}</span>}
    </Link>
  );

  if (!isSidebarOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
