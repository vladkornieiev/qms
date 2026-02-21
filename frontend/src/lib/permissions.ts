import { User } from "./auth-client";

export enum Role {
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
  ACCOUNTANT = "ACCOUNTANT",
}

export function hasRole(user: User | null, role: Role | Role[]): boolean {
  if (!user?.roles) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.some((r) => user.roles.includes(r));
}

export function isOwner(user: User | null): boolean {
  return hasRole(user, Role.OWNER);
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, [Role.ADMIN, Role.OWNER]);
}

export function isPlatformAdmin(user: User | null): boolean {
  return hasRole(user, Role.PLATFORM_ADMIN);
}

export function canManageUsers(user: User | null): boolean {
  return hasRole(user, [Role.ADMIN, Role.OWNER]);
}

export function canManageAllUsers(user: User | null): boolean {
  return isPlatformAdmin(user);
}

export function canManageOrganizations(user: User | null): boolean {
  return isPlatformAdmin(user);
}

// Backward-compatible alias
export function canManageAccounts(user: User | null): boolean {
  return canManageOrganizations(user);
}

export function canViewFinancials(user: User | null): boolean {
  return hasRole(user, [Role.ACCOUNTANT, Role.OWNER]);
}
