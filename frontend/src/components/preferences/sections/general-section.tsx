"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUserPreferences } from "@/contexts/user-preferences-context";
import { cn } from "@/lib/utils";

interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
  group: string;
}

const GROUPS = {
  AMERICAS: "Americas",
  EUROPE: "Europe",
  ASIA_PACIFIC: "Asia & Pacific",
  UTC_OFFSETS: "UTC Offsets",
};

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // Americas (UTC-10 to UTC-3)
  {
    value: "Pacific/Honolulu",
    label: "Hawaii",
    offset: "-10",
    group: GROUPS.AMERICAS,
  },
  {
    value: "America/Anchorage",
    label: "Alaska",
    offset: "-9",
    group: GROUPS.AMERICAS,
  },
  {
    value: "America/Los_Angeles",
    label: "Pacific Time",
    offset: "-8",
    group: GROUPS.AMERICAS,
  },
  {
    value: "America/Vancouver",
    label: "Vancouver",
    offset: "-8",
    group: GROUPS.AMERICAS,
  },
  {
    value: "America/Phoenix",
    label: "Arizona (no DST)",
    offset: "-7",
    group: GROUPS.AMERICAS,
  },
  {
    value: "America/Denver",
    label: "Mountain Time",
    offset: "-7",
    group: GROUPS.AMERICAS,
  },
  {
    value: "America/Chicago",
    label: "Central Time",
    offset: "-6",
    group: GROUPS.AMERICAS,
  },
  {
    value: "America/Mexico_City",
    label: "Mexico City",
    offset: "-6",
    group: GROUPS.AMERICAS,
  },
  {
    value: "America/New_York",
    label: "Eastern Time",
    offset: "-5",
    group: GROUPS.AMERICAS,
  },
  {
    value: "America/Toronto",
    label: "Toronto",
    offset: "-5",
    group: GROUPS.AMERICAS,
  },
  {
    value: "America/Sao_Paulo",
    label: "São Paulo",
    offset: "-3",
    group: GROUPS.AMERICAS,
  },
  {
    value: "America/Argentina/Buenos_Aires",
    label: "Buenos Aires",
    offset: "-3",
    group: GROUPS.AMERICAS,
  },
  // Europe (UTC+0 to UTC+3)
  {
    value: "Europe/London",
    label: "London",
    offset: "+0",
    group: GROUPS.EUROPE,
  },
  {
    value: "Europe/Brussels",
    label: "Brussels",
    offset: "+1",
    group: GROUPS.EUROPE,
  },
  { value: "Europe/Paris", label: "Paris", offset: "+1", group: GROUPS.EUROPE },
  {
    value: "Europe/Berlin",
    label: "Berlin",
    offset: "+1",
    group: GROUPS.EUROPE,
  },
  {
    value: "Europe/Amsterdam",
    label: "Amsterdam",
    offset: "+1",
    group: GROUPS.EUROPE,
  },
  {
    value: "Europe/Madrid",
    label: "Madrid",
    offset: "+1",
    group: GROUPS.EUROPE,
  },
  { value: "Europe/Rome", label: "Rome", offset: "+1", group: GROUPS.EUROPE },
  {
    value: "Europe/Zurich",
    label: "Zurich",
    offset: "+1",
    group: GROUPS.EUROPE,
  },
  {
    value: "Europe/Moscow",
    label: "Moscow",
    offset: "+3",
    group: GROUPS.EUROPE,
  },
  // Asia & Pacific (UTC+4 to UTC+13)
  {
    value: "Asia/Dubai",
    label: "Dubai",
    offset: "+4",
    group: GROUPS.ASIA_PACIFIC,
  },
  {
    value: "Asia/Kolkata",
    label: "Mumbai",
    offset: "+5:30",
    group: GROUPS.ASIA_PACIFIC,
  },
  {
    value: "Asia/Singapore",
    label: "Singapore",
    offset: "+8",
    group: GROUPS.ASIA_PACIFIC,
  },
  {
    value: "Asia/Hong_Kong",
    label: "Hong Kong",
    offset: "+8",
    group: GROUPS.ASIA_PACIFIC,
  },
  {
    value: "Asia/Shanghai",
    label: "Shanghai",
    offset: "+8",
    group: GROUPS.ASIA_PACIFIC,
  },
  {
    value: "Asia/Tokyo",
    label: "Tokyo",
    offset: "+9",
    group: GROUPS.ASIA_PACIFIC,
  },
  {
    value: "Asia/Seoul",
    label: "Seoul",
    offset: "+9",
    group: GROUPS.ASIA_PACIFIC,
  },
  {
    value: "Australia/Sydney",
    label: "Sydney",
    offset: "+10",
    group: GROUPS.ASIA_PACIFIC,
  },
  {
    value: "Australia/Melbourne",
    label: "Melbourne",
    offset: "+10",
    group: GROUPS.ASIA_PACIFIC,
  },
  {
    value: "Pacific/Auckland",
    label: "Auckland",
    offset: "+12",
    group: GROUPS.ASIA_PACIFIC,
  },
  // UTC offsets
  {
    value: "Etc/GMT+12",
    label: "UTC-12",
    offset: "-12",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT+11",
    label: "UTC-11",
    offset: "-11",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT+10",
    label: "UTC-10",
    offset: "-10",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT+9",
    label: "UTC-9",
    offset: "-9",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT+8",
    label: "UTC-8",
    offset: "-8",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT+7",
    label: "UTC-7",
    offset: "-7",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT+6",
    label: "UTC-6",
    offset: "-6",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT+5",
    label: "UTC-5",
    offset: "-5",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT+4",
    label: "UTC-4",
    offset: "-4",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT+3",
    label: "UTC-3",
    offset: "-3",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT+2",
    label: "UTC-2",
    offset: "-2",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT+1",
    label: "UTC-1",
    offset: "-1",
    group: GROUPS.UTC_OFFSETS,
  },
  { value: "UTC", label: "UTC", offset: "+0", group: GROUPS.UTC_OFFSETS },
  {
    value: "Etc/GMT-1",
    label: "UTC+1",
    offset: "+1",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-2",
    label: "UTC+2",
    offset: "+2",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-3",
    label: "UTC+3",
    offset: "+3",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-4",
    label: "UTC+4",
    offset: "+4",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-5",
    label: "UTC+5",
    offset: "+5",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-6",
    label: "UTC+6",
    offset: "+6",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-7",
    label: "UTC+7",
    offset: "+7",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-8",
    label: "UTC+8",
    offset: "+8",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-9",
    label: "UTC+9",
    offset: "+9",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-10",
    label: "UTC+10",
    offset: "+10",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-11",
    label: "UTC+11",
    offset: "+11",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-12",
    label: "UTC+12",
    offset: "+12",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-13",
    label: "UTC+13",
    offset: "+13",
    group: GROUPS.UTC_OFFSETS,
  },
  {
    value: "Etc/GMT-14",
    label: "UTC+14",
    offset: "+14",
    group: GROUPS.UTC_OFFSETS,
  },
];

