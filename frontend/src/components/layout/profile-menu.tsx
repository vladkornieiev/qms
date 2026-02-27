"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Shield,
  User,
  ChevronDown,
  Building2,
  Settings,
} from "lucide-react";
import { usePreferencesDialog } from "@/contexts/user-preferences-context";
import { OrganizationSwitcherDialog } from "./organization-switcher-dialog";

export function ProfileMenu() {
  const { user, logout } = useAuthStore();
  const { openPreferencesDialog } = usePreferencesDialog();
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  if (!user) {
    return null;
  }

  const getDisplayName = (u: typeof user) => {
    if (!u) return "?";
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return fullName || u.email;
  };

  const getInitials = (u: typeof user) => {
    if (!u) return "?";
    const first = u.firstName?.[0] || "";
    const last = u.lastName?.[0] || "";
    if (first || last) return `${first}${last}`.toUpperCase();
    return u.email?.[0]?.toUpperCase() || "?";
  };

  const formatRole = (roles: string[]) => {
    if (!roles || roles.length === 0) return "Member";
    // Convert OWNER to "Owner", etc.
    return roles[0]
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const displayName = getDisplayName(user);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="User menu"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-sm">
            <span className="font-medium text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              {user.organizationName || formatRole(user.roles)}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {formatRole(user.roles)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/security" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span>Security</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openPreferencesDialog}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Preferences</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowOrgSwitcher(true)}>
          <Building2 className="mr-2 h-4 w-4" />
          <span>Switch Organization</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <OrganizationSwitcherDialog
        open={showOrgSwitcher}
        onOpenChange={setShowOrgSwitcher}
      />
    </DropdownMenu>
  );
}
