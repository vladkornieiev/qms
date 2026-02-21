export interface RoleOption {
  value: string;
  label: string;
}

export const ALL_ROLE_OPTIONS: RoleOption[] = [
  { value: "VIEWER", label: "Viewer" },
  { value: "MEMBER", label: "Member" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "ADMIN", label: "Admin" },
  { value: "OWNER", label: "Owner" },
];

export const ADMIN_ASSIGNABLE_ROLES: RoleOption[] = [
  { value: "VIEWER", label: "Viewer" },
  { value: "MEMBER", label: "Member" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "ADMIN", label: "Admin" },
];

export const OWNER_ASSIGNABLE_ROLES: RoleOption[] = [
  { value: "VIEWER", label: "Viewer" },
  { value: "MEMBER", label: "Member" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "ADMIN", label: "Admin" },
];

export const DEFAULT_ROLE = "MEMBER";
