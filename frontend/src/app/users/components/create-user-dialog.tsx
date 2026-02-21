"use client";

import React, { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi, type CreateUserRequest } from "@/lib/api-client";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { isOwner } from "@/lib/permissions";
import {
  ADMIN_ASSIGNABLE_ROLES,
  OWNER_ASSIGNABLE_ROLES,
  DEFAULT_ROLE,
} from "@/lib/role-options";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onUserCreated,
}: CreateUserDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLE);
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableRoles = useMemo(() => {
    return isOwner(user)
      ? OWNER_ASSIGNABLE_ROLES
      : ADMIN_ASSIGNABLE_ROLES;
  }, [user]);

  const createMutation = useMutation({
    mutationFn: (data: Omit<CreateUserRequest, "organizationId">) =>
      usersApi.createUser(data as CreateUserRequest),
    onSuccess: (createdUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });

      const displayName = `${createdUser.firstName || ""} ${createdUser.lastName || ""}`.trim();
      toast.success("User created successfully", {
        description: `${displayName || createdUser.email} (${createdUser.email}) has been created.`,
      });
      onUserCreated();
      resetForm();
    },
    onError: (err: Error) => {
      const errorMessage = err.message || "Failed to create user";
      setError(errorMessage);
      toast.error("Failed to create user", {
        description: errorMessage,
      });
    },
  });

  const resetForm = () => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setSelectedRole(DEFAULT_ROLE);
    setSendEmail(true);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }

    if (!lastName.trim()) {
      setError("Last name is required");
      return;
    }

    createMutation.mutate({
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      roles: [selectedRole],
      sendEmail,
    });
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new user to your organization</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={createMutation.isPending}
                maxLength={100}
              />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={createMutation.isPending}
                maxLength={100}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={createMutation.isPending}
                maxLength={100}
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
                disabled={createMutation.isPending}
                className="border rounded-md p-3"
              >
                {availableRoles.map((role) => (
                  <div key={role.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={role.value}
                      id={`role-${role.value}`}
                    />
                    <Label
                      htmlFor={`role-${role.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {role.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Send Email */}
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              <Checkbox
                id="send-email"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                disabled={createMutation.isPending}
              />
              <Label
                htmlFor="send-email"
                className="text-sm font-normal cursor-pointer"
              >
                Send invitation email to the user
              </Label>
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
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
