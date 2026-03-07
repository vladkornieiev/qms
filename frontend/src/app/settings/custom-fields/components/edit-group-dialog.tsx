"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { customFieldsApi, type CustomFieldGroup } from "@/lib/api-client";
import { formatEnum } from "@/lib/utils";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

interface EditGroupDialogProps {
  group: CustomFieldGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditGroupDialog({
  group,
  open,
  onOpenChange,
  onUpdated,
}: EditGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: defsData } = useQuery({
    queryKey: [QUERY_KEYS.CUSTOM_FIELD_DEFINITIONS, "all"],
    queryFn: () => customFieldsApi.listDefinitions({ size: 200 }),
    enabled: open,
  });

  const allDefs = defsData?.items || [];

  useEffect(() => {
    setName(group.name || "");
    setDescription(group.description || "");
    setSelectedFieldIds(group.fields?.map((f) => f.id) || []);
  }, [group]);

  const mutation = useMutation({
    mutationFn: () =>
      customFieldsApi.updateGroup(group.id, {
        name: name.trim() !== group.name ? name.trim() : undefined,
        description:
          description.trim() !== (group.description || "")
            ? description.trim() || undefined
            : undefined,
        fieldIds: selectedFieldIds,
      }),
    onSuccess: () => {
      toast.success("Field group updated");
      onUpdated();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to update field group");
    },
  });

  const toggleField = (fieldId: string) => {
    setSelectedFieldIds((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
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
      onOpenChange={(o) => !mutation.isPending && onOpenChange(o)}
    >
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Field Group</DialogTitle>
          <DialogDescription>
            Update group details and member fields
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-group-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={mutation.isPending}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group-desc">Description</Label>
              <Textarea
                id="edit-group-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={mutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Input value={formatEnum(group.entityType)} disabled />
            </div>
            {allDefs.length > 0 && (
              <div className="space-y-2">
                <Label>Fields</Label>
                <div className="border rounded-md max-h-[200px] overflow-y-auto p-2 space-y-2">
                  {allDefs.map((def) => (
                    <label
                      key={def.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-1"
                    >
                      <Checkbox
                        checked={selectedFieldIds.includes(def.id)}
                        onCheckedChange={() => toggleField(def.id)}
                        disabled={mutation.isPending}
                      />
                      <span className="text-sm">{def.fieldLabel}</span>
                      <code className="text-xs text-gray-400 ml-auto">
                        {formatEnum(def.fieldType)}
                      </code>
                    </label>
                  ))}
                </div>
              </div>
            )}
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
