"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { tagsApi, type TagGroup } from "@/lib/api-client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: TagGroup[];
  onCreated: () => void;
}

export function CreateTagDialog({
  open,
  onOpenChange,
  groups,
  onCreated,
}: CreateTagDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [groupId, setGroupId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      tagsApi.createTag({
        name: name.trim(),
        color: color.trim() || undefined,
        tagGroupId: groupId || undefined,
      }),
    onSuccess: () => {
      toast.success("Tag created");
      onCreated();
      resetForm();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to create tag");
    },
  });

  const resetForm = () => {
    setName("");
    setColor("");
    setGroupId("");
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
          <DialogTitle>Create Tag</DialogTitle>
          <DialogDescription>Add a new tag for organizing entities</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tag-name"
                placeholder="e.g., High Priority"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={mutation.isPending}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="tag-color"
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
              <Label>Tag Group (optional)</Label>
              <Select value={groupId} onValueChange={setGroupId} disabled={mutation.isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="No group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No group</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
