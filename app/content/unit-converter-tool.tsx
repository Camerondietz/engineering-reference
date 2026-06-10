"use client";

// app/content/unit-converter-tool.tsx
//
// Universal engineering unit converter covering length, mass, volume,
// temperature, pressure, force, energy, power, area, speed, torque,
// flow rate, angle, and frequency. Live-converts the input value into
// every other unit in the active category.

import { useEffect, useMemo, useState, type ReactNode } from "react";

// ============================================================
// Unit tables
// ============================================================

interface Unit {
  symbol: string;
  name: string;
  factor: number; // to base
}

interface Category {
  id: string;
  label: string;
  base: string; // base unit symbol
  units: Unit[];
  special?: "temperature";
}

const CATEGORIES: Category[] = [
  {
    id: "length",
    label: "Length",
    base: "m",
    units: [
      { symbol: "mm", name: "millimeter", factor: 1e-3 },
      { symbol: "cm", name: "centimeter", factor: 1e-2 },
      { symbol: "m",  name: "meter",      factor: 1 },
      { symbol: "km", name: "kilometer",  factor: 1e3 },
      { symbol: "in", name: "inch",       factor: 0.0254 },
      { symbol: "ft", name: "foot",       factor: 0.3048 },
      { symbol: "yd", name: "yard",       factor: 0.9144 },
      { symbol: "mi", name: "mile",       factor: 1609.344 },
      { symbol: "mil", name: "thou (mil)", factor: 0.0254e-3 },
      { symbol: "µm", name: "micron",     factor: 1e-6 },
      { symbol: "nm", name: "nanometer",  factor: 1e-9 },
    ],
  },
  {
    id: "mass",
    label: "Mass",
    base: "kg",
    units: [
      { symbol: "mg", name: "milligram", factor: 1e-6 },
      { symbol: "g",  name: "gram",      factor: 1e-3 },
      { symbol: "kg", name: "kilogram",  factor: 1 },
      { symbol: "t",  name: "metric ton", factor: 1e3 },
      { symbol: "oz", name: "ounce",     factor: 0.0283495 },
      { symbol: "lb", name: "pound",     factor: 0.453592 },
      { symbol: "ton(US)", name: "US (short) ton", factor: 907.18474 },
      { symbol: "ton(UK)", name: "UK (long) ton",  factor: 1016.0469 },
      { symbol: "grain", name: "grain",  factor: 6.479891e-5 },
    ],
  },
  {
    id: "volume",
    label: "Volume",
    base: "L",
    units: [
      { symbol: "mL",  name: "milliliter", factor: 1e-3 },
      { symbol: "L",   name: "liter", factor: 1 },
      { symbol: "m³",  name: "cubic meter", factor: 1000 },
      { symbol: "cm³", name: "cubic centimeter", factor: 1e-3 },
      { symbol: "in³", name: "cubic inch", factor: 0.0163871 },
      { symbol: "ft³", name: "cubic foot", factor: 28.3168 },
      { symbol: "gal(US)", name: "US gallon", factor: 3.78541 },
      { symbol: "gal(UK)", name: "Imperial gallon", factor: 4.54609 },
      { symbol: "qt(US)", name: "US quart", factor: 0.946353 },
      { symbol: "pt(US)", name: "US pint", factor: 0.473176 },
      { symbol: "fl oz(US)", name: "US fluid ounce", factor: 0.0295735 },
      { symbol: "bbl(oil)", name: "oil barrel", factor: 158.987 },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    base: "K",
    special: "temperature",
    units: [
      { symbol: "°C", name: "Celsius", factor: 1 },
      { symbol: "°F", name: "Fahrenheit", factor: 1 },
      { symbol: "K",  name: "Kelvin", factor: 1 },
      { symbol: "°R", name: "Rankine", factor: 1 },
    ],
  },
  {
    id: "pressure",
    label: "Pressure",
    base: "Pa",
    units: [
      { symbol: "Pa",   name: "pascal", factor: 1 },
      { symbol: "kPa",  name: "kilopascal", factor: 1e3 },
      { symbol: "MPa",  name: "megapascal", factor: 1e6 },
      { symbol: "bar",  name: "bar", factor: 1e5 },
      { symbol: "mbar", name: "millibar", factor: 100 },
      { symbol: "psi",  name: "pound-force / inch²", factor: 6894.757 },
      { symbol: "ksi",  name: "kip / inch²", factor: 6.894757e6 },
      { symbol: "atm",  name: "atmosphere", factor: 101325 },
      { symbol: "Torr", name: "torr / mmHg", factor: 133.322 },
      { symbol: "inHg", name: "inches of mercury", factor: 3386.39 },
      { symbol: "inH₂O", name: "inches of water", factor: 248.84 },
      { symbol: "mmH₂O", name: "mm of water", factor: 9.80665 },
      { symbol: "kgf/cm²", name: "kilogram-force / cm²", factor: 98066.5 },
    ],
  },
  {
    id: "force",
    label: "Force",
    base: "N",
    units: [
      { symbol: "N",   name: "newton", factor: 1 },
      { symbol: "kN",  name: "kilonewton", factor: 1e3 },
      { symbol: "MN",  name: "meganewton", factor: 1e6 },
      { symbol: "lbf", name: "pound-force", factor: 4.44822 },
      { symbol: "kip", name: "kip-force", factor: 4448.22 },
      { symbol: "kgf", name: "kilogram-force", factor: 9.80665 },
      { symbol: "ozf", name: "ounce-force", factor: 0.278014 },
      { symbol: "dyn", name: "dyne", factor: 1e-5 },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    base: "J",
    units: [
      { symbol: "J",    name: "joule", factor: 1 },
      { symbol: "kJ",   name: "kilojoule", factor: 1e3 },
      { symbol: "MJ",   name: "megajoule", factor: 1e6 },
      { symbol: "Wh",   name: "watt-hour", factor: 3600 },
      { symbol: "kWh",  name: "kilowatt-hour", factor: 3.6e6 },
      { symbol: "cal",  name: "calorie", factor: 4.184 },
      { symbol: "kcal", name: "kilocalorie", factor: 4184 },
      { symbol: "BTU",  name: "British thermal unit", factor: 1055.06 },
      { symbol: "ft·lbf", name: "foot-pound", factor: 1.35582 },
      { symbol: "eV",   name: "electronvolt", factor: 1.602176634e-19 },
    ],
  },
  {
    id: "power",
    label: "Power",
    base: "W",
    units: [
      { symbol: "W",       name: "watt", factor: 1 },
      { symbol: "kW",      name: "kilowatt", factor: 1e3 },
      { symbol: "MW",      name: "megawatt", factor: 1e6 },
      { symbol: "HP",      name: "horsepower (mechanical)", factor: 745.6999 },
      { symbol: "HP(metric)", name: "metric horsepower", factor: 735.49875 },
      { symbol: "BTU/hr",  name: "BTU per hour", factor: 0.293071 },
      { symbol: "ton(refrig)", name: "ton of refrigeration", factor: 3516.85 },
      { symbol: "ft·lbf/s", name: "foot-pound / second", factor: 1.35582 },
    ],
  },
  {
    id: "area",
    label: "Area",
    base: "m²",
    units: [
      { symbol: "mm²", name: "square millimeter", factor: 1e-6 },
      { symbol: "cm²", name: "square centimeter", factor: 1e-4 },
      { symbol: "m²",  name: "square meter", factor: 1 },
      { symbol: "km²", name: "square kilometer", factor: 1e6 },
      { symbol: "in²", name: "square inch", factor: 6.4516e-4 },
      { symbol: "ft²", name: "square foot", factor: 0.092903 },
      { symbol: "yd²", name: "square yard", factor: 0.836127 },
      { symbol: "acre", name: "acre", factor: 4046.86 },
      { symbol: "ha",  name: "hectare", factor: 1e4 },
    ],
  },
  {
    id: "speed",
    label: "Speed",
    base: "m/s",
    units: [
      { symbol: "m/s",   name: "meter / second", factor: 1 },
      { symbol: "km/h",  name: "kilometer / hour", factor: 1 / 3.6 },
      { symbol: "mph",   name: "mile / hour", factor: 0.44704 },
      { symbol: "ft/s",  name: "foot / second", factor: 0.3048 },
      { symbol: "ft/min", name: "foot / minute", factor: 0.3048 / 60 },
      { symbol: "in/min", name: "inch / minute", factor: 0.0254 / 60 },
      { symbol: "knot",  name: "knot", factor: 0.514444 },
      { symbol: "mm/s",  name: "millimeter / second", factor: 1e-3 },
    ],
  },
  {
    id: "torque",
    label: "Torque",
    base: "N·m",
    units: [
      { symbol: "N·m",   name: "newton-meter", factor: 1 },
      { symbol: "kN·m",  name: "kilonewton-meter", factor: 1e3 },
      { symbol: "N·cm",  name: "newton-centimeter", factor: 1e-2 },
      { symbol: "mN·m",  name: "millinewton-meter", factor: 1e-3 },
      { symbol: "lbf·ft", name: "pound-foot", factor: 1.35582 },
      { symbol: "lbf·in", name: "pound-inch", factor: 0.112985 },
      { symbol: "ozf·in", name: "ounce-inch", factor: 0.00706155 },
      { symbol: "kgf·m", name: "kilogram-force meter", factor: 9.80665 },
      { symbol: "kgf·cm", name: "kilogram-force centimeter", factor: 0.0980665 },
    ],
  },
  {
    id: "flow",
    label: "Flow rate (volume)",
    base: "L/s",
    units: [
      { symbol: "L/s",   name: "liter / second", factor: 1 },
      { symbol: "L/min", name: "liter / minute", factor: 1 / 60 },
      { symbol: "m³/h",  name: "cubic meter / hour", factor: 1000 / 3600 },
      { symbol: "m³/s",  name: "cubic meter / second", factor: 1000 },
      { symbol: "gpm(US)", name: "US gallon / minute", factor: 0.0630902 },
      { symbol: "gpm(UK)", name: "Imperial gallon / minute", factor: 0.0757682 },
      { symbol: "cfm",   name: "cubic foot / minute", factor: 0.471947 },
      { symbol: "ft³/s", name: "cubic foot / second", factor: 28.3168 },
      { symbol: "scfm",  name: "standard cfm (approx.)", factor: 0.471947 },
    ],
  },
  {
    id: "angle",
    label: "Angle",
    base: "rad",
    units: [
      { symbol: "rad",    name: "radian", factor: 1 },
      { symbol: "°",      name: "degree", factor: Math.PI / 180 },
      { symbol: "grad",   name: "gradian", factor: Math.PI / 200 },
      { symbol: "arcmin", name: "arcminute", factor: Math.PI / (180 * 60) },
      { symbol: "arcsec", name: "arcsecond", factor: Math.PI / (180 * 3600) },
      { symbol: "rev",    name: "revolution", factor: 2 * Math.PI },
      { symbol: "mrad",   name: "milliradian", factor: 1e-3 },
    ],
  },
  {
    id: "frequency",
    label: "Frequency / rotation",
    base: "Hz",
    units: [
      { symbol: "Hz",  name: "hertz", factor: 1 },
      { symbol: "kHz", name: "kilohertz", factor: 1e3 },
      { symbol: "MHz", name: "megahertz", factor: 1e6 },
      { symbol: "GHz", name: "gigahertz", factor: 1e9 },
      { symbol: "RPM", name: "revolutions / minute", factor: 1 / 60 },
      { symbol: "RPS", name: "revolutions / second", factor: 1 },
      { symbol: "rad/s", name: "radians / second", factor: 1 / (2 * Math.PI) },
    ],
  },
];

// Temperature special conversion (to/from Kelvin base)
function toKelvin(value: number, unit: string): number {
  switch (unit) {
    case "°C": return value + 273.15;
    case "°F": return (value - 32) * 5 / 9 + 273.15;
    case "K":  return value;
    case "°R": return value * 5 / 9;
  }
  return NaN;
}
function fromKelvin(k: number, unit: string): number {
  switch (unit) {
    case "°C": return k - 273.15;
    case "°F": return (k - 273.15) * 9 / 5 + 32;
    case "K":  return k;
    case "°R": return k * 9 / 5;
  }
  return NaN;
}

function convert(category: Category, value: number, from: string, to: string): number {
  if (category.special === "temperature") {
    return fromKelvin(toKelvin(value, from), to);
  }
  const f = category.units.find((u) => u.symbol === from)?.factor ?? 1;
  const t = category.units.find((u) => u.symbol === to)?.factor ?? 1;
  return (value * f) / t;
}

function formatNum(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs === 0) return "0";
  if (abs >= 1e15 || abs < 1e-6) return n.toExponential(6);
  const digits = abs >= 100 ? 4 : abs >= 1 ? 6 : 8;
  return Number(n.toPrecision(digits)).toString();
}

// ============================================================
// Page
// ============================================================

const STORAGE_KEY = "engref:unit-converter:v1";

export default function UnitConverterToolPage() {
  const [catId, setCatId] = useState<string>("length");
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("ft");
  const [fromValue, setFromValue] = useState<number>(1);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.catId) setCatId(s.catId);
        if (s.fromUnit) setFromUnit(s.fromUnit);
        if (s.toUnit) setToUnit(s.toUnit);
        if (typeof s.fromValue === "number") setFromValue(s.fromValue);
      }
    } catch { /* */ }
  }, []);
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ catId, fromUnit, toUnit, fromValue }),
      );
    } catch { /* */ }
  }, [catId, fromUnit, toUnit, fromValue, mounted]);

  const category = CATEGORIES.find((c) => c.id === catId)!;

  // When category changes, snap units to valid ones.
  useEffect(() => {
    if (!category.units.find((u) => u.symbol === fromUnit)) {
      setFromUnit(category.base);
    }
    if (!category.units.find((u) => u.symbol === toUnit)) {
      const alt = category.units.find((u) => u.symbol !== category.base);
      setToUnit(alt?.symbol ?? category.base);
    }
  }, [catId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toValue = convert(category, fromValue, fromUnit, toUnit);

  const allConversions = useMemo(
    () => category.units.map((u) => ({
      unit: u,
      value: convert(category, fromValue, fromUnit, u.symbol),
    })),
    [category, fromValue, fromUnit],
  );

  function swap() {
    const f = fromUnit;
    setFromUnit(toUnit);
    setToUnit(f);
    setFromValue(toValue);
  }

  function copy(t: string) {
    try { navigator.clipboard?.writeText(t); } catch { /* */ }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Unit Converter
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Engineering units across length, mass, volume, temperature,
          pressure, force, energy, power, area, speed, torque, flow,
          angle, and frequency — with a live read-out of every unit in
          the active category.
        </p>
      </header>

      {/* Category tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCatId(c.id)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold transition " +
              (c.id === catId
                ? "bg-eng-navy text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200")
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* From / To */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                From
              </span>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={fromValue}
                  onChange={(e) => setFromValue(Number(e.target.value) || 0)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm focus:border-eng-navy focus:outline-none"
                >
                  {category.units.map((u) => (
                    <option key={u.symbol} value={u.symbol}>
                      {u.symbol} — {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <button
            type="button"
            onClick={swap}
            className="rounded-full bg-eng-navy/10 px-4 py-2 text-sm font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
            title="Swap from / to"
          >
            ⇄
          </button>

          <div>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                To
              </span>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={formatNum(toValue)}
                  className="flex-1 rounded-lg border border-gray-300 bg-eng-navy/5 px-3 py-2 font-mono text-sm font-semibold text-eng-navy shadow-sm focus:outline-none"
                />
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm focus:border-eng-navy focus:outline-none"
                >
                  {category.units.map((u) => (
                    <option key={u.symbol} value={u.symbol}>
                      {u.symbol} — {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* All conversions */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            All {category.label.toLowerCase()} units
          </h2>
          <p className="text-xs text-gray-500">
            {formatNum(fromValue)} {fromUnit} =
          </p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {allConversions.map(({ unit, value }) => (
            <div
              key={unit.symbol}
              className={
                "flex items-center justify-between gap-3 rounded-xl border px-3 py-2 " +
                (unit.symbol === toUnit
                  ? "border-eng-navy bg-eng-navy/5"
                  : "border-gray-200 bg-white hover:border-eng-navy/40")
              }
            >
              <div className="min-w-0">
                <div className="font-mono text-sm font-semibold text-gray-900">
                  {formatNum(value)}{" "}
                  <span className="font-sans text-xs font-normal text-gray-500">
                    {unit.symbol}
                  </span>
                </div>
                <div className="truncate text-[11px] text-gray-500">{unit.name}</div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => copy(formatNum(value))}
                  className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600 hover:bg-eng-navy/10 hover:text-eng-navy"
                  title="Copy value"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => { setFromValue(value); setFromUnit(unit.symbol); }}
                  className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600 hover:bg-eng-navy/10 hover:text-eng-navy"
                  title="Use as source"
                >
                  Use
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
