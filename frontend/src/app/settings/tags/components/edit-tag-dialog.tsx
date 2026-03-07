"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { tagsApi, type Tag } from "@/lib/api-client";
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

interface EditTagDialogProps {
  tag: Tag;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditTagDialog({
  tag,
  open,
  onOpenChange,
  onUpdated,
}: EditTagDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(tag.name || "");
    setColor(tag.color || "");
  }, [tag]);

  const mutation = useMutation({
    mutationFn: () =>
      tagsApi.updateTag(tag.id, {
        name: name.trim() !== tag.name ? name.trim() : undefined,
        color: color.trim() !== (tag.color || "") ? color.trim() || undefined : undefined,
      }),
    onSuccess: () => {
      toast.success("Tag updated");
      onUpdated();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to update tag");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !mutation.isPending && onOpenChange(o)}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
          <DialogDescription>Update tag details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tag-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={mutation.isPending}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tag-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-tag-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={mutation.isPending}
                  maxLength={7}
                  className="flex-1"
                />
                {color && (
                  <div
                    className="h-10 w-10 rounded border"
                    style={{ backgroundColor: color }}
                  />
                )}
              </div>
            </div>
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
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
