"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  customFieldsApi,
  type CustomFieldDefinition,
  type CustomFieldType,
} from "@/lib/api-client";
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

interface EditDefinitionDialogProps {
  definition: CustomFieldDefinition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditDefinitionDialog({
  definition,
  open,
  onOpenChange,
  onUpdated,
}: EditDefinitionDialogProps) {
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<CustomFieldType>("TEXT");
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFieldLabel(definition.fieldLabel || "");
    setFieldType(definition.fieldType);
    setIsRequired(definition.isRequired);
    setOptions(definition.options || []);
    setNewOption("");
    setDisplayOrder(String(definition.displayOrder));
  }, [definition]);

  const mutation = useMutation({
    mutationFn: () =>
      customFieldsApi.updateDefinition(definition.id, {
        fieldLabel:
          fieldLabel.trim() !== definition.fieldLabel
            ? fieldLabel.trim()
            : undefined,
        fieldType: fieldType !== definition.fieldType ? fieldType : undefined,
        isRequired:
          isRequired !== definition.isRequired ? isRequired : undefined,
        options:
          fieldType === "SELECT" || fieldType === "MULTI_SELECT"
            ? options.filter(Boolean)
            : undefined,
        displayOrder:
          parseInt(displayOrder) !== definition.displayOrder
            ? parseInt(displayOrder) || 0
            : undefined,
      }),
    onSuccess: () => {
      toast.success("Field definition updated");
      onUpdated();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to update field definition");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fieldLabel.trim()) {
      setError("Field label is required");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !mutation.isPending && onOpenChange(o)}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Field Definition</DialogTitle>
          <DialogDescription>
            Update field definition for{" "}
            <code className="text-xs">{definition.fieldKey}</code>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-field-label">
                Label <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-field-label"
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                disabled={mutation.isPending}
                maxLength={255}
              />
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
                <Label htmlFor="edit-display-order">Display Order</Label>
                <Input
                  id="edit-display-order"
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
              <Label htmlFor="edit-is-required">Required</Label>
              <Switch
                id="edit-is-required"
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
