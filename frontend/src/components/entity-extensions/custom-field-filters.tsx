"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFieldsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { SlidersHorizontal, X, Plus, Search, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import type { CustomFieldFilter } from "@/lib/api-types/entity-extensions.types";
import type { CustomFieldDefinition } from "@/lib/api-types";

interface CustomFieldFiltersProps {
  entityType: string;
  filters: CustomFieldFilter[];
  onFiltersChange: (filters: CustomFieldFilter[]) => void;
}

interface FieldWithGroup {
  field: CustomFieldDefinition;
  groupName: string;
}

const OP_OPTIONS: Record<string, { ops: { value: string; label: string }[] }> = {
  TEXT: { ops: [{ value: "contains", label: "contains" }] },
  URL: { ops: [{ value: "contains", label: "contains" }] },
  EMAIL: { ops: [{ value: "contains", label: "contains" }] },
  PHONE: { ops: [{ value: "contains", label: "contains" }] },
  NUMBER: { ops: [{ value: "eq", label: "=" }, { value: "gt", label: ">" }, { value: "gte", label: ">=" }, { value: "lt", label: "<" }, { value: "lte", label: "<=" }] },
  BOOLEAN: { ops: [{ value: "eq", label: "equals" }] },
  DATE: { ops: [{ value: "eq", label: "=" }, { value: "gt", label: "after" }, { value: "gte", label: "on or after" }, { value: "lt", label: "before" }, { value: "lte", label: "on or before" }] },
  SELECT: { ops: [{ value: "eq", label: "equals" }] },
  MULTI_SELECT: { ops: [{ value: "contains", label: "contains" }] },
  FILE: { ops: [{ value: "contains", label: "contains" }] },
};

function getDefaultOp(fieldType: string): string {
  const ops = OP_OPTIONS[fieldType]?.ops || OP_OPTIONS.TEXT.ops;
  return ops[0].value;
}

export function useCustomFieldFilterData(entityType: string) {
  const { data: definitionsData } = useQuery({
    queryKey: [QUERY_KEYS.CUSTOM_FIELD_DEFINITIONS, entityType, "distinct"],
    queryFn: () => customFieldsApi.listDefinitions({ entityType, distinct: true }),
  });

  const { data: groupsData } = useQuery({
    queryKey: [QUERY_KEYS.CUSTOM_FIELD_GROUPS, entityType, "forFilters"],
    queryFn: () => customFieldsApi.listGroups({ entityType, size: 100 }),
  });

  const definitions = definitionsData?.items || [];
  const groups = groupsData?.items || [];

  const availableFields = useMemo(() => {
    const inUseIds = new Set(definitions.map((d) => d.id));
    const fieldMap = new Map<string, FieldWithGroup>();

    for (const group of groups) {
      for (const field of group.fields || []) {
        if (inUseIds.has(field.id) && !fieldMap.has(field.id)) {
          fieldMap.set(field.id, { field, groupName: group.name });
        }
      }
    }

    for (const def of definitions) {
      if (!fieldMap.has(def.id)) {
        fieldMap.set(def.id, { field: def, groupName: "Other" });
      }
    }

    return Array.from(fieldMap.values());
  }, [definitions, groups]);

  return availableFields;
}

/**
 * Reusable custom field filters for any entity type.
 * Renders an "add filter" button (for the toolbar) and active filter pills (shown below).
 */
export function CustomFieldFilters({ entityType, filters, onFiltersChange }: CustomFieldFiltersProps) {
  const availableFields = useCustomFieldFilterData(entityType);

  if (availableFields.length === 0) return null;

  return (
    <>
      <CustomFieldFilterButton
        filters={filters}
        onFiltersChange={onFiltersChange}
        availableFields={availableFields}
      />
      {filters.length > 0 && (
        <CustomFieldFilterBar
          filters={filters}
          onFiltersChange={onFiltersChange}
          availableFields={availableFields}
        />
      )}
    </>
  );
}

/**
 * Just the trigger button + popover for adding filters. Place in the toolbar row.
 */
