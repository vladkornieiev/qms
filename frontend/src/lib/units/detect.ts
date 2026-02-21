import type { Unit, UnitCategory } from "./types";

interface DetectedUnit {
  unit: Unit;
  category: UnitCategory;
  confidence: "high" | "medium" | "low";
}

const EXACT_UNIT_MAP: Record<string, { unit: Unit; category: UnitCategory }> = {
  c: { unit: "celsius", category: "temperature" },
  "°c": { unit: "celsius", category: "temperature" },
  f: { unit: "fahrenheit", category: "temperature" },
  "°f": { unit: "fahrenheit", category: "temperature" },
  k: { unit: "kelvin", category: "temperature" },
  pa: { unit: "pa", category: "pressure" },
  hpa: { unit: "hpa", category: "pressure" },
  psi: { unit: "psi", category: "pressure" },
  bar: { unit: "bar", category: "pressure" },
  kpa: { unit: "kpa", category: "pressure" },
  atm: { unit: "atm", category: "pressure" },
  mmhg: { unit: "mmhg", category: "pressure" },
  inhg: { unit: "inhg", category: "pressure" },
  ppm: { unit: "ppm", category: "concentration" },
  ppb: { unit: "ppb", category: "concentration" },
  ppmv: { unit: "ppmv", category: "concentration" },
  ppbv: { unit: "ppbv", category: "concentration" },
  "mg/m3": { unit: "mg_m3", category: "concentration" },
  "mg/m³": { unit: "mg_m3", category: "concentration" },
  "ug/m3": { unit: "ug_m3", category: "concentration" },
  "ug/m³": { unit: "ug_m3", category: "concentration" },
  "µg/m3": { unit: "ug_m3", category: "concentration" },
  "µg/m³": { unit: "ug_m3", category: "concentration" },
  "%": { unit: "percent_rh", category: "humidity" },
  "%rh": { unit: "percent_rh", category: "humidity" },
  mph: { unit: "mph", category: "speed" },
  "km/h": { unit: "km_h", category: "speed" },
  kmh: { unit: "km_h", category: "speed" },
  "m/s": { unit: "m_s", category: "speed" },
  knots: { unit: "knots", category: "speed" },
  kt: { unit: "knots", category: "speed" },
  mm: { unit: "mm", category: "length" },
  cm: { unit: "cm", category: "length" },
  m: { unit: "m", category: "length" },
  in: { unit: "in", category: "length" },
  ft: { unit: "ft", category: "length" },
};

