"use client";

import React, { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, ChevronsUpDown, Search, X } from "lucide-react";
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
  const [fieldSearch, setFieldSearch] = useState("");
  const [fieldDropdownOpen, setFieldDropdownOpen] = useState(false);

  const { data: defsData } = useQuery({
    queryKey: [QUERY_KEYS.CUSTOM_FIELD_DEFINITIONS, "all"],
    queryFn: () => customFieldsApi.listDefinitions({ size: 200 }),
    enabled: open,
  });

  const allDefs = defsData?.items || [];

  const filteredDefs = useMemo(
    () =>
      allDefs.filter((def) =>
        def.fieldLabel.toLowerCase().includes(fieldSearch.toLowerCase())
      ),
    [allDefs, fieldSearch]
  );

  const selectedDefs = useMemo(
    () => allDefs.filter((def) => selectedFieldIds.includes(def.id)),
    [allDefs, selectedFieldIds]
  );

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
    setFieldSearch("");
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
                <Popover open={fieldDropdownOpen} onOpenChange={setFieldDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                      disabled={mutation.isPending}
                    >
                      <span className="text-muted-foreground">
                        {selectedFieldIds.length > 0
                          ? `${selectedFieldIds.length} field${selectedFieldIds.length > 1 ? "s" : ""} selected`
                          : "Select fields..."}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search fields..."
                          value={fieldSearch}
                          onChange={(e) => setFieldSearch(e.target.value)}
                          className="pl-8 h-8"
                        />
                      </div>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {filteredDefs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No fields found
                        </p>
                      ) : (
                        filteredDefs.map((def) => (
                          <label
                            key={def.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5"
                          >
                            <Checkbox
                              checked={selectedFieldIds.includes(def.id)}
                              onCheckedChange={() => toggleField(def.id)}
                            />
                            <span className="text-sm">{def.fieldLabel}</span>
                            <code className="text-xs text-muted-foreground ml-auto">
                              {formatEnum(def.fieldType)}
                            </code>
                          </label>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedDefs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedDefs.map((def) => (
                      <Badge
                        key={def.id}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {def.fieldLabel}
                        <button
                          type="button"
                          className="rounded-full hover:bg-gray-300 p-0.5"
                          onClick={() => toggleField(def.id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
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
