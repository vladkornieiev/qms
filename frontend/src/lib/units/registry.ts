import type { Unit, UnitInfo, UnitCategory } from "./types";

// Complete registry of all units with metadata
export const UNIT_REGISTRY: Record<Unit, UnitInfo> = {
  // Temperature
  celsius: {
    id: "celsius",
    category: "temperature",
    symbol: "°C",
    name: "Celsius",
    decimals: 1,
  },
  fahrenheit: {
    id: "fahrenheit",
    category: "temperature",
    symbol: "°F",
    name: "Fahrenheit",
    decimals: 1,
  },
  kelvin: {
    id: "kelvin",
    category: "temperature",
    symbol: "K",
    name: "Kelvin",
    decimals: 1,
  },

  // Pressure
  pa: {
    id: "pa",
    category: "pressure",
    symbol: "Pa",
    name: "Pascal",
    decimals: 0,
  },
  hpa: {
    id: "hpa",
    category: "pressure",
    symbol: "hPa",
    name: "Hectopascal",
    decimals: 1,
  },
  psi: {
    id: "psi",
    category: "pressure",
    symbol: "psi",
    name: "Pounds per square inch",
    decimals: 2,
  },
  bar: {
    id: "bar",
    category: "pressure",
    symbol: "bar",
    name: "Bar",
    decimals: 3,
  },
  kpa: {
    id: "kpa",
    category: "pressure",
    symbol: "kPa",
    name: "Kilopascal",
    decimals: 1,
  },
  atm: {
    id: "atm",
    category: "pressure",
    symbol: "atm",
    name: "Atmosphere",
    decimals: 3,
  },
  mmhg: {
    id: "mmhg",
    category: "pressure",
    symbol: "mmHg",
    name: "Millimeters of mercury",
    decimals: 1,
  },
  inhg: {
    id: "inhg",
    category: "pressure",
    symbol: "inHg",
    name: "Inches of mercury",
    decimals: 2,
  },

  // Concentration
  ppm: {
    id: "ppm",
    category: "concentration",
    symbol: "ppm",
    name: "Parts per million",
    decimals: 2,
  },
  ppmv: {
    id: "ppmv",
    category: "concentration",
    symbol: "ppmv",
    name: "Parts per million (volume)",
    decimals: 2,
  },
  ppb: {
    id: "ppb",
    category: "concentration",
    symbol: "ppb",
    name: "Parts per billion",
    decimals: 1,
  },
  ppbv: {
    id: "ppbv",
    category: "concentration",
    symbol: "ppbv",
    name: "Parts per billion (volume)",
    decimals: 1,
  },
  mg_m3: {
    id: "mg_m3",
    category: "concentration",
    symbol: "mg/m³",
    name: "Milligrams per cubic meter",
    decimals: 3,
  },
  ug_m3: {
    id: "ug_m3",
    category: "concentration",
    symbol: "μg/m³",
    name: "Micrograms per cubic meter",
    decimals: 1,
  },
  percent: {
    id: "percent",
    category: "concentration",
    symbol: "%",
    name: "Percent",
    decimals: 2,
  },

  // Humidity
  percent_rh: {
    id: "percent_rh",
    category: "humidity",
    symbol: "% RH",
    name: "Relative humidity",
    decimals: 1,
  },
  g_m3: {
    id: "g_m3",
    category: "humidity",
    symbol: "g/m³",
    name: "Grams per cubic meter",
    decimals: 2,
  },

  // Length
  mm: {
    id: "mm",
    category: "length",
    symbol: "mm",
    name: "Millimeters",
    decimals: 1,
  },
  cm: {
    id: "cm",
    category: "length",
    symbol: "cm",
    name: "Centimeters",
    decimals: 2,
  },
  m: {
    id: "m",
    category: "length",
    symbol: "m",
    name: "Meters",
    decimals: 3,
  },
  in: {
    id: "in",
    category: "length",
    symbol: "in",
    name: "Inches",
    decimals: 2,
  },
  ft: {
    id: "ft",
    category: "length",
    symbol: "ft",
    name: "Feet",
    decimals: 2,
  },

  // Speed
  m_s: {
    id: "m_s",
    category: "speed",
    symbol: "m/s",
    name: "Meters per second",
    decimals: 2,
  },
  km_h: {
    id: "km_h",
    category: "speed",
    symbol: "km/h",
    name: "Kilometers per hour",
    decimals: 1,
  },
  mph: {
    id: "mph",
    category: "speed",
    symbol: "mph",
    name: "Miles per hour",
    decimals: 1,
  },
  knots: {
    id: "knots",
    category: "speed",
    symbol: "kn",
    name: "Knots",
    decimals: 1,
  },
};

// Get unit info by ID
export function getUnitInfo(unit: Unit): UnitInfo {
  return UNIT_REGISTRY[unit];
}

// Get all units for a category
export function getUnitsForCategory(category: UnitCategory): UnitInfo[] {
  return Object.values(UNIT_REGISTRY).filter((u) => u.category === category);
}

// Get unit symbol
export function getUnitSymbol(unit: Unit): string {
  return UNIT_REGISTRY[unit].symbol;
}

// Format value with unit
export function formatWithUnit(
  value: number,
  unit: Unit,
  overrideDecimals?: number
): string {
  const info = UNIT_REGISTRY[unit];
  const decimals = overrideDecimals ?? info.decimals;
  return `${value.toFixed(decimals)} ${info.symbol}`;
}
