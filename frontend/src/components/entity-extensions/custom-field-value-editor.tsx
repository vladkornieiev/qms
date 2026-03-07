"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomFieldDefinition } from "@/lib/api-types";

interface CustomFieldValueEditorProps {
  field: CustomFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}

export function CustomFieldValueEditor({
  field,
  value,
  onChange,
  disabled,
}: CustomFieldValueEditorProps) {
  const fieldId = `cf-${field.id}`;

  switch (field.fieldType) {
    case "TEXT":
    case "URL":
    case "EMAIL":
    case "PHONE":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-sm">
            {field.fieldLabel}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={fieldId}
            type={field.fieldType === "EMAIL" ? "email" : field.fieldType === "URL" ? "url" : "text"}
            placeholder={field.fieldLabel}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
          />
        </div>
      );

    case "NUMBER":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-sm">
            {field.fieldLabel}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={fieldId}
            type="number"
            placeholder={field.fieldLabel}
            value={value != null ? String(value) : ""}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v === "" ? null : Number(v));
            }}
            disabled={disabled}
          />
        </div>
      );

    case "BOOLEAN":
      return (
        <div className="flex items-center justify-between py-1">
          <Label htmlFor={fieldId} className="text-sm">
            {field.fieldLabel}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Switch
            id={fieldId}
            checked={!!value}
            onCheckedChange={(checked) => onChange(checked)}
            disabled={disabled}
          />
        </div>
      );

    case "DATE":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-sm">
            {field.fieldLabel}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={fieldId}
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
          />
        </div>
      );

    case "SELECT":
      return (
        <div className="space-y-1.5">
          <Label className="text-sm">
            {field.fieldLabel}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={(value as string) ?? ""}
            onValueChange={(v) => onChange(v || null)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.fieldLabel}`} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "MULTI_SELECT":
      return (
        <div className="space-y-1.5">
          <Label className="text-sm">
            {field.fieldLabel}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="space-y-1 border rounded-md p-2 max-h-[150px] overflow-y-auto">
            {(field.options || []).map((opt) => {
              const selected = Array.isArray(value) ? (value as string[]) : [];
              return (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
                  <Checkbox
                    checked={selected.includes(opt)}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...selected, opt]
                        : selected.filter((s) => s !== opt);
                      onChange(next.length > 0 ? next : null);
                    }}
                    disabled={disabled}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      );

    case "FILE":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-sm">
            {field.fieldLabel}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={fieldId}
            type="text"
            placeholder="File URL"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
          />
        </div>
      );

    default:
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldId} className="text-sm">
            {field.fieldLabel}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={fieldId}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
          />
        </div>
      );
  }
}
