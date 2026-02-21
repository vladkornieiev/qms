// Unit type categories
export type UnitCategory =
  | "temperature"
  | "pressure"
  | "concentration"
  | "humidity"
  | "length"
  | "speed";

// Special value meaning "keep original, no conversion"
export const PREF_DEFAULT = "default" as const;
export type PrefDefault = typeof PREF_DEFAULT;

// Temperature units
export type TemperatureUnit = "celsius" | "fahrenheit" | "kelvin";

// Pressure units
export type PressureUnit = "pa" | "hpa" | "psi" | "bar" | "kpa" | "atm" | "mmhg" | "inhg";

// Concentration units
export type ConcentrationUnit =
  | "ppm"
  | "ppmv"
  | "ppb"
  | "ppbv"
  | "mg_m3"
  | "ug_m3"
  | "percent";

// Humidity units
export type HumidityUnit = "percent_rh" | "g_m3";

// Length units
export type LengthUnit = "mm" | "cm" | "m" | "in" | "ft";

// Speed units
export type SpeedUnit = "m_s" | "km_h" | "mph" | "knots";

// Union of all unit types
export type Unit =
  | TemperatureUnit
  | PressureUnit
  | ConcentrationUnit
  | HumidityUnit
  | LengthUnit
  | SpeedUnit;

// Unit metadata
export interface UnitInfo {
  id: Unit;
  category: UnitCategory;
  symbol: string;
  name: string;
  decimals: number;
}

// Unit preferences per category - can be a specific unit or "default" (keep original)
export interface UnitPreferences {
  temperature: TemperatureUnit | PrefDefault;
  pressure: PressureUnit | PrefDefault;
  concentration: ConcentrationUnit | PrefDefault;
  humidity: HumidityUnit | PrefDefault;
  length: LengthUnit | PrefDefault;
  speed: SpeedUnit | PrefDefault;
  disableAutoConversion?: boolean; // When true, show original units everywhere
}

// Default unit preferences - "default" means keep original (no conversion)
export const defaultUnitPreferences: UnitPreferences = {
  temperature: PREF_DEFAULT,
  pressure: PREF_DEFAULT,
  concentration: PREF_DEFAULT,
  humidity: PREF_DEFAULT,
  length: PREF_DEFAULT,
  speed: PREF_DEFAULT,
  disableAutoConversion: false,
};
