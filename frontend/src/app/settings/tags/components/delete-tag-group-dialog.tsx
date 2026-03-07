"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { tagsApi, type TagGroup } from "@/lib/api-client";
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
import { Loader2 } from "lucide-react";

interface DeleteTagGroupDialogProps {
  group: TagGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteTagGroupDialog({
  group,
  open,
  onOpenChange,
  onDeleted,
}: DeleteTagGroupDialogProps) {
  const mutation = useMutation({
    mutationFn: () => tagsApi.deleteTagGroup(group.id),
    onSuccess: () => {
      toast.success("Tag group deleted");
      onDeleted();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete tag group");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Tag Group</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{group.name}</strong>? Tags
            in this group will become ungrouped.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            disabled={mutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
