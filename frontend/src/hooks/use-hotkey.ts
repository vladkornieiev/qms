"use client";

import { useHotkeys, useHotkeysContext } from "react-hotkeys-hook";
import { useCallback, useEffect } from "react";
import { useHotkeysConfig } from "@/contexts/hotkeys-context";
import { usePreferencesDialog } from "@/contexts/user-preferences-context";
import type { HotkeyScope } from "@/types/hotkeys";
import { getHotkeyById } from "@/lib/hotkeys/registry";

interface UseHotkeyOptions {
  enabled?: boolean;
  enableOnFormTags?: boolean;
  preventDefault?: boolean;
}

/**
 * Use a registered hotkey by ID
 * Automatically applies user customizations and scope handling
 */
export function useHotkey(
  hotkeyId: string,
  callback: () => void,
  options: UseHotkeyOptions = {},
  deps: unknown[] = []
) {
  const { getKeys, isHotkeyEnabled } = useHotkeysConfig();

  const keys = getKeys(hotkeyId);
  const isEnabled = isHotkeyEnabled(hotkeyId) && (options.enabled ?? true);

  const definition = getHotkeyById(hotkeyId);
  const scope = definition?.scope ?? "global";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(callback, deps);

  // For global scope, use wildcard '*' to work everywhere
  // For other scopes, use the specific scope
  const scopeOptions = scope === "global" ? {} : { scopes: [scope] };

  // Check if we need ignoreModifiers for special characters
  const needsIgnoreModifiers = keys
    ? /^[?!@#$%^&*()_+={}[\]|\\:;"'<>,./`~]$/.test(keys)
    : false;

  useHotkeys(
    keys || "",
    memoizedCallback,
    {
      enabled: isEnabled && !!keys,
      ...scopeOptions,
      enableOnFormTags:
        options.enableOnFormTags ?? definition?.enableOnFormTags ?? false,
      preventDefault: options.preventDefault ?? true,
      ignoreModifiers: needsIgnoreModifiers,
    },
    [keys, isEnabled, scope, needsIgnoreModifiers, ...deps]
  );
}

/**
 * Activate/deactivate a scope when component mounts/unmounts
 */
export function useHotkeyScope(scope: HotkeyScope) {
  const { enableScope, disableScope } = useHotkeysContext();

  useEffect(() => {
    enableScope(scope);
    return () => {
      disableScope(scope);
    };
  }, [scope, enableScope, disableScope]);
}

/**
 * Get scope controller for manual activation
 */
export function useHotkeyScopeControl() {
  const { enableScope, disableScope, activeScopes } = useHotkeysContext();

  return {
    enableScope,
    disableScope,
    activeScopes,
    isActive: (scope: HotkeyScope) => activeScopes.includes(scope),
  };
}

/**
 * Show the cheat sheet hotkey (press Cmd+/ or Ctrl+/)
 */
export function useCheatSheetHotkey() {
  const { openCheatSheet } = useHotkeysConfig();
  useHotkey("global.show-hotkeys", openCheatSheet);
}

/**
 * Open the preferences dialog hotkey (press Cmd+Shift+, or Ctrl+Shift+,)
 */
export function usePreferencesDialogHotkey() {
  const { openPreferencesDialog } = usePreferencesDialog();
  useHotkey("global.open-preferences", openPreferencesDialog);
}
