import { useAuthStore } from "@/store/auth-store";
import {
  Role,
  hasRole,
  isOwner,
  isAdmin,
  isPlatformAdmin,
  canManageUsers,
  canManageAllUsers,
  canManageOrganizations,
  canViewFinancials,
} from "@/lib/permissions";

export function usePermissions() {
  const { user } = useAuthStore();

  return {
    user,
    hasRole: (role: Role | Role[]) => hasRole(user, role),
    isOwner: () => isOwner(user),
    isPlatformAdmin: () => isPlatformAdmin(user),
    isAdmin: () => isAdmin(user),
    canManageUsers: () => canManageUsers(user),
    canManageAllUsers: () => canManageAllUsers(user),
    canManageOrganizations: () => canManageOrganizations(user),
    canManageAccounts: () => canManageOrganizations(user),
    canViewFinancials: () => canViewFinancials(user),
  };
}
