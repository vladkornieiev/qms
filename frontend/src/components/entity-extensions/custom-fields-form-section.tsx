"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFieldsApi } from "@/lib/api-client";
import { Checkbox } from "@/components/ui/checkbox";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { CustomFieldValueEditor } from "./custom-field-value-editor";
import type { CustomFieldDefinition } from "@/lib/api-types";
import type { CustomFieldValueInput } from "@/lib/api-types/client.types";

interface CustomFieldsFormSectionProps {
  entityType: string;
  selectedGroupIds: string[];
  onGroupIdsChange: (groupIds: string[]) => void;
  values: Record<string, unknown>;
  onValuesChange: (values: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function CustomFieldsFormSection({
  entityType,
  selectedGroupIds,
  onGroupIdsChange,
  values,
  onValuesChange,
  disabled,
}: CustomFieldsFormSectionProps) {
  const { data: groupsData } = useQuery({
    queryKey: [QUERY_KEYS.CUSTOM_FIELD_GROUPS, entityType],
    queryFn: () => customFieldsApi.listGroups({ entityType, size: 100 }),
  });

  const groups = groupsData?.items || [];
  const didAutoSelect = useRef(false);

  // Auto-select groups that have at least one field with a value.
  // Waits until both groups are loaded AND values are non-empty.
  useEffect(() => {
    if (groups.length === 0) return;
    if (didAutoSelect.current) return;

    const valueFieldIds = new Set(
      Object.entries(values)
        .filter(([, v]) => v != null)
        .map(([k]) => k)
    );
    // Don't finalize auto-select until values have arrived (they come async via useEffect in parent)
    if (valueFieldIds.size === 0) return;

    didAutoSelect.current = true;
    const groupIdsToSelect: string[] = [];
    for (const group of groups) {
      if (group.fields?.some((f) => valueFieldIds.has(f.id))) {
        groupIdsToSelect.push(group.id);
      }
    }
    if (groupIdsToSelect.length > 0) {
      const merged = Array.from(new Set([...selectedGroupIds, ...groupIdsToSelect]));
      if (merged.length !== selectedGroupIds.length) {
        onGroupIdsChange(merged);
      }
    }
  }, [groups, values]); // eslint-disable-line react-hooks/exhaustive-deps

  // All fields from selected groups, deduplicated and ordered
  const activeFields = useMemo(() => {
    const fieldMap = new Map<string, CustomFieldDefinition>();
    for (const group of groups) {
      if (selectedGroupIds.includes(group.id) && group.fields) {
        for (const field of group.fields) {
          if (!fieldMap.has(field.id)) {
            fieldMap.set(field.id, field);
          }
        }
      }
    }
    return Array.from(fieldMap.values()).sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
  }, [groups, selectedGroupIds]);

  // Clean up values when a group is deselected (inline, no effect)
  const toggleGroup = (groupId: string) => {
    const isDeselecting = selectedGroupIds.includes(groupId);
    const newGroupIds = isDeselecting
      ? selectedGroupIds.filter((id) => id !== groupId)
      : [...selectedGroupIds, groupId];
    onGroupIdsChange(newGroupIds);

    if (isDeselecting) {
      // Compute which fields remain active after deselection
      const stillActiveFieldIds = new Set<string>();
      for (const group of groups) {
        if (newGroupIds.includes(group.id) && group.fields) {
          for (const field of group.fields) {
            stillActiveFieldIds.add(field.id);
          }
        }
      }
      // Remove values for fields no longer in any active group
      const cleaned: Record<string, unknown> = {};
      let changed = false;
      for (const [key, val] of Object.entries(values)) {
        if (stillActiveFieldIds.has(key)) {
          cleaned[key] = val;
        } else {
          changed = true;
        }
      }
      if (changed) onValuesChange(cleaned);
    }
  };

  if (groups.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Custom Field Groups</p>
        <div className="space-y-1.5">
          {groups.map((group) => (
            <label
              key={group.id}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Checkbox
                checked={selectedGroupIds.includes(group.id)}
                onCheckedChange={() => toggleGroup(group.id)}
                disabled={disabled}
              />
              <span>{group.name}</span>
              {group.fields && (
                <span className="text-xs text-gray-400">
                  ({group.fields.length} field{group.fields.length !== 1 ? "s" : ""})
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {activeFields.length > 0 && (
        <div className="space-y-3 border-l-2 border-gray-200 ml-1 pl-4">
          {activeFields.map((field) => (
            <CustomFieldValueEditor
              key={field.id}
              field={field}
              value={values[field.id] ?? null}
              onChange={(val) =>
                onValuesChange({ ...values, [field.id]: val })
              }
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Convert the values record to the API format */
export function toCustomFieldValueInputs(
  values: Record<string, unknown>
): CustomFieldValueInput[] {
  return Object.entries(values)
    .filter(([, v]) => v != null)
    .map(([customFieldId, value]) => ({ customFieldId, value }));
}

/** Convert API response values to the record format */
export function fromCustomFieldValueResponses(
  values: { customFieldId: string; value: unknown }[]
): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const v of values) {
    record[v.customFieldId] = v.value;
  }
  return record;
}
