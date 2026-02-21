"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Search, AlertTriangle } from "lucide-react";
import { useHotkeysConfig } from "@/contexts/hotkeys-context";
import { HotkeyBadge } from "@/components/hotkeys/hotkey-badge";
import { HotkeyRow } from "@/components/hotkeys/hotkey-row";
import type { HotkeyScope, ResolvedHotkey } from "@/types/hotkeys";
import { SCOPE_LABELS, getActiveScopes } from "@/lib/hotkeys/registry";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function KeyboardShortcutsSection() {
  const {
    resolvedHotkeys,
    setCustomKeys,
    toggleHotkey,
    resetHotkey,
    resetScope,
    resetAll,
    detectConflicts,
    checkReservedShortcut,
    isSaving,
  } = useHotkeysConfig();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKeys, setEditingKeys] = useState("");
  const [activeScope, setActiveScope] = useState<HotkeyScope>("global");
  const [reservedWarning, setReservedWarning] = useState<{
    keys: string;
    description: string;
    hotkeyId: string;
  } | null>(null);

  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastKeyTimeRef = useRef<number>(0);
  const SEQUENCE_TIMEOUT = 1000;

  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!editingId) {
      lastKeyTimeRef.current = 0;
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    }
  }, [editingId]);

  const groupedHotkeys = useMemo(() => {
    const groups: Record<HotkeyScope, ResolvedHotkey[]> = {} as Record<
      HotkeyScope,
      ResolvedHotkey[]
    >;

    for (const hotkey of resolvedHotkeys) {
      const matchesSearch =
        !searchQuery ||
        hotkey.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotkey.keys.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) continue;

      if (!groups[hotkey.scope]) {
        groups[hotkey.scope] = [];
      }
      groups[hotkey.scope].push(hotkey);
    }

    return groups;
  }, [resolvedHotkeys, searchQuery]);

  const scopes = getActiveScopes();

  const handleStartEdit = useCallback((hotkey: ResolvedHotkey) => {
    setEditingId(hotkey.id);
    setEditingKeys(hotkey.customKeys ?? hotkey.keys);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;

    const hotkey = resolvedHotkeys.find((h) => h.id === editingId);
    if (!hotkey) return;

    const reserved = checkReservedShortcut(editingKeys);
    if (reserved) {
      setReservedWarning({
        keys: editingKeys,
        description: reserved,
        hotkeyId: editingId,
      });
      return;
    }

    const conflicts = detectConflicts(editingKeys, hotkey.scope, editingId);
    if (conflicts.length > 0) {
      const conflictNames = conflicts[0].conflictsWith
        .map((id) => {
          const h = resolvedHotkeys.find((r) => r.id === id);
          return h?.description || id;
        })
        .join(", ");
      toast.error(`Conflict with: ${conflictNames}`);
      return;
    }

    await setCustomKeys(editingId, editingKeys);
    setEditingId(null);
    setEditingKeys("");
    toast.success("Shortcut updated");
  }, [
    editingId,
    editingKeys,
    resolvedHotkeys,
    checkReservedShortcut,
    detectConflicts,
    setCustomKeys,
  ]);

  const handleConfirmReserved = useCallback(async () => {
    if (!reservedWarning) return;

    const hotkey = resolvedHotkeys.find(
      (h) => h.id === reservedWarning.hotkeyId
    );
    if (!hotkey) return;

    const conflicts = detectConflicts(
      reservedWarning.keys,
      hotkey.scope,
      reservedWarning.hotkeyId
    );
    if (conflicts.length > 0) {
      const conflictNames = conflicts[0].conflictsWith
        .map((id) => {
          const h = resolvedHotkeys.find((r) => r.id === id);
          return h?.description || id;
        })
        .join(", ");
      toast.error(`Conflict with: ${conflictNames}`);
      setReservedWarning(null);
      return;
    }

    await setCustomKeys(reservedWarning.hotkeyId, reservedWarning.keys);
    setReservedWarning(null);
    setEditingId(null);
    setEditingKeys("");
    toast.success("Shortcut updated");
  }, [reservedWarning, resolvedHotkeys, detectConflicts, setCustomKeys]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingKeys("");
  }, []);

  const handleKeyCapture = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const parts: string[] = [];
      if (e.metaKey) parts.push("meta");
      if (e.ctrlKey) parts.push("ctrl");
      if (e.altKey) parts.push("alt");
      if (e.shiftKey) parts.push("shift");

      const key = e.key.toLowerCase();
      if (!["meta", "control", "alt", "shift"].includes(key)) {
        parts.push(key === " " ? "space" : key);
      }

      if (parts.length === 0) return;

      const newKey = parts.join("+");
      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }

      const isSingleKey =
        parts.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey;
      const isWithinSequenceWindow =
        timeSinceLastKey < SEQUENCE_TIMEOUT && lastKeyTimeRef.current > 0;

      if (
        isSingleKey &&
        isWithinSequenceWindow &&
        editingKeys &&
        !editingKeys.includes("+")
      ) {
        setEditingKeys((prev) => prev + ">" + newKey);
      } else {
        setEditingKeys(newKey);
      }

      lastKeyTimeRef.current = now;

      sequenceTimeoutRef.current = setTimeout(() => {
        lastKeyTimeRef.current = 0;
      }, SEQUENCE_TIMEOUT);
    },
    [editingKeys, SEQUENCE_TIMEOUT]
  );

  const handleToggle = useCallback(
    async (hotkeyId: string, enabled: boolean) => {
      await toggleHotkey(hotkeyId, enabled);
      toast.success(enabled ? "Shortcut enabled" : "Shortcut disabled");
    },
    [toggleHotkey]
  );

  const handleReset = useCallback(
    async (hotkeyId: string) => {
      await resetHotkey(hotkeyId);
      toast.success("Shortcut reset to default");
    },
    [resetHotkey]
  );

  const handleResetScope = useCallback(
    async (scope: HotkeyScope) => {
      await resetScope(scope);
      toast.success(`Reset all ${SCOPE_LABELS[scope]} shortcuts`);
    },
    [resetScope]
  );

  const handleResetAll = useCallback(async () => {
    await resetAll();
    toast.success("All shortcuts reset to defaults");
  }, [resetAll]);

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Scope selector and reset */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Scope:
          </span>
          <Select
            value={activeScope}
            onValueChange={(v) => setActiveScope(v as HotkeyScope)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scopes.map((scope) => (
                <SelectItem
                  key={scope}
                  value={scope}
                  disabled={!groupedHotkeys[scope]?.length}
                >
                  <span className="flex items-center gap-2">
                    {SCOPE_LABELS[scope]}
                    {groupedHotkeys[scope]?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {groupedHotkeys[scope].length}
                      </Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleResetScope(activeScope)}
            disabled={isSaving}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Hotkeys list */}
        <div className="space-y-2">
          {(groupedHotkeys[activeScope] || []).map((hotkey) => (
            <HotkeyRow
              key={hotkey.id}
              hotkey={hotkey}
              isEditing={editingId === hotkey.id}
              editingKeys={editingKeys}
              isSaving={isSaving}
              onToggle={handleToggle}
              onStartEdit={handleStartEdit}
              onReset={handleReset}
              onKeyCapture={handleKeyCapture}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
            />
          ))}

          {!groupedHotkeys[activeScope]?.length && (
            <div className="text-center py-8 text-muted-foreground">
              No shortcuts found
            </div>
          )}
        </div>

        {/* Reset all */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleResetAll}
            disabled={isSaving}
          >
            Reset All to Defaults
          </Button>
        </div>
      </div>

      {/* Reserved shortcut warning dialog */}
      <AlertDialog
        open={!!reservedWarning}
        onOpenChange={() => setReservedWarning(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Browser Shortcut Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              The shortcut <HotkeyBadge keys={reservedWarning?.keys || null} />{" "}
              is typically used by your browser for &quot;
              {reservedWarning?.description}&quot;. Using it here may override
              that behavior.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReserved}>
              Use Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
