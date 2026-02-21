"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountsApi, type Account } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
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
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertCircle } from "lucide-react";

interface EditAccountDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountUpdated: () => void;
}

export function EditAccountDialog({
  account,
  open,
  onOpenChange,
  onAccountUpdated,
}: EditAccountDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setName(account.name || "");
      setEmail(account.email || "");
      setIsActive(account.isActive ?? true);
    }
  }, [account]);

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; email?: string; isActive?: boolean }) =>
      accountsApi.updateAccount(account!.id, data),
    onSuccess: (updatedAccount) => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ACCOUNTS] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });

      toast.success("Organization updated successfully", {
        description: `${updatedAccount.name} has been updated.`,
      });
      onAccountUpdated();
      setError(null);
      onOpenChange(false); // Close dialog on success
    },
    onError: (err: Error) => {
      const errorMessage = err.message || "Failed to update organization";
      setError(errorMessage);
      toast.error("Failed to update organization", {
        description: errorMessage,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Account name is required");
      return;
    }

    const updates: { name?: string; email?: string; isActive?: boolean } = {};
    if (name.trim() !== account?.name) {
      updates.name = name.trim();
    }
    if (email.trim() !== (account?.email || "")) {
      updates.email = email.trim() || undefined;
    }
    if (isActive !== (account?.isActive ?? true)) {
      updates.isActive = isActive;
    }

    if (Object.keys(updates).length === 0) {
      setError("No changes to save");
      return;
    }

    updateMutation.mutate(updates);
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      setError(null);
      onOpenChange(false);
    }
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>Update organization information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Organization Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g., Acme Corporation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateMutation.isPending}
                maxLength={100}
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email (Optional)</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="e.g., contact@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={updateMutation.isPending}
                maxLength={100}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="space-y-0.5">
                <Label htmlFor="edit-isActive">Active Status</Label>
                <p className="text-sm text-gray-500">
                  Inactive organizations cannot be accessed by users
                </p>
              </div>
              <Switch
                id="edit-isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={updateMutation.isPending}
              />
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
