"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { useHotkeysConfig } from "@/contexts/hotkeys-context";
import { HotkeyBadge } from "./hotkey-badge";
import type {
  HotkeyScope,
  HotkeyCategory,
  ResolvedHotkey,
} from "@/types/hotkeys";
import {
  SCOPE_LABELS,
  CATEGORY_LABELS,
  getActiveScopes,
} from "@/lib/hotkeys/registry";

export function HotkeyCheatSheet() {
  const { resolvedHotkeys, isCheatSheetOpen, closeCheatSheet } =
    useHotkeysConfig();

  // Group by scope, then by category
  const grouped = useMemo(() => {
    const result: Record<
      HotkeyScope,
      Record<HotkeyCategory, ResolvedHotkey[]>
    > = {} as Record<HotkeyScope, Record<HotkeyCategory, ResolvedHotkey[]>>;

    for (const hotkey of resolvedHotkeys) {
      if (!hotkey.isEnabled) continue;

      if (!result[hotkey.scope]) {
        result[hotkey.scope] = {} as Record<HotkeyCategory, ResolvedHotkey[]>;
      }
      if (!result[hotkey.scope][hotkey.category]) {
        result[hotkey.scope][hotkey.category] = [];
      }
      result[hotkey.scope][hotkey.category].push(hotkey);
    }

    return result;
  }, [resolvedHotkeys]);

  const scopes = getActiveScopes().filter((scope) => grouped[scope]);

  return (
    <Dialog open={isCheatSheetOpen} onOpenChange={closeCheatSheet}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {scopes.map((scope) => (
            <div key={scope}>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
                {SCOPE_LABELS[scope]}
                <span className="text-xs font-normal text-muted-foreground">
                  ({Object.values(grouped[scope]).flat().length})
                </span>
              </h3>

              <div className="space-y-4 pl-4">
                {(Object.keys(grouped[scope]) as HotkeyCategory[]).map(
                  (category) => (
                    <div key={category}>
                      <h4 className="text-xs text-muted-foreground uppercase mb-2 font-medium">
                        {CATEGORY_LABELS[category]}
                      </h4>
                      <div className="space-y-1">
                        {grouped[scope][category].map((hotkey) => (
                          <div
                            key={hotkey.id}
                            className="flex items-center justify-between py-1.5"
                          >
                            <span className="text-sm">
                              {hotkey.description}
                            </span>
                            <HotkeyBadge
                              keys={hotkey.customKeys ?? hotkey.keys}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          Press <HotkeyBadge keys="mod+k" /> to toggle this dialog
        </div>
      </DialogContent>
    </Dialog>
  );
}
