import { detectUnit } from "./detect";
import { convert } from "./converters";
import { getUnitSymbol, getUnitInfo } from "./registry";
import type { Unit, UnitPreferences, UnitCategory } from "./types";
import { PREF_DEFAULT } from "./types";

export const UNIT_ORIGINAL = "__original__" as const;
export type DisplayUnitValue = Unit | typeof UNIT_ORIGINAL;

export interface MetricUnitConfig {
  displayUnit?: DisplayUnitValue;
}

export interface ConversionContext {
  userPreferences: UnitPreferences;
  metricSettings: Map<string, MetricUnitConfig>;
}

interface MetricConversionInfo {
  sourceUnit: Unit | null;
  targetUnit: Unit | null;
  category: UnitCategory | null;
  conversionNeeded: boolean;
}

function getTargetUnitForCategory(
  category: UnitCategory,
  userPreferences: UnitPreferences
): Unit | null {
  let pref: string;
  switch (category) {
    case "temperature":
      pref = userPreferences.temperature;
      break;
    case "pressure":
      pref = userPreferences.pressure;
      break;
    case "concentration":
      pref = userPreferences.concentration;
      break;
    case "humidity":
      pref = userPreferences.humidity;
      break;
    case "length":
      pref = userPreferences.length;
      break;
    case "speed":
      pref = userPreferences.speed;
      break;
    default:
      pref = userPreferences.temperature;
  }

  if (pref === PREF_DEFAULT) {
    return null;
  }

  return pref as Unit;
}

export function getMetricConversionInfo(
  metricId: string,
  metricName: string,
  sourceUnitFromEvent: string | undefined,
  context: ConversionContext
): MetricConversionInfo {
  const metricConfig = context.metricSettings.get(metricId);

  if (metricConfig?.displayUnit === UNIT_ORIGINAL) {
    let detected = sourceUnitFromEvent ? detectUnit(sourceUnitFromEvent) : null;
    if (!detected) {
      detected = detectUnit(metricName);
    }
    return {
      sourceUnit: detected?.unit ?? null,
      targetUnit: detected?.unit ?? null,
      category: detected?.category ?? null,
      conversionNeeded: false,
    };
  }

  if (metricConfig?.displayUnit) {
    let detected = sourceUnitFromEvent ? detectUnit(sourceUnitFromEvent) : null;
    if (!detected) {
      detected = detectUnit(metricName);
    }
    const sourceUnit = detected?.unit ?? null;

    return {
      sourceUnit,
      targetUnit: metricConfig.displayUnit as Unit,
      category: detected?.category ?? null,
      conversionNeeded:
        sourceUnit !== null && sourceUnit !== metricConfig.displayUnit,
    };
  }

  if (context.userPreferences.disableAutoConversion) {
    let detected = sourceUnitFromEvent ? detectUnit(sourceUnitFromEvent) : null;
    if (!detected) {
      detected = detectUnit(metricName);
    }
    return {
      sourceUnit: detected?.unit ?? null,
      targetUnit: detected?.unit ?? null,
      category: detected?.category ?? null,
      conversionNeeded: false,
    };
  }

  let detected = sourceUnitFromEvent ? detectUnit(sourceUnitFromEvent) : null;
  if (!detected) {
    detected = detectUnit(metricName);
  }

  if (!detected) {
    return {
      sourceUnit: null,
      targetUnit: null,
      category: null,
      conversionNeeded: false,
    };
  }

  const targetUnit = getTargetUnitForCategory(
    detected.category,
    context.userPreferences
  );

  if (targetUnit === null) {
    return {
      sourceUnit: detected.unit,
      targetUnit: detected.unit,
      category: detected.category,
      conversionNeeded: false,
    };
  }

  return {
    sourceUnit: detected.unit,
    targetUnit,
    category: detected.category,
    conversionNeeded: detected.unit !== targetUnit,
  };
}

export function convertValue(
  value: number,
  conversionInfo: MetricConversionInfo
): number {
  if (
    !conversionInfo.conversionNeeded ||
    !conversionInfo.sourceUnit ||
    !conversionInfo.targetUnit
  ) {
    return value;
  }

  try {
    return convert(value, conversionInfo.sourceUnit, conversionInfo.targetUnit);
  } catch (error) {
    console.warn("Unit conversion failed:", error);
    return value;
  }
}

export function getDisplayUnitSymbol(
  conversionInfo: MetricConversionInfo,
  originalUnit?: string
): string {
  if (conversionInfo.targetUnit) {
    return getUnitSymbol(conversionInfo.targetUnit);
  }
  return originalUnit ?? "";
}

export function applyUnitConversions(
  chartData: Record<string, unknown>[],
  selectedMetrics: Set<string>,
  metricInfoMap: Map<
    string,
    { channel: string; dataCollectionPoint: string; units?: string }
  >,
  context: ConversionContext
): Map<string, string> {
  const convertedUnitSymbols = new Map<string, string>();
  const conversionInfoCache = new Map<string, MetricConversionInfo>();

  selectedMetrics.forEach((metricId) => {
    const info = metricInfoMap.get(metricId);
    if (!info) return;

    const metricName = `${info.channel} ${info.dataCollectionPoint}`;
    const conversionInfo = getMetricConversionInfo(
      metricId,
      metricName,
      info.units,
      context
    );

    conversionInfoCache.set(metricId, conversionInfo);

    if (conversionInfo.targetUnit) {
      const unitInfo = getUnitInfo(conversionInfo.targetUnit);
      convertedUnitSymbols.set(metricId, unitInfo?.symbol ?? info.units ?? "");
    } else {
      convertedUnitSymbols.set(metricId, info.units ?? "");
    }
  });

  for (const point of chartData) {
    for (const metricId of selectedMetrics) {
      const value = point[metricId];
      if (typeof value !== "number") continue;

      const conversionInfo = conversionInfoCache.get(metricId);
      if (!conversionInfo?.conversionNeeded) continue;

      point[metricId] = convertValue(value, conversionInfo);

      const maKey = `${metricId}_ma`;
      const maValue = point[maKey];
      if (typeof maValue === "number") {
        point[maKey] = convertValue(maValue, conversionInfo);
      }
    }
  }

  return convertedUnitSymbols;
}
