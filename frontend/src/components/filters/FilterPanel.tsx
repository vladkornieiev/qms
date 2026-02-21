"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Check, RotateCcw } from "lucide-react";
import type { FilterState } from "@/hooks/use-filters";

interface DataSourceOption {
  id: string;
  name: string;
}

interface FilterPanelProps {
  /** Available data sources to filter by */
  dataSources: DataSourceOption[];
  /** Available channels to filter by (optional - for table page) */
  channels?: string[];
  /** Current pending filter values */
  pendingFilters: FilterState;
  /** Whether there are unapplied changes */
  hasUnappliedChanges: boolean;
  /** Whether any filters are currently active */
  hasActiveFilters: boolean;
  /** Callback when a filter value changes */
  onFilterChange: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  /** Callback to apply filters */
  onApply: () => void;
  /** Callback to clear all filters */
  onClear: () => void;
  /** Callback to reset pending changes */
  onReset: () => void;
}

export function FilterPanel({
  dataSources,
  channels,
  pendingFilters,
  hasUnappliedChanges,
  hasActiveFilters,
  onFilterChange,
  onApply,
  onClear,
  onReset,
}: FilterPanelProps) {
  const showChannelFilter = channels !== undefined;
  const gridCols = showChannelFilter ? "lg:grid-cols-5" : "lg:grid-cols-4";

  const handleDataSourceChange = (value: string) => {
    onFilterChange("dataSourceIds", value === "all" ? [] : [value]);
  };

  const handleChannelChange = (value: string) => {
    onFilterChange("channel", value === "all" ? "" : value);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
              {hasUnappliedChanges && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Unsaved changes
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure filters and click Apply to update the view
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 md:grid-cols-2 ${gridCols}`}>
          <div className="space-y-2">
            <Label htmlFor="filter-dataSource">Data Source</Label>
            <Select
              value={pendingFilters.dataSourceIds[0] || "all"}
              onValueChange={handleDataSourceChange}
            >
              <SelectTrigger id="filter-dataSource" className="w-full">
                <SelectValue placeholder="All data sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data Sources</SelectItem>
                {dataSources.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    {ds.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showChannelFilter && (
            <div className="space-y-2">
              <Label htmlFor="filter-channel">Channel</Label>
              <Select
                value={pendingFilters.channel || "all"}
                onValueChange={handleChannelChange}
              >
                <SelectTrigger id="filter-channel" className="w-full">
                  <SelectValue placeholder="All channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {channels.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="filter-fromDate">From Date</Label>
            <Input
              id="filter-fromDate"
              type="datetime-local"
              value={pendingFilters.fromTimestamp}
              onChange={(e) => onFilterChange("fromTimestamp", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-toDate">To Date</Label>
            <Input
              id="filter-toDate"
              type="datetime-local"
              value={pendingFilters.toTimestamp}
              onChange={(e) => onFilterChange("toTimestamp", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <div className="flex gap-2">
              <Button
                onClick={onApply}
                disabled={!hasUnappliedChanges}
                className="flex-1"
              >
                <Check className="mr-2 h-4 w-4" />
                Apply
              </Button>
              {hasUnappliedChanges ? (
                <Button
                  variant="outline"
                  onClick={onReset}
                  title="Discard changes"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={onClear}
                  disabled={!hasActiveFilters}
                  title="Clear all filters"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
