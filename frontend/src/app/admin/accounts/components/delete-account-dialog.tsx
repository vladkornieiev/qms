"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountsApi, type Account } from "@/lib/api-client";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertCircle } from "lucide-react";

interface DeleteAccountDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountDeleted: () => void;
}

export function DeleteAccountDialog({
  account,
  open,
  onOpenChange,
  onAccountDeleted,
}: DeleteAccountDialogProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountsApi.deleteAccount(id),
    onSuccess: () => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ACCOUNTS] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });

      toast.success("Organization deleted successfully", {
        description: `${account?.name} has been permanently deleted.`,
      });
      onAccountDeleted();
      setError(null);
      onOpenChange(false);
    },
    onError: (err: Error) => {
      const errorMessage = err.message || "Failed to delete organization";
      setError(errorMessage);
      toast.error("Failed to delete organization", {
        description: errorMessage,
      });
    },
  });

  const handleDelete = () => {
    if (account) {
      setError(null);
      deleteMutation.mutate(account.id);
    }
  };

  if (!account) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Organization</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete organization{" "}
            <strong>{account.name}</strong>?
            <br />
            <br />
            This action cannot be undone. This will permanently delete the
            organization and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Organization"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
