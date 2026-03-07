"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { customFieldsApi, type CustomFieldType } from "@/lib/api-client";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, Plus, X } from "lucide-react";

const FIELD_TYPES: CustomFieldType[] = [
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "DATE",
  "URL",
  "EMAIL",
  "PHONE",
  "SELECT",
  "MULTI_SELECT",
  "FILE",
];

interface CreateDefinitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateDefinitionDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateDefinitionDialogProps) {
  const [fieldKey, setFieldKey] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<CustomFieldType>("TEXT");
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      customFieldsApi.createDefinition({
        fieldKey: fieldKey.trim(),
        fieldLabel: fieldLabel.trim(),
        fieldType,
        isRequired,
        options:
          fieldType === "SELECT" || fieldType === "MULTI_SELECT"
            ? options.filter(Boolean)
            : undefined,
        displayOrder: parseInt(displayOrder) || 0,
      }),
    onSuccess: () => {
      toast.success("Field definition created");
      onCreated();
      resetForm();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to create field definition");
    },
  });

  const resetForm = () => {
    setFieldKey("");
    setFieldLabel("");
    setFieldType("TEXT");
    setIsRequired(false);
    setOptions([]);
    setNewOption("");
    setDisplayOrder("0");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fieldKey.trim()) {
      setError("Field key is required");
      return;
    }
    if (!fieldLabel.trim()) {
      setError("Field label is required");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Field Definition</DialogTitle>
          <DialogDescription>
            Define a new custom field that can be added to entity groups
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-key">
                  Key <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="field-key"
                  placeholder="serial_number"
                  value={fieldKey}
                  onChange={(e) => setFieldKey(e.target.value)}
                  disabled={mutation.isPending}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-label">
                  Label <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="field-label"
                  placeholder="Serial Number"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  disabled={mutation.isPending}
                  maxLength={255}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={fieldType}
                  onValueChange={(v) => setFieldType(v as CustomFieldType)}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {formatEnum(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-order">Display Order</Label>
                <Input
                  id="display-order"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
            </div>
            {(fieldType === "SELECT" || fieldType === "MULTI_SELECT") && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[i] = e.target.value;
                          setOptions(updated);
                        }}
                        disabled={mutation.isPending}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 shrink-0"
                        onClick={() => setOptions(options.filter((_, j) => j !== i))}
                        disabled={mutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add option..."
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newOption.trim()) {
                          e.preventDefault();
                          setOptions([...options, newOption.trim()]);
                          setNewOption("");
                        }
                      }}
                      disabled={mutation.isPending}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => {
                        if (newOption.trim()) {
                          setOptions([...options, newOption.trim()]);
                          setNewOption("");
                        }
                      }}
                      disabled={mutation.isPending || !newOption.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="is-required">Required</Label>
              <Switch
                id="is-required"
                checked={isRequired}
                onCheckedChange={setIsRequired}
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
