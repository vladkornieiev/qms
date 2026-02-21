// Schema version for migrations
export const HOTKEYS_SCHEMA_VERSION = 1;

// Hotkey scope identifiers
export type HotkeyScope =
  | "global"
  | "users"
  | "admin-users"
  | "accounts"
  | "admin"
  | "dialogs";

export type HotkeyCategory = "navigation" | "actions" | "dialogs" | "view";

export interface HotkeyDefinition {
  id: string;
  keys: string;
  description: string;
  scope: HotkeyScope;
  category: HotkeyCategory;
  enableOnFormTags?: boolean;
  enabled?: boolean;
}

// User's customization for a single hotkey
export interface HotkeyCustomization {
  keys?: string | null;
  enabled?: boolean;
}

// Stored user preferences
export interface HotkeyPreferences {
  schemaVersion: number;
  customizations: Record<string, HotkeyCustomization>;
  disabledScopes?: HotkeyScope[];
}

// Resolved hotkey (definition + customization merged)
export interface ResolvedHotkey extends HotkeyDefinition {
  customKeys?: string | null;
  isCustomized: boolean;
  isEnabled: boolean;
}

// Conflict detection result
export interface HotkeyConflict {
  hotkeyId: string;
  conflictsWith: string[];
  scope: HotkeyScope;
  keys: string;
}

// Reserved browser/OS shortcuts to warn about
export const RESERVED_SHORTCUTS: Record<string, string> = {
  "mod+t": "New tab",
  "mod+w": "Close tab",
  "mod+n": "New window",
  "mod+q": "Quit application",
  "mod+r": "Refresh page",
  "mod+p": "Print",
  "mod+s": "Save page",
  "mod+f": "Find in page",
  "mod+g": "Find next",
  "mod+h": "History",
  "mod+j": "Downloads",
  "mod+l": "Address bar",
  f1: "Help",
  f5: "Refresh",
  f11: "Fullscreen",
  f12: "DevTools",
};
