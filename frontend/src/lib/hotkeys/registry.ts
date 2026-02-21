import type {
  HotkeyDefinition,
  HotkeyScope,
  HotkeyCategory,
} from "@/types/hotkeys";

// Central registry of all hotkeys
export const HOTKEY_DEFINITIONS: HotkeyDefinition[] = [
  // === GLOBAL SCOPE ===
  {
    id: "global.toggle-sidebar",
    keys: "mod+b",
    description: "Toggle sidebar",
    scope: "global",
    category: "navigation",
  },
  {
    id: "global.show-hotkeys",
    keys: "mod+k",
    description: "Show keyboard shortcuts",
    scope: "global",
    category: "dialogs",
  },
  {
    id: "global.open-preferences",
    keys: "mod+shift+comma",
    description: "Open preferences",
    scope: "global",
    category: "dialogs",
  },
  {
    id: "global.go-to-dashboard",
    keys: "g>d",
    description: "Go to dashboard",
    scope: "global",
    category: "navigation",
  },
  {
    id: "global.go-to-users",
    keys: "g>u",
    description: "Go to users",
    scope: "global",
    category: "navigation",
  },
  {
    id: "global.go-to-accounts",
    keys: "g>a",
    description: "Go to organizations",
    scope: "global",
    category: "navigation",
  },
  {
    id: "global.toggle-context",
    keys: "g>g",
    description: "Toggle workspace/admin",
    scope: "global",
    category: "navigation",
  },

  // === USERS SCOPE ===
  {
    id: "users.new-user",
    keys: "n",
    description: "Create new user",
    scope: "users",
    category: "actions",
  },
  {
    id: "users.refresh",
    keys: "r",
    description: "Refresh user list",
    scope: "users",
    category: "actions",
  },
  {
    id: "users.navigate-down",
    keys: "j",
    description: "Select next user",
    scope: "users",
    category: "navigation",
  },
  {
    id: "users.navigate-up",
    keys: "k",
    description: "Select previous user",
    scope: "users",
    category: "navigation",
  },
  {
    id: "users.edit-selected",
    keys: "enter",
    description: "Edit selected user",
    scope: "users",
    category: "actions",
  },
  {
    id: "users.delete-selected",
    keys: "backspace",
    description: "Delete selected user",
    scope: "users",
    category: "actions",
  },

  // === ADMIN USERS SCOPE ===
  {
    id: "admin-users.new-user",
    keys: "n",
    description: "Create new user",
    scope: "admin-users",
    category: "actions",
  },
  {
    id: "admin-users.refresh",
    keys: "r",
    description: "Refresh user list",
    scope: "admin-users",
    category: "actions",
  },
  {
    id: "admin-users.navigate-down",
    keys: "j",
    description: "Select next user",
    scope: "admin-users",
    category: "navigation",
  },
  {
    id: "admin-users.navigate-up",
    keys: "k",
    description: "Select previous user",
    scope: "admin-users",
    category: "navigation",
  },
  {
    id: "admin-users.edit-selected",
    keys: "enter",
    description: "Edit selected user",
    scope: "admin-users",
    category: "actions",
  },
  {
    id: "admin-users.delete-selected",
    keys: "backspace",
    description: "Delete selected user",
    scope: "admin-users",
    category: "actions",
  },

  // === ACCOUNTS SCOPE ===
  {
    id: "accounts.new-account",
    keys: "n",
    description: "Create new organization",
    scope: "accounts",
    category: "actions",
  },
  {
    id: "accounts.refresh",
    keys: "r",
    description: "Refresh organization list",
    scope: "accounts",
    category: "actions",
  },
  {
    id: "accounts.navigate-down",
    keys: "j",
    description: "Select next organization",
    scope: "accounts",
    category: "navigation",
  },
  {
    id: "accounts.navigate-up",
    keys: "k",
    description: "Select previous organization",
    scope: "accounts",
    category: "navigation",
  },
  {
    id: "accounts.edit-selected",
    keys: "enter",
    description: "Edit selected organization",
    scope: "accounts",
    category: "actions",
  },
  {
    id: "accounts.delete-selected",
    keys: "backspace",
    description: "Delete selected organization",
    scope: "accounts",
    category: "actions",
  },

  // === DIALOGS SCOPE ===
  {
    id: "dialogs.close",
    keys: "escape",
    description: "Close dialog",
    scope: "dialogs",
    category: "dialogs",
  },
  {
    id: "dialogs.confirm",
    keys: "mod+enter",
    description: "Confirm dialog action",
    scope: "dialogs",
    category: "dialogs",
    enableOnFormTags: true,
  },
];

// Helper to get definitions by scope
export function getHotkeysByScope(scope: HotkeyScope): HotkeyDefinition[] {
  return HOTKEY_DEFINITIONS.filter((h) => h.scope === scope);
}

// Helper to get definition by ID
export function getHotkeyById(id: string): HotkeyDefinition | undefined {
  return HOTKEY_DEFINITIONS.find((h) => h.id === id);
}

// Scope display labels for UI
export const SCOPE_LABELS: Record<HotkeyScope, string> = {
  global: "Global",
  users: "Users Management",
  "admin-users": "Admin - Users",
  accounts: "Organizations Management",
  admin: "Administration",
  dialogs: "Dialogs",
};

// Category display labels for UI
export const CATEGORY_LABELS: Record<HotkeyCategory, string> = {
  navigation: "Navigation",
  actions: "Actions",
  dialogs: "Dialogs",
  view: "View",
};

// Get all unique scopes that have hotkeys defined
export function getActiveScopes(): HotkeyScope[] {
  const scopes = new Set<HotkeyScope>();
  for (const def of HOTKEY_DEFINITIONS) {
    scopes.add(def.scope);
  }
  return Array.from(scopes);
}
