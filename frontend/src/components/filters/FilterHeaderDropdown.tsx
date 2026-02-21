"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataSourceOption {
  id: string;
  name: string;
}

interface FilterHeaderDropdownProps {
  /** Available data sources to filter by */
  dataSources: DataSourceOption[];
  /** Currently selected data source ID */
  selectedDataSourceId: string | undefined;
  /** Callback when data source selection changes */
  onDataSourceChange: (dataSourceId: string | null) => void;
}

export function FilterHeaderDropdown({
  dataSources,
  selectedDataSourceId,
  onDataSourceChange,
}: FilterHeaderDropdownProps) {
  const handleChange = (value: string) => {
    onDataSourceChange(value === "all" ? null : value);
  };

  return (
    <div className="flex items-center gap-2">
      <Label
        htmlFor="dataSource-header"
        className="text-sm font-medium whitespace-nowrap"
      >
        Filter Data Sources:
      </Label>
      <Select
        value={selectedDataSourceId || "all"}
        onValueChange={handleChange}
      >
        <SelectTrigger id="dataSource-header" className="w-[200px]">
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
  );
}
