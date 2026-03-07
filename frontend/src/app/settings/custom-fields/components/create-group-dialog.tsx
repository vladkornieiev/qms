"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { customFieldsApi } from "@/lib/api-client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

const ENTITY_TYPES = [
  "CLIENT",
  "VENDOR",
  "PRODUCT",
  "RESOURCE",
  "PROJECT",
  "QUOTE",
  "INVOICE",
  "INVENTORY_ITEM",
];

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [entityType, setEntityType] = useState("");
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: defsData } = useQuery({
    queryKey: [QUERY_KEYS.CUSTOM_FIELD_DEFINITIONS, "all"],
    queryFn: () => customFieldsApi.listDefinitions({ size: 200 }),
    enabled: open,
  });

  const allDefs = defsData?.items || [];

  const mutation = useMutation({
    mutationFn: () =>
      customFieldsApi.createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        entityType,
        fieldIds: selectedFieldIds.length > 0 ? selectedFieldIds : undefined,
      }),
    onSuccess: () => {
      toast.success("Field group created");
      onCreated();
      resetForm();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to create field group");
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setEntityType("");
    setSelectedFieldIds([]);
    setError(null);
  };

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
    if (!entityType) {
      setError("Entity type is required");
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Field Group</DialogTitle>
          <DialogDescription>
            Group custom fields together for a specific entity type
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
                placeholder="e.g., Equipment Details"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={mutation.isPending}
                maxLength={255}
              />
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
            <div className="space-y-2">
              <Label>
                Entity Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={entityType}
                onValueChange={setEntityType}
                disabled={mutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {formatEnum(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
