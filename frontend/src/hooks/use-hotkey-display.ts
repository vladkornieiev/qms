"use client";

import { useMemo } from "react";

/**
 * Format hotkey for display with proper symbols
 */
export function useHotkeyDisplay(keys: string | null): string {
  return useMemo(() => {
    if (!keys) return "";

    const isMac =
      typeof navigator !== "undefined" &&
      navigator.platform.toLowerCase().includes("mac");

    const modifiers: Record<string, string> = isMac
      ? {
          meta: "\u2318", // Command
          ctrl: "\u2303", // Control
          alt: "\u2325", // Option
          shift: "\u21E7", // Shift
          mod: "\u2318", // Command (on Mac)
        }
      : {
          meta: "Win",
          ctrl: "Ctrl",
          alt: "Alt",
          shift: "Shift",
          mod: "Ctrl",
        };

    const specialKeys: Record<string, string> = {
      enter: "\u23CE",
      escape: "Esc",
      backspace: "\u232B",
      delete: "\u2326",
      tab: "\u21E5",
      space: "\u2423",
      arrowup: "\u2191",
      arrowdown: "\u2193",
      arrowleft: "\u2190",
      arrowright: "\u2192",
      slash: "/",
    };

    // Handle sequence keys (like "g>d")
    if (keys.includes(">")) {
      return keys
        .split(">")
        .map((k) => k.toUpperCase())
        .join(" then ");
    }

    return keys
      .split("+")
      .map((key) => {
        const k = key.trim().toLowerCase();
        return modifiers[k] || specialKeys[k] || key.toUpperCase();
      })
      .join(isMac ? "" : " + ");
  }, [keys]);
}

/**
 * Get raw platform-aware key display (for badges)
 */
export function formatHotkeyForDisplay(keys: string | null): string {
  if (!keys) return "";

  const isMac =
    typeof window !== "undefined" &&
    navigator.platform.toLowerCase().includes("mac");

  const modifiers: Record<string, string> = isMac
    ? {
        meta: "\u2318",
        ctrl: "\u2303",
        alt: "\u2325",
        shift: "\u21E7",
        mod: "\u2318",
      }
    : {
        meta: "Win",
        ctrl: "Ctrl",
        alt: "Alt",
        shift: "Shift",
        mod: "Ctrl",
      };

  const specialKeys: Record<string, string> = {
    enter: "\u23CE",
    escape: "Esc",
    backspace: "\u232B",
    delete: "\u2326",
    tab: "\u21E5",
    space: "\u2423",
    arrowup: "\u2191",
    arrowdown: "\u2193",
    arrowleft: "\u2190",
    arrowright: "\u2192",
    slash: "/",
  };

  // Handle sequence keys (like "g>d")
  if (keys.includes(">")) {
    return keys
      .split(">")
      .map((k) => k.toUpperCase())
      .join(" ");
  }

  return keys
    .split("+")
    .map((key) => {
      const k = key.trim().toLowerCase();
      return modifiers[k] || specialKeys[k] || key.toUpperCase();
    })
    .join(isMac ? "" : "+");
}
