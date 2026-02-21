export * from "./types";

export {
  UNIT_REGISTRY,
  getUnitInfo,
  getUnitsForCategory,
  getUnitSymbol,
  formatWithUnit,
} from "./registry";

export {
  convert,
  convertTemperature,
  convertPressure,
  convertConcentration,
  convertHumidity,
  convertLength,
  convertSpeed,
} from "./converters";

export {
  detectUnit,
  detectCategory,
  isTemperatureMetric,
  isPressureMetric,
  isConcentrationMetric,
  isHumidityMetric,
  isSpeedMetric,
  isLengthMetric,
} from "./detect";

export {
  applyUnitConversions,
  getMetricConversionInfo,
  convertValue,
  getDisplayUnitSymbol,
  UNIT_ORIGINAL,
  type MetricUnitConfig,
  type ConversionContext,
  type DisplayUnitValue,
} from "./chart-conversion";