export function CustomFieldFilterButton({
  filters,
  onFiltersChange,
  availableFields,
}: {
  filters: CustomFieldFilter[];
  onFiltersChange: (filters: CustomFieldFilter[]) => void;
  availableFields: FieldWithGroup[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  const unusedFields = useMemo(() => {
    const usedIds = new Set(filters.map((f) => f.fieldId));
    return availableFields.filter((af) => !usedIds.has(af.field.id));
  }, [availableFields, filters]);

  const filteredUnused = useMemo(() => {
    if (!search.trim()) return unusedFields;
    const q = search.toLowerCase();
    return unusedFields.filter(
      (af) => af.field.fieldLabel.toLowerCase().includes(q) || af.groupName.toLowerCase().includes(q)
    );
  }, [unusedFields, search]);

  const groupedUnused = useMemo(() => {
    const map = new Map<string, FieldWithGroup[]>();
    for (const af of filteredUnused) {
      const list = map.get(af.groupName) || [];
      list.push(af);
      map.set(af.groupName, list);
    }
    return Array.from(map.entries());
  }, [filteredUnused]);

  const addFilter = (fieldId: string) => {
    const af = availableFields.find((f) => f.field.id === fieldId);
    if (!af) return;
    onFiltersChange([
      ...filters,
      { fieldId, op: getDefaultOp(af.field.fieldType), value: "", enabled: true },
    ]);
    setAddOpen(false);
    setSearch("");
  };

  if (unusedFields.length === 0 && filters.length === 0) return null;

  return (
    <Popover open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setSearch(""); }}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-9">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {filters.length === 0 ? "Custom Fields" : <Plus className="h-3.5 w-3.5" />}
          {filters.length > 0 && (
            <Badge variant="secondary" className="ml-0.5 h-5 px-1.5">
              {filters.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-2" align="start">
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {groupedUnused.map(([groupName, fields]) => (
            <div key={groupName}>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-2 pt-2 pb-1">
                {groupName}
              </p>
              {fields.map((af) => (
                <button
                  key={af.field.id}
                  onClick={() => addFilter(af.field.id)}
                  className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 flex items-center justify-between"
                >
                  <span>{af.field.fieldLabel}</span>
                  <span className="text-[10px] text-gray-400">
                    {af.field.fieldType.toLowerCase().replace("_", " ")}
                  </span>
                </button>
              ))}
            </div>
          ))}
          {filteredUnused.length === 0 && unusedFields.length > 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No matching fields</p>
          )}
          {unusedFields.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">All fields added</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Active filter pills bar (Kibana-style). Place below the search/filter toolbar.
 */
export function CustomFieldFilterBar({
  filters,
  onFiltersChange,
  availableFields,
}: {
  filters: CustomFieldFilter[];
  onFiltersChange: (filters: CustomFieldFilter[]) => void;
  availableFields: FieldWithGroup[];
}) {
  const [collapsed, setCollapsed] = useState(false);

  const updateFilter = (index: number, update: Partial<CustomFieldFilter>) => {
    onFiltersChange(filters.map((f, i) => (i === index ? { ...f, ...update } : f)));
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  const toggleFilter = (index: number) => {
    updateFilter(index, { enabled: filters[index].enabled === false ? true : false });
  };

  const getFieldInfo = (fieldId: string) => availableFields.find((af) => af.field.id === fieldId);

  const activeCount = filters.filter((f) => f.enabled !== false && f.value !== "").length;

  if (collapsed) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 gap-1 text-gray-500 hover:text-gray-700"
          onClick={() => setCollapsed(false)}
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Show filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{activeCount}</Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter, index) => {
        const info = getFieldInfo(filter.fieldId);
        if (!info) return null;
        const ops = OP_OPTIONS[info.field.fieldType]?.ops || OP_OPTIONS.TEXT.ops;
        const isDisabled = filter.enabled === false;

        return (
          <div
            key={filter.fieldId}
            className={`group flex items-center rounded-lg border shadow-sm overflow-hidden transition-all ${
              isDisabled
                ? "opacity-50 border-gray-200 bg-gray-50"
                : "border-blue-200 bg-white hover:shadow-md"
            }`}
          >
            {/* Toggle + field label (colored left segment) */}
            <button
              onClick={() => toggleFilter(index)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isDisabled
                  ? "bg-gray-100 text-gray-400"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
              title={isDisabled ? "Enable filter" : "Disable filter"}
            >
              {isDisabled ? (
                <ToggleLeft className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ToggleRight className="h-3.5 w-3.5 shrink-0" />
              )}
              {info.field.fieldLabel}
            </button>

            {/* Operator + value (right segment) */}
            <div className="flex items-center gap-1 px-2 py-1.5 border-l border-blue-100">
              {ops.length > 1 && (
                <Select
                  value={filter.op}
                  onValueChange={(op) => updateFilter(index, { op })}
                  disabled={isDisabled}
                >
                  <SelectTrigger className="h-5 text-xs w-auto min-w-[40px] border-0 bg-transparent p-0 px-0.5 shadow-none text-gray-500 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ops.map((op) => (
                      <SelectItem key={op.value} value={op.value} className="text-xs">
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FilterValueInput
                field={info.field}
                value={filter.value}
                onChange={(value) => updateFilter(index, { value })}
                disabled={isDisabled}
              />
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeFilter(index)}
              className="px-1.5 py-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors border-l border-gray-100"
              title="Remove filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}

      {/* Hide / Clear */}
      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 gap-1"
          onClick={() => setCollapsed(true)}
        >
          <ChevronUp className="h-3.5 w-3.5" />
          Hide filters
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => onFiltersChange([])}
        >
          <X className="h-3 w-3" />
          Clear all
        </Button>
      </div>
    </div>
  );
}

/** Input with local state and debounced onChange (500ms). */
function DebouncedInput({
  value: externalValue,
  onChange,
  type = "text",
  className,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [local, setLocal] = useState(externalValue);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sync from parent when external value changes (e.g. reset)
  useEffect(() => { setLocal(externalValue); }, [externalValue]);

  useEffect(() => {
    if (local === externalValue) return;
    const timer = setTimeout(() => onChangeRef.current(local), 500);
    return () => clearTimeout(timer);
  }, [local, externalValue]);

  return (
    <Input
      type={type}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

function FilterValueInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: CustomFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}) {
  switch (field.fieldType) {
    case "BOOLEAN":
      return (
        <Select
          value={String(value ?? "")}
          onValueChange={(v) => onChange(v === "true")}
          disabled={disabled}
        >
          <SelectTrigger className="h-6 text-xs w-[70px] border-0 bg-transparent px-1">
            <SelectValue placeholder="..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true" className="text-xs">Yes</SelectItem>
            <SelectItem value="false" className="text-xs">No</SelectItem>
          </SelectContent>
        </Select>
      );

    case "SELECT":
      return (
        <Select
          value={String(value ?? "")}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-6 text-xs w-auto min-w-[80px] border-0 bg-transparent px-1">
            <SelectValue placeholder="..." />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "MULTI_SELECT":
      return (
        <Select
          value={String(value ?? "")}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-6 text-xs w-auto min-w-[80px] border-0 bg-transparent px-1">
            <SelectValue placeholder="..." />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "NUMBER":
      return (
        <DebouncedInput
          type="number"
          value={value != null ? String(value) : ""}
          onChange={(v) => onChange(v === "" ? "" : Number(v))}
          className="h-6 text-xs w-[80px] border-0 bg-transparent px-1"
          placeholder="value"
          disabled={disabled}
        />
      );

    case "DATE":
      return (
        <DebouncedInput
          type="date"
          value={String(value ?? "")}
          onChange={(v) => onChange(v || "")}
          className="h-6 text-xs w-[130px] border-0 bg-transparent px-1"
          disabled={disabled}
        />
      );

    default:
      return (
        <DebouncedInput
          type="text"
          value={String(value ?? "")}
          onChange={(v) => onChange(v)}
          className="h-6 text-xs w-[100px] border-0 bg-transparent px-1"
          placeholder="value"
          disabled={disabled}
        />
      );
  }
}
