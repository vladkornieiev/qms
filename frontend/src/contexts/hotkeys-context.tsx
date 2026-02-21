"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
} from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { HotkeysProvider as ReactHotkeysProvider } from "react-hotkeys-hook";
import { authClient } from "@/lib/auth-client";
import {
  useCurrentUserWithAttributes,
  CURRENT_USER_QUERY_KEY,
  type CurrentUserWithAttributes,
} from "@/hooks/use-current-user-with-attributes";
import type {
  HotkeyPreferences,
  HotkeyCustomization,
  ResolvedHotkey,
  HotkeyScope,
  HotkeyConflict,
} from "@/types/hotkeys";
import { HOTKEYS_SCHEMA_VERSION, RESERVED_SHORTCUTS } from "@/types/hotkeys";
import { HOTKEY_DEFINITIONS } from "@/lib/hotkeys/registry";

const API_USERS_ME_ENDPOINT = "/api/users/me";

interface HotkeysContextValue {
  resolvedHotkeys: ResolvedHotkey[];

  // Get effective keys for a hotkey ID
  getKeys: (hotkeyId: string) => string | null;

  // Check if hotkey is enabled
  isHotkeyEnabled: (hotkeyId: string) => boolean;

  // Customization actions
  setCustomKeys: (hotkeyId: string, keys: string | null) => Promise<void>;
  toggleHotkey: (hotkeyId: string, enabled: boolean) => Promise<void>;
  resetHotkey: (hotkeyId: string) => Promise<void>;
  resetScope: (scope: HotkeyScope) => Promise<void>;
  resetAll: () => Promise<void>;

  // Conflict detection
  detectConflicts: (
    keys: string,
    scope: HotkeyScope,
    excludeId?: string
  ) => HotkeyConflict[];
  checkReservedShortcut: (keys: string) => string | null;

  // Loading state
  isLoading: boolean;
  isSaving: boolean;

  // Cheat sheet modal
  isCheatSheetOpen: boolean;
  openCheatSheet: () => void;
  closeCheatSheet: () => void;

  // Management dialog
  isManagementDialogOpen: boolean;
  openManagementDialog: () => void;
  closeManagementDialog: () => void;
}

const HotkeysContext = createContext<HotkeysContextValue | null>(null);

// Helper to normalize key strings for comparison
function normalizeKeys(keys: string): string {
  return keys
    .toLowerCase()
    .split(/[+\s]+/)
    .map((k) => k.trim())
    .filter(Boolean)
    .sort()
    .join("+");
}

// Helper to determine platform-specific modifier
function getPlatformModifier(): "meta" | "ctrl" {
  if (typeof window === "undefined") return "ctrl";
  return navigator.platform.toLowerCase().includes("mac") ? "meta" : "ctrl";
}

// Replace 'mod' with platform-specific modifier
function resolveModKey(keys: string): string {
  const modifier = getPlatformModifier();
  return keys.replace(/\bmod\b/gi, modifier);
}

function getDefaultPreferences(): HotkeyPreferences {
  return {
    schemaVersion: HOTKEYS_SCHEMA_VERSION,
    customizations: {},
  };
}

function migratePreferences(
  stored: HotkeyPreferences | undefined
): HotkeyPreferences {
  if (!stored) return getDefaultPreferences();

  // Future: handle schema migrations
  if (stored.schemaVersion < HOTKEYS_SCHEMA_VERSION) {
    // Migration logic here when needed
  }

  return {
    ...stored,
    schemaVersion: HOTKEYS_SCHEMA_VERSION,
  };
}

interface HotkeysProviderProps {
  children: React.ReactNode;
}

