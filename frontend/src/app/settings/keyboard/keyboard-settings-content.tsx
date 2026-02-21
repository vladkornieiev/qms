"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Keyboard,
  RefreshCw,
  Search,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useHotkeysConfig } from "@/contexts/hotkeys-context";
import { HotkeyBadge } from "@/components/hotkeys/hotkey-badge";
import type { HotkeyScope, ResolvedHotkey } from "@/types/hotkeys";
import {
  SCOPE_LABELS,
  CATEGORY_LABELS,
  getActiveScopes,
} from "@/lib/hotkeys/registry";
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

export function KeyboardSettingsContent() {
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

  // Group hotkeys by scope
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

    // Check for reserved shortcut
    const reserved = checkReservedShortcut(editingKeys);
    if (reserved) {
      setReservedWarning({
        keys: editingKeys,
        description: reserved,
        hotkeyId: editingId,
      });
      return;
    }

    // Detect conflicts
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

      if (parts.length > 0) {
        setEditingKeys(parts.join("+"));
      }
    },
    []
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Keyboard className="h-6 w-6" />
                Keyboard Shortcuts
              </h1>
              <p className="text-muted-foreground">
                Customize keyboard shortcuts for your workflow
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleResetAll}
            disabled={isSaving}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset All
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Scope tabs */}
        <Tabs
          value={activeScope}
          onValueChange={(v) => setActiveScope(v as HotkeyScope)}
        >
          <TabsList className="flex-wrap h-auto gap-1 justify-start">
            {scopes.map((scope) => (
              <TabsTrigger
                key={scope}
                value={scope}
                disabled={!groupedHotkeys[scope]?.length}
              >
                {SCOPE_LABELS[scope]}
                {groupedHotkeys[scope]?.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {groupedHotkeys[scope].length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {scopes.map((scope) => (
            <TabsContent key={scope} value={scope} className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{SCOPE_LABELS[scope]}</CardTitle>
                    <CardDescription>
                      Shortcuts available in {SCOPE_LABELS[scope].toLowerCase()}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetScope(scope)}
                    disabled={isSaving}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Scope
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(groupedHotkeys[scope] || []).map((hotkey) => (
                      <div
                        key={hotkey.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-background"
                      >
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={hotkey.isEnabled}
                            onCheckedChange={(checked) =>
                              handleToggle(hotkey.id, checked)
                            }
                            disabled={isSaving}
                          />
                          <div>
                            <p className="font-medium">{hotkey.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {CATEGORY_LABELS[hotkey.category]}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {hotkey.isCustomized && (
                            <Badge variant="outline">Customized</Badge>
                          )}

                          {editingId === hotkey.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingKeys}
                                onKeyDown={handleKeyCapture}
                                onChange={() => {}}
                                placeholder="Press keys..."
                                className="w-40 text-center"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={isSaving || !editingKeys}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <HotkeyBadge
                                keys={hotkey.customKeys ?? hotkey.keys}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartEdit(hotkey)}
                                disabled={!hotkey.isEnabled}
                              >
                                Edit
                              </Button>
                              {hotkey.isCustomized && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleReset(hotkey.id)}
                                  disabled={isSaving}
                                >
                                  Reset
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {!groupedHotkeys[scope]?.length && (
                      <div className="text-center py-12 text-muted-foreground">
                        No shortcuts found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
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
