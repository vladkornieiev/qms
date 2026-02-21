"use client";

import { formatHotkeyForDisplay } from "@/hooks/use-hotkey-display";
import { cn } from "@/lib/utils";

interface HotkeyBadgeProps {
  keys: string | null;
  className?: string;
}

export function HotkeyBadge({ keys, className }: HotkeyBadgeProps) {
  const display = formatHotkeyForDisplay(keys);

  if (!display) return null;

  // Handle sequence keys (like "G>D")
  const isSequence = keys?.includes(">");

  if (isSequence) {
    const parts = display.split(" ");
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        {parts.map((part, index) => (
          <span key={index} className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded">
              {part}
            </kbd>
            {index < parts.length - 1 && (
              <span className="text-xs text-muted-foreground">then</span>
            )}
          </span>
        ))}
      </span>
    );
  }

  return (
    <kbd
      className={cn(
        "px-1.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded",
        className
      )}
    >
      {display}
    </kbd>
  );
}
