"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { tagsApi } from "@/lib/api-client";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";

interface CreateTagGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateTagGroupDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateTagGroupDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      tagsApi.createTagGroup({
        name: name.trim(),
        color: color.trim() || undefined,
        description: description.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Tag group created");
      onCreated();
      resetForm();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to create tag group");
    },
  });

  const resetForm = () => {
    setName("");
    setColor("");
    setDescription("");
    setError(null);
  };

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
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!mutation.isPending) {
          resetForm();
          onOpenChange(o);
        }
      }}
    >
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Tag Group</DialogTitle>
          <DialogDescription>
            Group related tags together for organized filtering
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="group-name"
                placeholder="e.g., Priority"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={mutation.isPending}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="group-color"
                  placeholder="#ff0000"
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
            <div className="space-y-2">
              <Label htmlFor="group-desc">Description</Label>
              <Textarea
                id="group-desc"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={mutation.isPending}
              />
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
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
