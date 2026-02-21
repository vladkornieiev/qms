"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { useUserPreferences } from "@/contexts/user-preferences-context";
import { toast } from "sonner";

export function ChartsPreferencesSection() {
  const {
    chartPreferences,
    setDefaultDocumentBehavior,
    updateDisplayConfig,
    updateSamplingPreferences,
    resetChartPreferences,
    isSaving,
  } = useUserPreferences();

  const displayConfig = chartPreferences.defaultDisplayConfig;
  const samplingPreferences = chartPreferences.samplingPreferences;

  const handleRememberDocumentChange = async (checked: boolean) => {
    await setDefaultDocumentBehavior(checked ? "last" : "new");
  };

  const handleResetAll = async () => {
    await resetChartPreferences();
    toast.success("Chart preferences reset to defaults");
  };

  return (
    <div className="space-y-6">
      {/* Document Behavior */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Document</h4>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="remember-document" className="text-sm font-medium">
              Remember last opened document
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically open the last document when you visit the charts
              page
            </p>
          </div>
          <Switch
            id="remember-document"
            checked={chartPreferences.defaultDocumentBehavior === "last"}
            onCheckedChange={handleRememberDocumentChange}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          Default Display Options
        </h4>

        {/* Toggle options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="show-data-points" className="text-sm">
              Show Data Points
            </Label>
            <Switch
              id="show-data-points"
              checked={displayConfig.showDataPoints}
              onCheckedChange={(checked) =>
                updateDisplayConfig({ showDataPoints: checked })
              }
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="show-animation" className="text-sm">
              Enable Animation
            </Label>
            <Switch
              id="show-animation"
              checked={displayConfig.showAnimation}
              onCheckedChange={(checked) =>
                updateDisplayConfig({ showAnimation: checked })
              }
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="show-annotations" className="text-sm">
              Show Annotations
            </Label>
            <Switch
              id="show-annotations"
              checked={displayConfig.showAnnotations}
              onCheckedChange={(checked) =>
                updateDisplayConfig({ showAnnotations: checked })
              }
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="show-grid-lines" className="text-sm">
              Show Grid Lines
            </Label>
            <Switch
              id="show-grid-lines"
              checked={displayConfig.showGridLines ?? true}
              onCheckedChange={(checked) =>
                updateDisplayConfig({ showGridLines: checked })
              }
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="area-fill" className="text-sm">
              Area Fill
            </Label>
            <Switch
              id="area-fill"
              checked={displayConfig.areaFill ?? false}
              onCheckedChange={(checked) =>
                updateDisplayConfig({ areaFill: checked })
              }
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      {/* Y-Axis Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Y-Axis</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="y-axis-log-scale" className="text-sm">
              Log Scale
            </Label>
            <Switch
              id="y-axis-log-scale"
              checked={displayConfig.yAxisLogScale ?? false}
              onCheckedChange={(checked) =>
                updateDisplayConfig({ yAxisLogScale: checked })
              }
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="y-axis-start-zero" className="text-sm">
              Start at Zero
            </Label>
            <Switch
              id="y-axis-start-zero"
              checked={displayConfig.yAxisStartAtZero ?? false}
              onCheckedChange={(checked) =>
                updateDisplayConfig({ yAxisStartAtZero: checked })
              }
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      {/* Select Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          Line Style
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="text-sm">Style</Label>
            <Select
              value={displayConfig.lineStyle}
              onValueChange={(value) =>
                updateDisplayConfig({
                  lineStyle: value as "monotone" | "linear" | "step",
                })
              }
              disabled={isSaving}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monotone">Smooth</SelectItem>
                <SelectItem value="linear">Straight</SelectItem>
                <SelectItem value="step">Step</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="text-sm">Thickness</Label>
            <Select
              value={displayConfig.lineThickness.toString()}
              onValueChange={(value) =>
                updateDisplayConfig({
                  lineThickness: Number.parseFloat(value),
                })
              }
              disabled={isSaving}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.5">Thin (1.5px)</SelectItem>
                <SelectItem value="2.5">Normal (2.5px)</SelectItem>
                <SelectItem value="3.5">Thick (3.5px)</SelectItem>
                <SelectItem value="5">Extra Thick (5px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="text-sm">Legend Position</Label>
            <Select
              value={displayConfig.legendPosition ?? "bottom"}
              onValueChange={(value) =>
                updateDisplayConfig({
                  legendPosition: value as "hidden" | "top" | "bottom" | "info",
                })
              }
              disabled={isSaving}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="info">Info Icon</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          Performance
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="enable-sampling" className="text-sm">
                Enable Data Sampling
              </Label>
              <p className="text-xs text-muted-foreground">
                Reduces displayed points for better performance
              </p>
            </div>
            <Switch
              id="enable-sampling"
              checked={samplingPreferences.enabled}
              onCheckedChange={(checked) =>
                updateSamplingPreferences({ enabled: checked })
              }
              disabled={isSaving}
            />
          </div>

          {samplingPreferences.enabled && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="text-sm">Sampling Threshold</Label>
              <Select
                value={samplingPreferences.threshold.toString()}
                onValueChange={(value) =>
                  updateSamplingPreferences({
                    threshold: Number.parseInt(value),
                  })
                }
                disabled={isSaving}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5000">5,000 points</SelectItem>
                  <SelectItem value="10000">10,000 points</SelectItem>
                  <SelectItem value="20000">20,000 points</SelectItem>
                  <SelectItem value="50000">50,000 points</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!samplingPreferences.enabled && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-xs">
                Disabling sampling may cause significant performance degradation
                with large datasets. Charts may become slow or unresponsive.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reset All */}
      <div className="pt-4 border-t">
        <Button variant="outline" onClick={handleResetAll} disabled={isSaving}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset All to Defaults
        </Button>
      </div>
    </div>
  );
}
