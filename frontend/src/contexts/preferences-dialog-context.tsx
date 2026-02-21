"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

interface PreferencesDialogContextValue {
  isPreferencesDialogOpen: boolean;
  openPreferencesDialog: () => void;
  closePreferencesDialog: () => void;
}

const PreferencesDialogContext =
  createContext<PreferencesDialogContextValue | null>(null);

interface PreferencesDialogProviderProps {
  children: React.ReactNode;
}

export function PreferencesDialogProvider({
  children,
}: PreferencesDialogProviderProps) {
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false);

  const openPreferencesDialog = useCallback(() => {
    setIsPreferencesDialogOpen(true);
  }, []);

  const closePreferencesDialog = useCallback(() => {
    setIsPreferencesDialogOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isPreferencesDialogOpen,
      openPreferencesDialog,
      closePreferencesDialog,
    }),
    [isPreferencesDialogOpen, openPreferencesDialog, closePreferencesDialog]
  );

  return (
    <PreferencesDialogContext.Provider value={value}>
      {children}
    </PreferencesDialogContext.Provider>
  );
}

export function usePreferencesDialog(): PreferencesDialogContextValue {
  const context = useContext(PreferencesDialogContext);
  if (!context) {
    throw new Error(
      "usePreferencesDialog must be used within a PreferencesDialogProvider"
    );
  }
  return context;
}
