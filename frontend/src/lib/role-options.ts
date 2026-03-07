import { formatEnum } from "./utils";

export interface RoleOption {
  value: string;
  label: string;
}

function role(value: string): RoleOption {
  return { value, label: formatEnum(value) };
}

// All roles including PLATFORM_ADMIN — for platform admin pages only
export const ALL_ROLE_OPTIONS: RoleOption[] = [
  role("VIEWER"),
  role("MEMBER"),
  role("ACCOUNTANT"),
  role("ADMIN"),
  role("OWNER"),
  role("PLATFORM_ADMIN"),
];

// Roles an ADMIN can assign (cannot assign OWNER or PLATFORM_ADMIN)
export const ADMIN_ASSIGNABLE_ROLES: RoleOption[] = [
  role("VIEWER"),
  role("MEMBER"),
  role("ACCOUNTANT"),
  role("ADMIN"),
];

// Roles an OWNER can assign (can assign OWNER, but not PLATFORM_ADMIN)
export const OWNER_ASSIGNABLE_ROLES: RoleOption[] = [
  role("VIEWER"),
  role("MEMBER"),
  role("ACCOUNTANT"),
  role("ADMIN"),
  role("OWNER"),
];

export const DEFAULT_ROLE = "MEMBER";
