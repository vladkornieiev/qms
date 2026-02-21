"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, FileText, Keyboard, Loader2, Ruler } from "lucide-react";
import { useUserPreferences } from "@/contexts/user-preferences-context";
import { SidebarItem } from "./sidebar-item";
import { GeneralPreferencesSection } from "./sections/general-section";
import { ChartsPreferencesSection } from "./sections/charts-section";
import { KeyboardShortcutsSection } from "./sections/keyboard-shortcuts-section";
import { UnitsPreferencesSection } from "./sections/units-section";

type PreferenceSection = "general" | "charts" | "units" | "keyboard";

const SECTION_CONFIG: Record<
  PreferenceSection,
  { title: string; description: string }
> = {
  general: {
    title: "General",
    description: "Manage general application settings",
  },
  charts: {
    title: "Charts",
    description: "Configure chart behavior and display options",
  },
  units: {
    title: "Units",
    description: "Set default units for displaying sensor data",
  },
  keyboard: {
    title: "Keyboard Shortcuts",
    description: "Customize keyboard shortcuts for your workflow",
  },
};

interface UserPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserPreferencesDialog({
  open,
  onOpenChange,
}: UserPreferencesDialogProps) {
  const [activeSection, setActiveSection] =
    useState<PreferenceSection>("general");
  const { isLoading } = useUserPreferences();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="min-w-[900px] max-w-[900px] h-[600px] p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="grid grid-cols-[220px_1fr] h-full overflow-hidden">
          <div className="border-r bg-muted/30 p-4 flex flex-col">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Preferences
              </DialogTitle>
            </DialogHeader>

            <nav className="space-y-1 flex-1 min-h-0">
              <SidebarItem
                icon={<Settings className="h-4 w-4" />}
                label="General"
                active={activeSection === "general"}
                onClick={() => setActiveSection("general")}
              />
              <SidebarItem
                icon={<FileText className="h-4 w-4" />}
                label="Charts"
                active={activeSection === "charts"}
                onClick={() => setActiveSection("charts")}
              />
              <SidebarItem
                icon={<Ruler className="h-4 w-4" />}
                label="Units"
                active={activeSection === "units"}
                onClick={() => setActiveSection("units")}
              />
              <SidebarItem
                icon={<Keyboard className="h-4 w-4" />}
                label="Shortcuts"
                active={activeSection === "keyboard"}
                onClick={() => setActiveSection("keyboard")}
              />
            </nav>

            <div className="pt-4 border-t mt-auto">
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>

          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 pb-3 border-b shrink-0">
              <h3 className="text-lg font-medium">
                {SECTION_CONFIG[activeSection].title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {SECTION_CONFIG[activeSection].description}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {activeSection === "general" && <GeneralPreferencesSection />}
                  {activeSection === "charts" && <ChartsPreferencesSection />}
                  {activeSection === "units" && <UnitsPreferencesSection />}
                  {activeSection === "keyboard" && <KeyboardShortcutsSection />}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
