import type {
  TemperatureUnit,
  PressureUnit,
  ConcentrationUnit,
  HumidityUnit,
  LengthUnit,
  SpeedUnit,
  Unit,
  UnitCategory,
} from "./types";
import { UNIT_REGISTRY } from "./registry";

const toCelsius: Record<TemperatureUnit, (v: number) => number> = {
  celsius: (v) => v,
  fahrenheit: (v) => (v - 32) * (5 / 9),
  kelvin: (v) => v - 273.15,
};

const fromCelsius: Record<TemperatureUnit, (v: number) => number> = {
  celsius: (v) => v,
  fahrenheit: (v) => v * (9 / 5) + 32,
  kelvin: (v) => v + 273.15,
};

export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit
): number {
  if (from === to) return value;
  const celsius = toCelsius[from](value);
  return fromCelsius[to](celsius);
}

const toPascal: Record<PressureUnit, (v: number) => number> = {
  pa: (v) => v,
  hpa: (v) => v * 100,
  psi: (v) => v * 6894.76,
  bar: (v) => v * 100000,
  kpa: (v) => v * 1000,
  atm: (v) => v * 101325,
  mmhg: (v) => v * 133.322,
  inhg: (v) => v * 3386.39,
};

const fromPascal: Record<PressureUnit, (v: number) => number> = {
  pa: (v) => v,
  hpa: (v) => v / 100,
  psi: (v) => v / 6894.76,
  bar: (v) => v / 100000,
  kpa: (v) => v / 1000,
  atm: (v) => v / 101325,
  mmhg: (v) => v / 133.322,
  inhg: (v) => v / 3386.39,
};

export function convertPressure(
  value: number,
  from: PressureUnit,
  to: PressureUnit
): number {
  if (from === to) return value;
  const pascal = toPascal[from](value);
  return fromPascal[to](pascal);
}

const toPpm: Record<ConcentrationUnit, (v: number) => number> = {
  ppm: (v) => v,
  ppmv: (v) => v,
  ppb: (v) => v / 1000,
  ppbv: (v) => v / 1000,
  mg_m3: (v) => v * 24.45,
  ug_m3: (v) => v * 0.02445,
  percent: (v) => v * 10000,
};

const fromPpm: Record<ConcentrationUnit, (v: number) => number> = {
  ppm: (v) => v,
  ppmv: (v) => v,
  ppb: (v) => v * 1000,
  ppbv: (v) => v * 1000,
  mg_m3: (v) => v / 24.45,
  ug_m3: (v) => v / 0.02445,
  percent: (v) => v / 10000,
};

export function convertConcentration(
  value: number,
  from: ConcentrationUnit,
  to: ConcentrationUnit
): number {
  if (from === to) return value;
  const ppm = toPpm[from](value);
  return fromPpm[to](ppm);
}

const toPercentRh: Record<HumidityUnit, (v: number) => number> = {
  percent_rh: (v) => v,
  g_m3: (v) => v * 5.77,
};

const fromPercentRh: Record<HumidityUnit, (v: number) => number> = {
  percent_rh: (v) => v,
  g_m3: (v) => v / 5.77,
};

export function convertHumidity(
  value: number,
  from: HumidityUnit,
  to: HumidityUnit
): number {
  if (from === to) return value;
  const rh = toPercentRh[from](value);
  return fromPercentRh[to](rh);
}

const toMeters: Record<LengthUnit, (v: number) => number> = {
  mm: (v) => v / 1000,
  cm: (v) => v / 100,
  m: (v) => v,
  in: (v) => v * 0.0254,
  ft: (v) => v * 0.3048,
};

const fromMeters: Record<LengthUnit, (v: number) => number> = {
  mm: (v) => v * 1000,
  cm: (v) => v * 100,
  m: (v) => v,
  in: (v) => v / 0.0254,
  ft: (v) => v / 0.3048,
};

export function convertLength(
  value: number,
  from: LengthUnit,
  to: LengthUnit
): number {
  if (from === to) return value;
  const meters = toMeters[from](value);
  return fromMeters[to](meters);
}

const toMs: Record<SpeedUnit, (v: number) => number> = {
  m_s: (v) => v,
  km_h: (v) => v / 3.6,
  mph: (v) => v * 0.44704,
  knots: (v) => v * 0.514444,
};

const fromMs: Record<SpeedUnit, (v: number) => number> = {
  m_s: (v) => v,
  km_h: (v) => v * 3.6,
  mph: (v) => v / 0.44704,
  knots: (v) => v / 0.514444,
};

export function convertSpeed(
  value: number,
  from: SpeedUnit,
  to: SpeedUnit
): number {
  if (from === to) return value;
  const ms = toMs[from](value);
  return fromMs[to](ms);
}

type ConverterFn = (value: number, from: Unit, to: Unit) => number;

const convertersByCategory: Record<UnitCategory, ConverterFn> = {
  temperature: convertTemperature as ConverterFn,
  pressure: convertPressure as ConverterFn,
  concentration: convertConcentration as ConverterFn,
  humidity: convertHumidity as ConverterFn,
  length: convertLength as ConverterFn,
  speed: convertSpeed as ConverterFn,
};

export function convert(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;

  const fromInfo = UNIT_REGISTRY[from];
  const toInfo = UNIT_REGISTRY[to];

  if (fromInfo.category !== toInfo.category) {
    console.warn(
      `Cannot convert between incompatible units: ${from} (${fromInfo.category}) and ${to} (${toInfo.category})`
    );
    return value;
  }

  const converter = convertersByCategory[fromInfo.category];
  return converter(value, from, to);
}
