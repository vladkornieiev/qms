"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type HelpPage = "charts" | "dashboard" | "projects" | "general";

interface HelpContextType {
  isOpen: boolean;
  currentPage: HelpPage;
  openHelp: (page?: HelpPage) => void;
  closeHelp: () => void;
  setCurrentPage: (page: HelpPage) => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<HelpPage>("general");

  const openHelp = useCallback((page?: HelpPage) => {
    if (page) {
      setCurrentPage(page);
    }
    setIsOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <HelpContext.Provider
      value={{
        isOpen,
        currentPage,
        openHelp,
        closeHelp,
        setCurrentPage,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error("useHelp must be used within a HelpProvider");
  }
  return context;
}
