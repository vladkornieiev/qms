"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountsApi } from "@/lib/api-client";
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
import { Loader2, AlertCircle } from "lucide-react";

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountCreated: () => void;
}

export function CreateAccountDialog({
  open,
  onOpenChange,
  onAccountCreated,
}: CreateAccountDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: { name: string; email?: string }) =>
      accountsApi.createAccount(data),
    onSuccess: (organization) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ACCOUNTS] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });

      toast.success("Organization created successfully", {
        description: `${organization.name} has been created.`,
      });
      onAccountCreated();
      resetForm();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      const errorMessage = err.message || "Failed to create organization";
      setError(errorMessage);
      toast.error("Failed to create organization", {
        description: errorMessage,
      });
    },
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>Add a new organization to the system</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Organization Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Acme Corporation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createMutation.isPending}
                maxLength={100}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., contact@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={createMutation.isPending}
                maxLength={100}
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
                "Create Organization"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
