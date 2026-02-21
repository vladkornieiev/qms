"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

interface SidebarContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = 'sidebar-open';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage with SSR safety
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved ? JSON.parse(saved) : true;
  });

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // Mobile responsiveness detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = globalThis.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    globalThis.addEventListener('resize', checkMobile);
    return () => globalThis.removeEventListener('resize', checkMobile);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ isSidebarOpen, setIsSidebarOpen, isMobile }),
    [isSidebarOpen, isMobile]
  );

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
