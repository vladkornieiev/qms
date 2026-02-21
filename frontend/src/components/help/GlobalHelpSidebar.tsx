"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HelpCircle, Loader2 } from "lucide-react";

export type HelpPage =
  | "users"
  | "general";

interface GlobalHelpSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: HelpPage;
}

function HelpContentLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

const GeneralHelpContent = dynamic(
  () => import("./GeneralHelpContent").then((mod) => mod.GeneralHelpContent),
  { loading: HelpContentLoader, ssr: false }
);

const UsersHelpContent = dynamic(
  () => import("./UsersHelpContent").then((mod) => mod.UsersHelpContent),
  { loading: HelpContentLoader, ssr: false }
);

// Meta information is small and kept inline to avoid loading large content files
const helpMeta: Record<HelpPage, { title: string; description: string }> = {
  users: {
    title: "Users Help",
    description: "Learn how to manage users and permissions.",
  },
  general: {
    title: "Help",
    description: "General help and guidance for using the application.",
  },
};

const helpComponents: Record<HelpPage, React.ComponentType> = {
  users: UsersHelpContent,
  general: GeneralHelpContent,
};

export function GlobalHelpSidebar({
  open,
  onOpenChange,
  page,
}: GlobalHelpSidebarProps) {
  const meta = helpMeta[page] || helpMeta.general;
  const HelpContent = helpComponents[page] || helpComponents.general;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-6 w-6 text-primary" />
            {meta.title}
          </SheetTitle>
          <SheetDescription>{meta.description}</SheetDescription>
        </SheetHeader>

        <div className="space-y-2">{open && <HelpContent />}</div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Need more help? Contact your system administrator.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function GlobalHelpButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      title="Help"
      className="h-9 w-9"
    >
      <HelpCircle className="h-5 w-5" />
    </Button>
  );
}