export function HotkeysProvider({ children }: HotkeysProviderProps) {
  const queryClient = useQueryClient();
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isManagementDialogOpen, setIsManagementDialogOpen] = useState(false);

  const { data: userData, isLoading } = useCurrentUserWithAttributes();

  const preferences = useMemo<HotkeyPreferences>(() => {
    if (!userData?.attributes) return getDefaultPreferences();
    const stored = userData.attributes.hotkeyPreferences as
      | HotkeyPreferences
      | undefined;
    return migratePreferences(stored);
  }, [userData?.attributes]);

  const saveMutation = useMutation({
    mutationFn: async (newPrefs: HotkeyPreferences) => {
      const currentAttributes = userData?.attributes ?? {};
      const attributes = {
        ...currentAttributes,
        hotkeyPreferences: newPrefs,
      };
      await authClient.apiRequest(API_USERS_ME_ENDPOINT, {
        method: "PATCH",
        body: JSON.stringify({ attributes }),
      });
      return newPrefs;
    },
    onSuccess: (newPrefs) => {
      queryClient.setQueryData(
        CURRENT_USER_QUERY_KEY,
        (old: CurrentUserWithAttributes | null | undefined) => {
          if (!old) return old;
          return {
            ...old,
            attributes: {
              ...old.attributes,
              hotkeyPreferences: newPrefs,
            },
          };
        }
      );
    },
  });

  const resolvedHotkeys = useMemo<ResolvedHotkey[]>(() => {
    const prefs = preferences ?? getDefaultPreferences();

    return HOTKEY_DEFINITIONS.map((def) => {
      const customization = prefs.customizations[def.id];
      const customKeys = customization?.keys;
      const defaultEnabled = def.enabled ?? true;
      const isEnabled = customization?.enabled ?? defaultEnabled;

      // Only mark as customized if keys differ from default (disabled is not "customized")
      const hasCustomKeys =
        customKeys !== undefined &&
        customKeys !== null &&
        customKeys !== def.keys;

      return {
        ...def,
        customKeys,
        isCustomized: hasCustomKeys,
        isEnabled,
      };
    });
  }, [preferences]);

  // Get effective keys for a hotkey
  const getKeys = useCallback(
    (hotkeyId: string): string | null => {
      const resolved = resolvedHotkeys.find((h) => h.id === hotkeyId);
      if (!resolved?.isEnabled) return null;
      const keys = resolved.customKeys ?? resolved.keys;
      return resolveModKey(keys);
    },
    [resolvedHotkeys]
  );

  // Check if hotkey is enabled
  const isHotkeyEnabled = useCallback(
    (hotkeyId: string): boolean => {
      const resolved = resolvedHotkeys.find((h) => h.id === hotkeyId);
      return resolved?.isEnabled ?? false;
    },
    [resolvedHotkeys]
  );

  // Set custom keys
  const setCustomKeys = useCallback(
    async (hotkeyId: string, keys: string | null) => {
      const prefs = preferences ?? getDefaultPreferences();
      const def = HOTKEY_DEFINITIONS.find((d) => d.id === hotkeyId);
      const existingCustomization = prefs.customizations[hotkeyId];
      const defaultEnabled = def?.enabled ?? true;

      // Check if keys match default (or are being cleared to default)
      const isDefaultKeys = keys === null || keys === def?.keys;
      const hasCustomEnabled =
        existingCustomization?.enabled !== undefined &&
        existingCustomization.enabled !== defaultEnabled;

      // If keys match default and no custom enabled state, remove customization entirely
      if (isDefaultKeys && !hasCustomEnabled) {
        const { [hotkeyId]: _, ...rest } = prefs.customizations;
        const newPrefs: HotkeyPreferences = {
          ...prefs,
          customizations: rest,
        };
        await saveMutation.mutateAsync(newPrefs);
        return;
      }

      // Otherwise, update the customization
      const newCustomization: HotkeyCustomization = {
        ...existingCustomization,
        keys: isDefaultKeys ? undefined : keys,
      };
      const newPrefs: HotkeyPreferences = {
        ...prefs,
        customizations: {
          ...prefs.customizations,
          [hotkeyId]: newCustomization,
        },
      };
      await saveMutation.mutateAsync(newPrefs);
    },
    [preferences, saveMutation]
  );

  // Toggle hotkey enabled state
  const toggleHotkey = useCallback(
    async (hotkeyId: string, enabled: boolean) => {
      const prefs = preferences ?? getDefaultPreferences();
      const def = HOTKEY_DEFINITIONS.find((d) => d.id === hotkeyId);
      const defaultEnabled = def?.enabled ?? true;
      const existingCustomization = prefs.customizations[hotkeyId];

      // If toggling back to default and no custom keys, remove the customization entirely
      if (enabled === defaultEnabled && !existingCustomization?.keys) {
        const { [hotkeyId]: _, ...rest } = prefs.customizations;
        const newPrefs: HotkeyPreferences = {
          ...prefs,
          customizations: rest,
        };
        await saveMutation.mutateAsync(newPrefs);
        return;
      }

      // Otherwise, update or create the customization
      const newCustomization: HotkeyCustomization = {
        ...existingCustomization,
        enabled,
      };
      const newPrefs: HotkeyPreferences = {
        ...prefs,
        customizations: {
          ...prefs.customizations,
          [hotkeyId]: newCustomization,
        },
      };
      await saveMutation.mutateAsync(newPrefs);
    },
    [preferences, saveMutation]
  );

  // Reset a single hotkey
  const resetHotkey = useCallback(
    async (hotkeyId: string) => {
      const prefs = preferences ?? getDefaultPreferences();
      const { [hotkeyId]: _, ...rest } = prefs.customizations;
      const newPrefs: HotkeyPreferences = {
        ...prefs,
        customizations: rest,
      };
      await saveMutation.mutateAsync(newPrefs);
    },
    [preferences, saveMutation]
  );

  // Reset entire scope
  const resetScope = useCallback(
    async (scope: HotkeyScope) => {
      const prefs = preferences ?? getDefaultPreferences();
      const scopeIds = HOTKEY_DEFINITIONS.filter((h) => h.scope === scope).map(
        (h) => h.id
      );
      const newCustomizations = { ...prefs.customizations };
      for (const id of scopeIds) {
        delete newCustomizations[id];
      }
      const newPrefs: HotkeyPreferences = {
        ...prefs,
        customizations: newCustomizations,
      };
      await saveMutation.mutateAsync(newPrefs);
    },
    [preferences, saveMutation]
  );

  // Reset all customizations
  const resetAll = useCallback(async () => {
    await saveMutation.mutateAsync(getDefaultPreferences());
  }, [saveMutation]);

  // Detect conflicts within scope and global
  const detectConflicts = useCallback(
    (
      keys: string,
      scope: HotkeyScope,
      excludeId?: string
    ): HotkeyConflict[] => {
      const normalizedNew = normalizeKeys(resolveModKey(keys));
      const conflicts: HotkeyConflict[] = [];

      // Check within same scope and global scope
      const scopesToCheck: HotkeyScope[] =
        scope === "global" ? ["global"] : [scope, "global"];

      for (const hotkey of resolvedHotkeys) {
        if (hotkey.id === excludeId) continue;
        if (!hotkey.isEnabled) continue;
        if (!scopesToCheck.includes(hotkey.scope)) continue;

        const existingKeys = hotkey.customKeys ?? hotkey.keys;
        const normalizedExisting = normalizeKeys(resolveModKey(existingKeys));

        if (normalizedNew === normalizedExisting) {
          const existing = conflicts.find(
            (c) => c.keys === keys && c.scope === scope
          );
          if (existing) {
            existing.conflictsWith.push(hotkey.id);
          } else {
            conflicts.push({
              hotkeyId: excludeId || "",
              conflictsWith: [hotkey.id],
              scope,
              keys,
            });
          }
        }
      }

      return conflicts;
    },
    [resolvedHotkeys]
  );

  // Check if keys conflict with reserved browser shortcuts
  const checkReservedShortcut = useCallback((keys: string): string | null => {
    const normalized = normalizeKeys(resolveModKey(keys));
    for (const [reserved, description] of Object.entries(RESERVED_SHORTCUTS)) {
      if (normalizeKeys(resolveModKey(reserved)) === normalized) {
        return description;
      }
    }
    return null;
  }, []);

  const value = useMemo<HotkeysContextValue>(
    () => ({
      resolvedHotkeys,
      getKeys,
      isHotkeyEnabled,
      setCustomKeys,
      toggleHotkey,
      resetHotkey,
      resetScope,
      resetAll,
      detectConflicts,
      checkReservedShortcut,
      isLoading,
      isSaving: saveMutation.isPending,
      isCheatSheetOpen,
      openCheatSheet: () => setIsCheatSheetOpen(true),
      closeCheatSheet: () => setIsCheatSheetOpen(false),
      isManagementDialogOpen,
      openManagementDialog: () => setIsManagementDialogOpen(true),
      closeManagementDialog: () => setIsManagementDialogOpen(false),
    }),
    [
      resolvedHotkeys,
      getKeys,
      isHotkeyEnabled,
      setCustomKeys,
      toggleHotkey,
      resetHotkey,
      resetScope,
      resetAll,
      detectConflicts,
      checkReservedShortcut,
      isLoading,
      saveMutation.isPending,
      isCheatSheetOpen,
      isManagementDialogOpen,
    ]
  );

  // Initial active scopes
  const initialScopes = useMemo(() => ["global", "*"], []);

  return (
    <HotkeysContext.Provider value={value}>
      <ReactHotkeysProvider initiallyActiveScopes={initialScopes}>
        {children}
      </ReactHotkeysProvider>
    </HotkeysContext.Provider>
  );
}

export function useHotkeysConfig(): HotkeysContextValue {
  const context = useContext(HotkeysContext);
  if (!context) {
    throw new Error("useHotkeysConfig must be used within a HotkeysProvider");
  }
  return context;
}
