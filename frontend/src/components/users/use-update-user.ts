"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi, type UpdateUserRequest } from "@/lib/api-client";

interface UserFormData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles?: string[];
}

interface UseUpdateUserOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function validateUserForm(
  firstName: string,
  lastName: string,
  email: string,
  selectedRoles: string[]
): string | null {
  if (!firstName.trim()) {
    return "First name is required";
  }
  if (!lastName.trim()) {
    return "Last name is required";
  }
  if (!email.trim()) {
    return "Email is required";
  }
  if (selectedRoles.length === 0) {
    return "Please select a role";
  }
  return null;
}

export function buildUserUpdates(
  user: UserFormData,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  selectedRoles: string[],
  filterOwner: boolean = false
): UpdateUserRequest | null {
  const updates: UpdateUserRequest = {};

  if (firstName.trim() !== user.firstName) {
    updates.firstName = firstName.trim();
  }
  if (lastName.trim() !== user.lastName) {
    updates.lastName = lastName.trim();
  }
  if (email.trim() !== user.email) {
    updates.email = email.trim();
  }
  if (phone.trim() !== (user.phone || "")) {
    updates.phone = phone.trim() || undefined;
  }

  const currentRoles = filterOwner
    ? (user.roles || []).filter((r) => r !== "OWNER")
    : user.roles || [];

  if (
    JSON.stringify(selectedRoles.sort()) !== JSON.stringify(currentRoles.sort())
  ) {
    updates.roles = selectedRoles;
  }

  return Object.keys(updates).length > 0 ? updates : null;
}

export function useUpdateUser(options: UseUpdateUserOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUserRequest;
    }) => usersApi.updateUser(userId, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });

      const displayName = `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim();
      toast.success("User updated successfully", {
        description: `${displayName || updatedUser.email} has been updated.`,
        position: "bottom-center",
      });
      options.onSuccess?.();
    },
    onError: (err: Error) => {
      const errorMessage = err.message || "Failed to update user";
      toast.error("Failed to update user", {
        description: errorMessage,
      });
      options.onError?.(errorMessage);
    },
  });
}