const DETECTION_PATTERNS: Array<{
  pattern: RegExp;
  unit: Unit;
  category: UnitCategory;
  confidence: "high" | "medium" | "low";
}> = [
  {
    pattern: /_c$/i,
    unit: "celsius",
    category: "temperature",
    confidence: "high",
  },
  {
    pattern: /_f$/i,
    unit: "fahrenheit",
    category: "temperature",
    confidence: "high",
  },
  {
    pattern: /_k$/i,
    unit: "kelvin",
    category: "temperature",
    confidence: "high",
  },
  {
    pattern: /celsius/i,
    unit: "celsius",
    category: "temperature",
    confidence: "high",
  },
  {
    pattern: /fahrenheit/i,
    unit: "fahrenheit",
    category: "temperature",
    confidence: "high",
  },
  {
    pattern: /kelvin/i,
    unit: "kelvin",
    category: "temperature",
    confidence: "high",
  },

  {
    pattern: /temp/i,
    unit: "celsius",
    category: "temperature",
    confidence: "medium",
  },
  {
    pattern: /temperature/i,
    unit: "celsius",
    category: "temperature",
    confidence: "medium",
  },

  { pattern: /_pa$/i, unit: "pa", category: "pressure", confidence: "high" },
  { pattern: /_hpa$/i, unit: "hpa", category: "pressure", confidence: "high" },
  {
    pattern: /\bhpa\b/i,
    unit: "hpa",
    category: "pressure",
    confidence: "high",
  },
  { pattern: /_psi$/i, unit: "psi", category: "pressure", confidence: "high" },
  { pattern: /_bar$/i, unit: "bar", category: "pressure", confidence: "high" },
  { pattern: /_kpa$/i, unit: "kpa", category: "pressure", confidence: "high" },
  { pattern: /_atm$/i, unit: "atm", category: "pressure", confidence: "high" },
  {
    pattern: /_mmhg$/i,
    unit: "mmhg",
    category: "pressure",
    confidence: "high",
  },
  {
    pattern: /_inhg$/i,
    unit: "inhg",
    category: "pressure",
    confidence: "high",
  },
  {
    pattern: /\binhg\b/i,
    unit: "inhg",
    category: "pressure",
    confidence: "high",
  },

  {
    pattern: /altimeter/i,
    unit: "inhg",
    category: "pressure",
    confidence: "medium",
  },
  {
    pattern: /pressure/i,
    unit: "bar",
    category: "pressure",
    confidence: "medium",
  },
  {
    pattern: /barom/i,
    unit: "bar",
    category: "pressure",
    confidence: "medium",
  },

  {
    pattern: /_ppmv$/i,
    unit: "ppmv",
    category: "concentration",
    confidence: "high",
  },
  {
    pattern: /_ppbv$/i,
    unit: "ppbv",
    category: "concentration",
    confidence: "high",
  },
  {
    pattern: /\bppmv\b/i,
    unit: "ppmv",
    category: "concentration",
    confidence: "high",
  },
  {
    pattern: /\bppbv\b/i,
    unit: "ppbv",
    category: "concentration",
    confidence: "high",
  },
  {
    pattern: /_ppm$/i,
    unit: "ppm",
    category: "concentration",
    confidence: "high",
  },
  {
    pattern: /_ppb$/i,
    unit: "ppb",
    category: "concentration",
    confidence: "high",
  },
  {
    pattern: /mg_m3/i,
    unit: "mg_m3",
    category: "concentration",
    confidence: "high",
  },
  {
    pattern: /ug_m3/i,
    unit: "ug_m3",
    category: "concentration",
    confidence: "high",
  },

  {
    pattern: /co2/i,
    unit: "ppm",
    category: "concentration",
    confidence: "medium",
  },
  {
    pattern: /voc/i,
    unit: "ppbv",
    category: "concentration",
    confidence: "medium",
  },
  {
    pattern: /pm25|pm2\.5/i,
    unit: "ug_m3",
    category: "concentration",
    confidence: "medium",
  },
  {
    pattern: /pm10/i,
    unit: "ug_m3",
    category: "concentration",
    confidence: "medium",
  },

  {
    pattern: /_rh$/i,
    unit: "percent_rh",
    category: "humidity",
    confidence: "high",
  },
  {
    pattern: /humidity/i,
    unit: "percent_rh",
    category: "humidity",
    confidence: "medium",
  },

  { pattern: /_mph$/i, unit: "mph", category: "speed", confidence: "high" },
  { pattern: /_kmh$/i, unit: "km_h", category: "speed", confidence: "high" },
  { pattern: /_ms$/i, unit: "m_s", category: "speed", confidence: "high" },
  { pattern: /_knots$/i, unit: "knots", category: "speed", confidence: "high" },

  {
    pattern: /wind.*speed/i,
    unit: "m_s",
    category: "speed",
    confidence: "medium",
  },
  { pattern: /speed/i, unit: "m_s", category: "speed", confidence: "low" },

  { pattern: /_mm$/i, unit: "mm", category: "length", confidence: "high" },
  { pattern: /_cm$/i, unit: "cm", category: "length", confidence: "high" },
  { pattern: /_m$/i, unit: "m", category: "length", confidence: "high" },
  { pattern: /_in$/i, unit: "in", category: "length", confidence: "high" },
  { pattern: /_ft$/i, unit: "ft", category: "length", confidence: "high" },

  { pattern: /rain/i, unit: "mm", category: "length", confidence: "medium" },
  { pattern: /precip/i, unit: "mm", category: "length", confidence: "medium" },
];

export function detectUnit(name: string): DetectedUnit | null {
  const exactMatch = EXACT_UNIT_MAP[name.toLowerCase().trim()];
  if (exactMatch) {
    return { ...exactMatch, confidence: "high" };
  }

  for (const { pattern, unit, category, confidence } of DETECTION_PATTERNS) {
    if (pattern.test(name)) {
      return { unit, category, confidence };
    }
  }
  return null;
}

export function detectCategory(name: string): UnitCategory | null {
  const detected = detectUnit(name);
  return detected?.category ?? null;
}

export function isTemperatureMetric(name: string): boolean {
  return detectCategory(name) === "temperature";
}

export function isPressureMetric(name: string): boolean {
  return detectCategory(name) === "pressure";
}

export function isConcentrationMetric(name: string): boolean {
  return detectCategory(name) === "concentration";
}

export function isHumidityMetric(name: string): boolean {
  return detectCategory(name) === "humidity";
}

export function isSpeedMetric(name: string): boolean {
  return detectCategory(name) === "speed";
}

export function isLengthMetric(name: string): boolean {
  return detectCategory(name) === "length";
}
