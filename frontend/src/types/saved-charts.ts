import {
  UnitPreferences,
  defaultUnitPreferences,
  DisplayUnitValue,
} from "@/lib/units";

export type AggregationType = "average" | "min" | "max" | "movingAverage";

export interface AggregationConfig {
  type: AggregationType;
  enabled: boolean;
  windowSize?: number;
}

export interface MetricSettings {
  customLabel?: string;
  color?: string;
  visible?: boolean;
  filterEnabled: boolean;
  filterFrom?: number;
  filterTo?: number;
  filterIsPercentage: boolean;
  aggregations?: AggregationConfig[];
  yAxis?: "left" | "right";
  displayUnit?: DisplayUnitValue;
}

export interface ChartDisplayConfig {
  showDataPoints: boolean;
  lineStyle: "monotone" | "linear" | "step";
  showAnimation: boolean;
  lineThickness: number;
  showAnnotations: boolean;
  yAxisLogScale?: boolean;
  yAxisStartAtZero?: boolean;
  areaFill?: boolean;
  showGridLines?: boolean;
  legendPosition?: "hidden" | "top" | "bottom" | "left" | "right" | "info";
}

export const defaultChartDisplayConfig: ChartDisplayConfig = {
  showDataPoints: true,
  lineStyle: "linear",
  showAnimation: false,
  lineThickness: 1.5,
  showAnnotations: true,
  yAxisLogScale: false,
  yAxisStartAtZero: false,
  areaFill: false,
  showGridLines: true,
  legendPosition: "bottom",
};

export interface SavedChartConfig {
  id: string;
  name: string;
  description?: string;
  selectedMetricIds: string[];
  metricSettings: Record<string, MetricSettings>;
  displayConfig?: ChartDisplayConfig;
  height?: number;
  showOnDashboard: boolean;
  dashboardOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Annotation {
  id: string;
  type: "point" | "range";
  timestamp: number; // for point, or start for range
  timestampTo?: number; // end for range
  label: string;
  description?: string;
  color?: string;
  documentId?: string; // scope annotation to specific document/view
  createdAt: number;
  updatedAt: number;
}

export interface DocumentChart {
  id: string;
  name?: string;
  savedChartId?: string;
  selectedMetricIds: string[];
  metricSettings: Record<string, MetricSettings>;
  displayConfig?: ChartDisplayConfig;
  height?: number;
}

export interface DocumentFilters {
  fromTimestamp?: string;
  toTimestamp?: string;
  selectedDataSources?: string[];
}

export interface SavedDocument {
  id: string;
  name: string;
  description?: string;
  charts: DocumentChart[];
  filters?: DocumentFilters;
  visibleAnnotationIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAttributes {
  savedCharts?: SavedChartConfig[];
  savedDocuments?: SavedDocument[];
  eventChannelMappings?: Record<string, string>;
  annotations?: Annotation[];
  lastOpenedDocumentId?: string;
}

export function metricSettingsMapToRecord(
  map: Map<string, MetricSettings>
): Record<string, MetricSettings> {
  const record: Record<string, MetricSettings> = {};
  map.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

export function metricSettingsRecordToMap(
  record: Record<string, MetricSettings>
): Map<string, MetricSettings> {
  const map = new Map<string, MetricSettings>();
  Object.entries(record).forEach(([key, value]) => {
    map.set(key, value);
  });
  return map;
}

export type DefaultDocumentBehavior = "last" | "new";

export interface SamplingPreferences {
  enabled: boolean;
  threshold: number;
}

export const defaultSamplingPreferences: SamplingPreferences = {
  enabled: true,
  threshold: 10000,
};

export interface TimezonePreferences {
  enabled: boolean;
  timezone: string | null;
}

export const defaultTimezonePreferences: TimezonePreferences = {
  enabled: false,
  timezone: null,
};

export interface ChartPreferences {
  defaultDocumentBehavior: DefaultDocumentBehavior;
  defaultDisplayConfig: ChartDisplayConfig;
  unitPreferences: UnitPreferences;
  samplingPreferences: SamplingPreferences;
}

export const defaultChartPreferences: ChartPreferences = {
  defaultDocumentBehavior: "last",
  defaultDisplayConfig: { ...defaultChartDisplayConfig },
  unitPreferences: { ...defaultUnitPreferences },
  samplingPreferences: { ...defaultSamplingPreferences },
};
