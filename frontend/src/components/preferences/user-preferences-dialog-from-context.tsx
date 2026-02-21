"use client";

import { usePreferencesDialog } from "@/contexts/preferences-dialog-context";
import { UserPreferencesDialog } from "./user-preferences-dialog";

export function UserPreferencesDialogFromContext() {
  const { isPreferencesDialogOpen, closePreferencesDialog } =
    usePreferencesDialog();

  return (
    <UserPreferencesDialog
      open={isPreferencesDialogOpen}
      onOpenChange={(open) => {
        if (!open) closePreferencesDialog();
      }}
    />
  );
}