function getTimezonesByGroup(): Record<string, TimezoneOption[]> {
  return TIMEZONE_OPTIONS.reduce((acc, tz) => {
    if (!acc[tz.group]) {
      acc[tz.group] = [];
    }
    acc[tz.group].push(tz);
    return acc;
  }, {} as Record<string, TimezoneOption[]>);
}

export function GeneralPreferencesSection() {
  const { timezonePreferences, updateTimezonePreferences, isSaving } =
    useUserPreferences();

  const groupedTimezones = getTimezonesByGroup();

  const isEnabled = timezonePreferences.enabled;
  const selectedTimezone = timezonePreferences.timezone;

  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const selectedOption = TIMEZONE_OPTIONS.find(
    (tz) => tz.value === selectedTimezone
  );

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-3">Timezone</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enable-timezone" className="text-sm font-medium">
                Use custom timezone
              </Label>
              <p className="text-sm text-muted-foreground">
                Override browser timezone for displaying dates and times
              </p>
            </div>
            <Switch
              id="enable-timezone"
              checked={isEnabled}
              onCheckedChange={(checked) => {
                updateTimezonePreferences({
                  enabled: checked,
                  timezone: checked
                    ? selectedTimezone || browserTimezone
                    : selectedTimezone,
                });
              }}
              disabled={isSaving}
            />
          </div>

          <div
            className={cn(
              "space-y-2",
              !isEnabled && "opacity-50 pointer-events-none"
            )}
          >
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="text-sm">Select timezone</Label>
              <Select
                value={selectedTimezone || ""}
                onValueChange={(value) =>
                  updateTimezonePreferences({ timezone: value })
                }
                disabled={isSaving}
              >
                <SelectTrigger className="w-[260px]">
                  {selectedOption ? (
                    <span className="flex items-center gap-2">
                      <span>{selectedOption.label}</span>
                      <span className="text-muted-foreground text-xs">
                        UTC{selectedOption.offset}
                      </span>
                    </span>
                  ) : (
                    <SelectValue placeholder="Select timezone..." />
                  )}
                </SelectTrigger>
                <SelectContent className="min-w-[260px]">
                  {Object.entries(groupedTimezones).map(([group, tzList]) => (
                    <SelectGroup key={group}>
                      <SelectLabel>{group}</SelectLabel>
                      {tzList.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          <span>{tz.label}</span>
                          {tz.group !== GROUPS.UTC_OFFSETS && (
                            <span className="text-muted-foreground text-xs tabular-nums">
                              UTC{tz.offset}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
