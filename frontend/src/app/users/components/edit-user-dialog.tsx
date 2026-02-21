"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertCircle } from "lucide-react";
import { type User } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth-store";
import { isOwner } from "@/lib/permissions";
import {
  useUpdateUser,
  validateUserForm,
  buildUserUpdates,
} from "@/components/users/use-update-user";
import {
  ADMIN_ASSIGNABLE_ROLES,
  OWNER_ASSIGNABLE_ROLES,
  DEFAULT_ROLE,
} from "@/lib/role-options";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: EditUserDialogProps) {
  const { user: currentUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLE);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!updateMutation.isPending) {
      setError(null);
      onOpenChange(false);
    }
  };

  const updateMutation = useUpdateUser({
    onSuccess: () => {
      onUserUpdated();
      handleClose();
    },
    onError: setError,
  });

  const availableRoles = useMemo(() => {
    return isOwner(currentUser)
      ? OWNER_ASSIGNABLE_ROLES
      : ADMIN_ASSIGNABLE_ROLES;
  }, [currentUser]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
      const availableRoleValues = availableRoles.map((r) => r.value);
      const userRoles = (user.roles || ["MEMBER"]).filter(
        (r) => r !== "OWNER" && availableRoleValues.includes(r)
      );
      setSelectedRole(userRoles[0] || DEFAULT_ROLE);
    }
  }, [user, availableRoles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateUserForm(firstName, lastName, email, [selectedRole]);
    if (validationError) {
      setError(validationError);
      return;
    }

    const updates = buildUserUpdates(
      user!,
      firstName,
      lastName,
      email,
      phone,
      [selectedRole],
      true
    );

    if (!updates) {
      setError("No changes to save");
      return;
    }

    updateMutation.mutate({ userId: user!.id, data: updates });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and role
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={updateMutation.isPending}
                maxLength={100}
              />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={updateMutation.isPending}
                maxLength={100}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={updateMutation.isPending}
                maxLength={100}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone (Optional)</Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={updateMutation.isPending}
                maxLength={20}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>
                Role <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={setSelectedRole}
                disabled={updateMutation.isPending}
                className="border rounded-md p-3"
              >
                {availableRoles.map((role) => (
                  <div key={role.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={role.value}
                      id={`edit-role-${role.value}`}
                    />
                    <Label
                      htmlFor={`edit-role-${role.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {role.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
