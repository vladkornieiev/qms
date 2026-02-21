"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { LAYOUT_CONSTANTS } from "@/lib/constants/layout";
import { Sidebar } from "./sidebar";
import { ProfileMenu } from "./profile-menu";
import {
  GlobalHelpSidebar,
  GlobalHelpButton,
} from "@/components/help/GlobalHelpSidebar";

export function Navbar() {
  const { isAuthenticated } = useAuthStore();
  const [helpOpen, setHelpOpen] = useState(false);
  const pathname = usePathname();

  // Determine which help page to show based on current route
  const getHelpPage = ():
    | "users"
    | "general" => {
    if (pathname === "/users") return "users";
    return "general";
  };
  const helpPage = getHelpPage();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Top Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${LAYOUT_CONSTANTS.TOP_NAV_HEIGHT}`}
      >
        <div className="flex h-full items-center justify-between px-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center">
            <Image
              src="/asap-logo.png"
              alt="ASAP Platform"
              width={130}
              height={35}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <GlobalHelpButton onClick={() => setHelpOpen(true)} />
            <ProfileMenu />
          </div>
        </div>
      </nav>

      {/* Left Sidebar Component */}
      <Sidebar />

      {/* Global Help Sidebar */}
      <GlobalHelpSidebar
        open={helpOpen}
        onOpenChange={setHelpOpen}
        page={helpPage}
      />
    </>
  );
}
