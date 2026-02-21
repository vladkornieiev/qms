"use client";

import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { HotkeyBadge } from "./hotkey-badge";
import type { ResolvedHotkey } from "@/types/hotkeys";
import { CATEGORY_LABELS } from "@/lib/hotkeys/registry";

export interface HotkeyRowProps {
  hotkey: ResolvedHotkey;
  isEditing: boolean;
  editingKeys: string;
  isSaving: boolean;
  onToggle: (hotkeyId: string, enabled: boolean) => void;
  onStartEdit: (hotkey: ResolvedHotkey) => void;
  onReset: (hotkeyId: string) => void;
  onKeyCapture: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export const HotkeyRow = memo(
  function HotkeyRow({
    hotkey,
    isEditing,
    editingKeys,
    isSaving,
    onToggle,
    onStartEdit,
    onReset,
    onKeyCapture,
    onSaveEdit,
    onCancelEdit,
  }: HotkeyRowProps) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <Switch
            checked={hotkey.isEnabled}
            onCheckedChange={(checked) => onToggle(hotkey.id, checked)}
            disabled={isSaving}
          />
          <div>
            <p className="font-medium text-sm">{hotkey.description}</p>
            <p className="text-xs text-muted-foreground">
              {CATEGORY_LABELS[hotkey.category]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hotkey.isCustomized && (
            <Badge variant="outline" className="text-xs">
              Customized
            </Badge>
          )}

          {isEditing ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <Input
                  value={editingKeys}
                  onKeyDown={onKeyCapture}
                  onChange={() => {}}
                  placeholder="Press keys..."
                  className="w-32 text-center text-sm"
                  autoFocus
                />
                <span className="text-[10px] text-muted-foreground mt-1">
                  Press keys quickly for sequences
                </span>
              </div>
              <Button
                size="sm"
                onClick={onSaveEdit}
                disabled={isSaving || !editingKeys}
              >
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelEdit}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <HotkeyBadge keys={hotkey.customKeys ?? hotkey.keys} />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStartEdit(hotkey)}
                disabled={!hotkey.isEnabled}
              >
                Edit
              </Button>
              {hotkey.isCustomized && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReset(hotkey.id)}
                  disabled={isSaving}
                >
                  Reset
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.hotkey.id !== nextProps.hotkey.id) return false;
    if (prevProps.hotkey.isEnabled !== nextProps.hotkey.isEnabled) return false;
    if (prevProps.hotkey.isCustomized !== nextProps.hotkey.isCustomized)
      return false;
    if (prevProps.hotkey.keys !== nextProps.hotkey.keys) return false;
    if (prevProps.hotkey.customKeys !== nextProps.hotkey.customKeys)
      return false;
    if (prevProps.hotkey.description !== nextProps.hotkey.description)
      return false;
    if (prevProps.hotkey.category !== nextProps.hotkey.category) return false;

    if (prevProps.isEditing !== nextProps.isEditing) return false;
    if (prevProps.isSaving !== nextProps.isSaving) return false;
    if (nextProps.isEditing && prevProps.editingKeys !== nextProps.editingKeys)
      return false;

    return true;
  }
);
