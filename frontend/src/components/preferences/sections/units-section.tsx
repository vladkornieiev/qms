"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserPreferences } from "@/contexts/user-preferences-context";
import { getUnitsForCategory, PREF_DEFAULT } from "@/lib/units";

export function UnitsPreferencesSection() {
  const { chartPreferences, updateUnitPreferences, isSaving } =
    useUserPreferences();

  const unitPrefs = chartPreferences.unitPreferences;
  const isConversionDisabled = unitPrefs.disableAutoConversion ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="enable-conversion" className="text-sm font-medium">
            Enable unit conversion
          </Label>
          <p className="text-sm text-muted-foreground">
            Automatically convert values to your preferred units
          </p>
        </div>
        <Switch
          id="enable-conversion"
          checked={!isConversionDisabled}
          onCheckedChange={(checked) =>
            updateUnitPreferences({ disableAutoConversion: !checked })
          }
          disabled={isSaving}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Set your preferred units for displaying sensor data in charts and
          tables.
        </p>
        <div
          className={`space-y-2 ${
            isConversionDisabled ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="text-sm">Temperature</Label>
            <Select
              value={unitPrefs.temperature}
              onValueChange={(value) =>
                updateUnitPreferences({
                  temperature: value as typeof unitPrefs.temperature,
                })
              }
              disabled={isSaving}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PREF_DEFAULT}>
                  Default (no conversion)
                </SelectItem>
                {getUnitsForCategory("temperature").map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="text-sm">Pressure</Label>
            <Select
              value={unitPrefs.pressure}
              onValueChange={(value) =>
                updateUnitPreferences({
                  pressure: value as typeof unitPrefs.pressure,
                })
              }
              disabled={isSaving}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PREF_DEFAULT}>
                  Default (no conversion)
                </SelectItem>
                {getUnitsForCategory("pressure").map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.symbol} - {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="text-sm">Concentration</Label>
            <Select
              value={unitPrefs.concentration}
              onValueChange={(value) =>
                updateUnitPreferences({
                  concentration: value as typeof unitPrefs.concentration,
                })
              }
              disabled={isSaving}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PREF_DEFAULT}>
                  Default (no conversion)
                </SelectItem>
                {getUnitsForCategory("concentration").map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="text-sm">Speed</Label>
            <Select
              value={unitPrefs.speed}
              onValueChange={(value) =>
                updateUnitPreferences({
                  speed: value as typeof unitPrefs.speed,
                })
              }
              disabled={isSaving}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PREF_DEFAULT}>
                  Default (no conversion)
                </SelectItem>
                {getUnitsForCategory("speed").map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="text-sm">Length</Label>
            <Select
              value={unitPrefs.length}
              onValueChange={(value) =>
                updateUnitPreferences({
                  length: value as typeof unitPrefs.length,
                })
              }
              disabled={isSaving}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PREF_DEFAULT}>
                  Default (no conversion)
                </SelectItem>
                {getUnitsForCategory("length").map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
