"use client";

// app/content/resistor-calculator.tsx
//
// All-in-one resistor toolkit: 4/5/6-band color code (decode + encode),
// SMD code decoder (3-digit, 4-digit, EIA-96, R-notation), series /
// parallel combiner, voltage divider, Ohm's law + power, LED current
// limiter, and nearest standard E-series value finder.

import { useEffect, useMemo, useState, type ReactNode } from "react";

// ============================================================
// Color palettes
// ============================================================

const DIGIT_COLORS = [
  { name: "Black",  hex: "#1a1a1a", text: "#fff" },
  { name: "Brown",  hex: "#7a4a25", text: "#fff" },
  { name: "Red",    hex: "#c83a1e", text: "#fff" },
  { name: "Orange", hex: "#ed7c2c", text: "#000" },
  { name: "Yellow", hex: "#e9c732", text: "#000" },
  { name: "Green",  hex: "#2c7a3d", text: "#fff" },
  { name: "Blue",   hex: "#1f4faa", text: "#fff" },
  { name: "Violet", hex: "#7a3aa8", text: "#fff" },
  { name: "Gray",   hex: "#7a7a7a", text: "#fff" },
  { name: "White",  hex: "#f5f5f5", text: "#000" },
];

const MULTIPLIER_COLORS = [
  { name: "Silver", hex: "#c0c0c0", text: "#000", value: 0.01 },
  { name: "Gold",   hex: "#caa75a", text: "#000", value: 0.1 },
  { name: "Black",  hex: "#1a1a1a", text: "#fff", value: 1 },
  { name: "Brown",  hex: "#7a4a25", text: "#fff", value: 10 },
  { name: "Red",    hex: "#c83a1e", text: "#fff", value: 100 },
  { name: "Orange", hex: "#ed7c2c", text: "#000", value: 1e3 },
  { name: "Yellow", hex: "#e9c732", text: "#000", value: 1e4 },
  { name: "Green",  hex: "#2c7a3d", text: "#fff", value: 1e5 },
  { name: "Blue",   hex: "#1f4faa", text: "#fff", value: 1e6 },
  { name: "Violet", hex: "#7a3aa8", text: "#fff", value: 1e7 },
  { name: "Gray",   hex: "#7a7a7a", text: "#fff", value: 1e8 },
  { name: "White",  hex: "#f5f5f5", text: "#000", value: 1e9 },
];

const TOLERANCE_COLORS = [
  { name: "Brown",  hex: "#7a4a25", text: "#fff", value: 1 },
  { name: "Red",    hex: "#c83a1e", text: "#fff", value: 2 },
  { name: "Green",  hex: "#2c7a3d", text: "#fff", value: 0.5 },
  { name: "Blue",   hex: "#1f4faa", text: "#fff", value: 0.25 },
  { name: "Violet", hex: "#7a3aa8", text: "#fff", value: 0.1 },
  { name: "Gray",   hex: "#7a7a7a", text: "#fff", value: 0.05 },
  { name: "Gold",   hex: "#caa75a", text: "#000", value: 5 },
  { name: "Silver", hex: "#c0c0c0", text: "#000", value: 10 },
];

const TC_COLORS = [
  { name: "Brown",  hex: "#7a4a25", text: "#fff", value: 100 },
  { name: "Red",    hex: "#c83a1e", text: "#fff", value: 50 },
  { name: "Orange", hex: "#ed7c2c", text: "#000", value: 15 },
  { name: "Yellow", hex: "#e9c732", text: "#000", value: 25 },
  { name: "Blue",   hex: "#1f4faa", text: "#fff", value: 10 },
  { name: "Violet", hex: "#7a3aa8", text: "#fff", value: 5 },
];

// Multiplier index (0..11) → exponent
function multIndexExp(i: number): number { return i - 2; } // silver=-2, gold=-1, black=0, ...
function expToMultIndex(e: number): number { return e + 2; }

// ============================================================
// E-series values
// ============================================================

const E_SERIES = {
  E6:  [10, 15, 22, 33, 47, 68],
  E12: [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82],
  E24: [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91],
  E48: [
    100,105,110,115,121,127,133,140,147,154,162,169,178,187,196,205,
    215,226,237,249,261,274,287,301,316,332,348,365,383,402,422,442,
    464,487,511,536,562,590,619,649,681,715,750,787,825,866,909,953,
  ],
  E96: [
    100,102,105,107,110,113,115,118,121,124,127,130,133,137,140,143,
    147,150,154,158,162,165,169,174,178,182,187,191,196,200,205,210,
    215,221,226,232,237,243,249,255,261,267,274,280,287,294,301,309,
    316,324,332,340,348,357,365,374,383,392,402,412,422,432,442,453,
    464,475,487,499,511,523,536,549,562,576,590,604,619,634,649,665,
    681,698,715,732,750,768,787,806,825,845,866,887,909,931,953,976,
  ],
} as const;

type ESeries = keyof typeof E_SERIES;

function nearestStandard(target: number, series: ESeries): number {
  if (!isFinite(target) || target <= 0) return NaN;
  const values = E_SERIES[series];
  const exp = Math.floor(Math.log10(target));
  // Series values are 100-999 for E48/E96, 10-99 for E6/E12/E24.
  const seriesBase = series === "E48" || series === "E96" ? 100 : 10;
  const seriesExp = Math.log10(seriesBase);
  const decadeFactor = Math.pow(10, exp - seriesExp);
  let best = NaN;
  let bestErr = Infinity;
  for (const v of values) {
    for (const k of [decadeFactor / 10, decadeFactor, decadeFactor * 10]) {
      const candidate = v * k;
      const err = Math.abs(candidate - target);
      if (err < bestErr) { bestErr = err; best = candidate; }
    }
  }
  return best;
}

// ============================================================
// Format / parse resistance
// ============================================================

function formatResistance(r: number): string {
  if (!isFinite(r) || r === 0) return "0 Ω";
  const sign = r < 0 ? "-" : "";
  const abs = Math.abs(r);
  const fmt = (n: number) => {
    if (n >= 100) return n.toFixed(0);
    if (n >= 10) return n.toFixed(1);
    return n.toFixed(2);
  };
  if (abs >= 1e9) return `${sign}${fmt(abs / 1e9)} GΩ`;
  if (abs >= 1e6) return `${sign}${fmt(abs / 1e6)} MΩ`;
  if (abs >= 1e3) return `${sign}${fmt(abs / 1e3)} kΩ`;
  if (abs >= 1) return `${sign}${fmt(abs)} Ω`;
  if (abs >= 0.001) return `${sign}${fmt(abs * 1000)} mΩ`;
  return `${sign}${(abs * 1e6).toFixed(2)} µΩ`;
}

function parseResistance(s: string): number {
  if (!s) return NaN;
  const t = s.trim().replace(/Ω|ohms?/gi, "").trim();
  if (!t) return NaN;
  // Engineering R-notation: 4R7 = 4.7, R47 = 0.47, 4k7 = 4700, 1M5 = 1.5M
  const r = t.match(/^(\d*)([RrKkMmGg])(\d+)$/);
  if (r) {
    const intPart = r[1] === "" ? 0 : Number(r[1]);
    const sfx = r[2].toUpperCase();
    const frac = Number(`0.${r[3]}`);
    const mul = sfx === "R" ? 1 : sfx === "K" ? 1e3 : sfx === "M" ? 1e6 : 1e9;
    return (intPart + frac) * mul;
  }
  const m = t.match(/^(-?\d*\.?\d+)\s*([kKMG]|µ|u|m)?$/);
  if (!m) {
    const n = Number(t);
    return isFinite(n) ? n : NaN;
  }
  const num = Number(m[1]);
  const sfx = m[2];
  let mul = 1;
  if (sfx === "k" || sfx === "K") mul = 1e3;
  else if (sfx === "M") mul = 1e6;
  else if (sfx === "G") mul = 1e9;
  else if (sfx === "m") mul = 1e-3;
  else if (sfx === "u" || sfx === "µ") mul = 1e-6;
  return num * mul;
}

// ============================================================
// Color-code encode (resistance → digit/mult choices)
// ============================================================

function encodeBands(r: number, sigDigits: 2 | 3): { digits: number[]; multIdx: number } | null {
  if (!isFinite(r) || r <= 0) return null;
  const lo = Math.pow(10, sigDigits - 1);
  const hi = Math.pow(10, sigDigits);
  let exp = Math.floor(Math.log10(r)) - (sigDigits - 1);
  let val = Math.round(r / Math.pow(10, exp));
  // Edge: rounding pushed us over.
  if (val >= hi) { val = Math.round(val / 10); exp++; }
  if (val < lo) { val = Math.round(val * 10); exp--; }
  if (val < lo || val >= hi) return null;
  const multIdx = expToMultIndex(exp);
  if (multIdx < 0 || multIdx >= MULTIPLIER_COLORS.length) return null;
  const digits: number[] = [];
  let v = val;
  for (let i = sigDigits - 1; i >= 0; i--) {
    const div = Math.pow(10, i);
    const d = Math.floor(v / div);
    digits.push(d);
    v -= d * div;
  }
  return { digits, multIdx };
}

function decodeBands(digits: number[], multIdx: number): number {
  const num = digits.reduce((acc, d) => acc * 10 + d, 0);
  return num * MULTIPLIER_COLORS[multIdx].value;
}

// ============================================================
// SMD decoder
// ============================================================

const EIA96_VALUES = E_SERIES.E96;
const EIA96_MULTIPLIERS: Record<string, number> = {
  Z: 0.001, Y: 0.01, R: 0.01, X: 0.1, S: 0.1,
  A: 1, B: 10, H: 10, C: 100, D: 1000, E: 10000, F: 100000,
};

interface SmdResult {
  type: string;
  ohms: number;
  note?: string;
}

function decodeSmd(input: string): SmdResult | null {
  const s = input.trim().toUpperCase();
  if (!s) return null;

  // R-notation: 4R7, R47, 4M7, etc.
  const rNote = s.match(/^(\d*)([RKMG])(\d+)$/);
  if (rNote) {
    const i = rNote[1] === "" ? 0 : Number(rNote[1]);
    const sfx = rNote[2];
    const f = Number(`0.${rNote[3]}`);
    const mul = sfx === "R" ? 1 : sfx === "K" ? 1e3 : sfx === "M" ? 1e6 : 1e9;
    return { type: "R-notation", ohms: (i + f) * mul, note: "Decimal-point form" };
  }

  // EIA-96 (1%): two digits + letter
  const eia = s.match(/^(\d{2})([A-Z])$/);
  if (eia) {
    const idx = Number(eia[1]) - 1;
    const letter = eia[2];
    const sig = EIA96_VALUES[idx];
    const mul = EIA96_MULTIPLIERS[letter];
    if (sig !== undefined && mul !== undefined) {
      return {
        type: "EIA-96 (1%)",
        ohms: sig * mul,
        note: `Significant ${sig} × ${mul} (${letter})`,
      };
    }
  }

  // Plain 3-digit: XYZ → XY × 10^Z
  if (/^\d{3}$/.test(s)) {
    const sig = Number(s.slice(0, 2));
    const exp = Number(s.slice(2));
    return { type: "3-digit (5%)", ohms: sig * Math.pow(10, exp) };
  }

  // 4-digit: WXYZ → WXY × 10^Z (1%)
  if (/^\d{4}$/.test(s)) {
    const sig = Number(s.slice(0, 3));
    const exp = Number(s.slice(3));
    return { type: "4-digit (1%)", ohms: sig * Math.pow(10, exp) };
  }

  return null;
}

// ============================================================
// Page
// ============================================================

const uid = () => Math.random().toString(36).slice(2, 9);

export default function ResistorCalculatorPage() {
  // ----------- color code -----------
  const [bandCount, setBandCount] = useState<4 | 5 | 6>(4);
  const [digits, setDigits] = useState<number[]>([1, 0]); // 4-band: brown, black
  const [multIdx, setMultIdx] = useState<number>(expToMultIndex(2)); // ×100
  const [tolIdx, setTolIdx] = useState<number>(6); // gold, 5%
  const [tcIdx, setTcIdx] = useState<number>(0);
  const [valueDraft, setValueDraft] = useState<string>("");
  const [valueFocused, setValueFocused] = useState(false);

  const sigCount = bandCount === 4 ? 2 : 3;

  // Adjust digits length when bandCount changes.
  useEffect(() => {
    setDigits((d) => {
      if (sigCount === d.length) return d;
      if (sigCount > d.length) return [...d, 0];
      return d.slice(0, sigCount);
    });
  }, [sigCount]);

  const ohms = useMemo(() => decodeBands(digits, multIdx), [digits, multIdx]);
  const tolerance = TOLERANCE_COLORS[tolIdx]?.value ?? 5;
  const tcPpm = bandCount === 6 ? TC_COLORS[tcIdx]?.value : undefined;
  const tolMin = ohms * (1 - tolerance / 100);
  const tolMax = ohms * (1 + tolerance / 100);

  useEffect(() => {
    if (!valueFocused) setValueDraft(formatResistance(ohms));
  }, [ohms, valueFocused]);

  function onValueInput(v: string) {
    setValueDraft(v);
    const parsed = parseResistance(v);
    if (!isFinite(parsed)) return;
    const enc = encodeBands(parsed, sigCount as 2 | 3);
    if (!enc) return;
    setDigits(enc.digits);
    setMultIdx(enc.multIdx);
  }

  function setDigit(i: number, d: number) {
    setDigits((arr) => arr.map((v, idx) => (idx === i ? d : v)));
  }

  // ----------- SMD -----------
  const [smdInput, setSmdInput] = useState("473");
  const smdResult = useMemo(() => decodeSmd(smdInput), [smdInput]);

  // ----------- series / parallel -----------
  const [comboParts, setComboParts] = useState<{ id: string; value: string }[]>([
    { id: uid(), value: "1k" },
    { id: uid(), value: "2.2k" },
    { id: uid(), value: "4.7k" },
  ]);
  const comboVals = useMemo(
    () => comboParts.map((p) => parseResistance(p.value)).filter((v) => isFinite(v) && v > 0),
    [comboParts],
  );
  const series = comboVals.reduce((a, b) => a + b, 0);
  const parallel = comboVals.length > 0
    ? 1 / comboVals.reduce((a, b) => a + 1 / b, 0)
    : NaN;

  // ----------- voltage divider -----------
  const [vd, setVd] = useState({ vin: 12, r1: 10000, r2: 3300 });
  const vdVout = (vd.vin * vd.r2) / (vd.r1 + vd.r2);
  const vdCurrent = vd.vin / (vd.r1 + vd.r2);
  const vdP1 = vdCurrent * vdCurrent * vd.r1;
  const vdP2 = vdCurrent * vdCurrent * vd.r2;

  // ----------- Ohm's law -----------
  type Pair = "VI" | "VR" | "VP" | "IR" | "IP" | "RP";
  const [ohmPair, setOhmPair] = useState<Pair>("VR");
  const [ohmV, setOhmV] = useState(5);
  const [ohmI, setOhmI] = useState(0.005);
  const [ohmR, setOhmR] = useState(1000);
  const [ohmP, setOhmP] = useState(0.025);
  const ohmComputed = useMemo(() => {
    let V = ohmV, I = ohmI, R = ohmR, P = ohmP;
    switch (ohmPair) {
      case "VI": R = V / I; P = V * I; break;
      case "VR": I = V / R; P = (V * V) / R; break;
      case "VP": I = P / V; R = (V * V) / P; break;
      case "IR": V = I * R; P = I * I * R; break;
      case "IP": V = P / I; R = P / (I * I); break;
      case "RP": I = Math.sqrt(P / R); V = Math.sqrt(P * R); break;
    }
    return { V, I, R, P };
  }, [ohmPair, ohmV, ohmI, ohmR, ohmP]);

  // ----------- LED resistor -----------
  const [led, setLed] = useState({ vSupply: 5, vForward: 2.0, iForward: 0.02 });
  const ledHeadroom = led.vSupply - led.vForward;
  const ledR = ledHeadroom > 0 ? ledHeadroom / led.iForward : NaN;
  const ledP = isFinite(ledR) ? ledHeadroom * led.iForward : NaN;
  const ledRecommended = useMemo(() => {
    if (!isFinite(ledR)) return null;
    const e24 = nearestStandard(ledR, "E24");
    const e96 = nearestStandard(ledR, "E96");
    return { e24, e96 };
  }, [ledR]);

  // ----------- standard value finder -----------
  const [stdInput, setStdInput] = useState("3140");
  const stdParsed = parseResistance(stdInput);
  const stdResults = useMemo(() => {
    if (!isFinite(stdParsed) || stdParsed <= 0) return null;
    return (["E6", "E12", "E24", "E48", "E96"] as ESeries[]).map((series) => {
      const v = nearestStandard(stdParsed, series);
      const err = ((v - stdParsed) / stdParsed) * 100;
      return { series, value: v, errPct: err };
    });
  }, [stdParsed]);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Resistor Calculator
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Color codes (4/5/6 band, decode and encode), SMD codes,
          series/parallel combinations, voltage divider, Ohm&rsquo;s law &amp;
          power, LED current limiting, and nearest E-series value.
        </p>
      </header>

      {/* ====================================================
          COLOR CODE
          ==================================================== */}
      <Card title="Color code (4 / 5 / 6 band)">
        <div className="mb-3 flex flex-wrap gap-2">
          {([4, 5, 6] as const).map((n) => (
            <Seg key={n} active={bandCount === n} onClick={() => setBandCount(n)}>
              {n}-band
            </Seg>
          ))}
        </div>

        <ResistorSVG
          bandCount={bandCount}
          digits={digits}
          multIdx={multIdx}
          tolIdx={tolIdx}
          tcIdx={tcIdx}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {digits.map((d, i) => (
            <BandSelect
              key={`d${i}`}
              label={`Band ${i + 1} (digit ${i + 1})`}
              options={DIGIT_COLORS.map((c, idx) => ({
                value: idx,
                label: `${c.name} — ${idx}`,
                hex: c.hex,
              }))}
              value={d}
              onChange={(v) => setDigit(i, v)}
            />
          ))}
          <BandSelect
            label={`Band ${digits.length + 1} (multiplier)`}
            options={MULTIPLIER_COLORS.map((c, idx) => ({
              value: idx,
              label: `${c.name} — ×${formatMultiplier(c.value)}`,
              hex: c.hex,
            }))}
            value={multIdx}
            onChange={setMultIdx}
          />
          <BandSelect
            label={`Band ${digits.length + 2} (tolerance)`}
            options={TOLERANCE_COLORS.map((c, idx) => ({
              value: idx,
              label: `${c.name} — ±${c.value}%`,
              hex: c.hex,
            }))}
            value={tolIdx}
            onChange={setTolIdx}
          />
          {bandCount === 6 && (
            <BandSelect
              label="Band 6 (temp coeff)"
              options={TC_COLORS.map((c, idx) => ({
                value: idx,
                label: `${c.name} — ${c.value} ppm/°C`,
                hex: c.hex,
              }))}
              value={tcIdx}
              onChange={setTcIdx}
            />
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Resistance
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold text-eng-navy">
              {formatResistance(ohms)}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              ±{tolerance}% → {formatResistance(tolMin)} … {formatResistance(tolMax)}
            </p>
            {tcPpm !== undefined && (
              <p className="mt-1 text-sm text-gray-600">
                Temp coefficient: {tcPpm} ppm/°C
              </p>
            )}
          </div>
          <div>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Type a value to set the bands
              </span>
              <input
                value={valueDraft}
                onChange={(e) => onValueInput(e.target.value)}
                onFocus={() => setValueFocused(true)}
                onBlur={() => { setValueFocused(false); setValueDraft(formatResistance(ohms)); }}
                placeholder="e.g. 4.7k, 470, 1M, 2k2, R47"
                className={inputCls + " mt-1 font-mono"}
              />
            </label>
            <p className="mt-2 text-[11px] text-gray-500">
              Accepts engineering shorthand: <code>4k7</code>, <code>2M2</code>,{" "}
              <code>R47</code>. Switch band count above to gain/lose a
              significant digit.
            </p>
          </div>
        </div>
      </Card>

      {/* ====================================================
          SMD
          ==================================================== */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="SMD code decoder">
          <p className="mb-3 text-sm text-gray-500">
            3-digit and 4-digit codes, EIA-96 (1%) two-digits + letter, and
            R-notation (<code>4R7</code>, <code>R47</code>, <code>4M7</code>).
          </p>
          <input
            value={smdInput}
            onChange={(e) => setSmdInput(e.target.value)}
            placeholder="473, 4702, 01A, 4R7…"
            className={inputCls + " font-mono text-lg uppercase tracking-widest"}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {["473", "4702", "01A", "01C", "01Y", "4R7", "R47", "1M0"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSmdInput(s)}
                className="rounded-full bg-gray-100 px-3 py-1 font-mono text-xs text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            {smdResult ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {smdResult.type}
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold text-eng-navy">
                  {formatResistance(smdResult.ohms)}
                </p>
                {smdResult.note && (
                  <p className="mt-1 text-xs text-gray-500">{smdResult.note}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Not a recognized SMD code.</p>
            )}
          </div>

          <details className="mt-3 rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-600">
            <summary className="cursor-pointer font-semibold text-gray-700">
              EIA-96 multiplier letters
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-[11px]">
              {Object.entries(EIA96_MULTIPLIERS).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span>×{formatMultiplier(v)}</span>
                </div>
              ))}
            </div>
          </details>
        </Card>

        {/* ====================================================
            STANDARD VALUE FINDER
            ==================================================== */}
        <Card title="Nearest E-series value">
          <p className="mb-3 text-sm text-gray-500">
            Snap any target resistance to the closest stocked standard.
          </p>
          <input
            value={stdInput}
            onChange={(e) => setStdInput(e.target.value)}
            placeholder="3140, 47k, 1M5…"
            className={inputCls + " font-mono"}
          />
          {stdResults && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-2 py-2">Series</th>
                    <th className="px-2 py-2 text-right">Nearest</th>
                    <th className="px-2 py-2 text-right">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {stdResults.map((r) => {
                    const tone =
                      Math.abs(r.errPct) < 0.5
                        ? "text-emerald-700"
                        : Math.abs(r.errPct) < 2
                          ? "text-gray-700"
                          : Math.abs(r.errPct) < 5
                            ? "text-eng-rust"
                            : "text-eng-rust font-semibold";
                    return (
                      <tr key={r.series} className="border-t border-gray-100">
                        <td className="px-2 py-1.5 font-semibold text-gray-700">{r.series}</td>
                        <td className="px-2 py-1.5 text-right font-mono">
                          {formatResistance(r.value)}
                        </td>
                        <td className={"px-2 py-1.5 text-right font-mono " + tone}>
                          {r.errPct > 0 ? "+" : ""}{r.errPct.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ====================================================
          SERIES / PARALLEL
          ==================================================== */}
      <div className="mt-6">
        <Card title="Series / parallel combinations">
          <p className="mb-3 text-sm text-gray-500">
            Add any number of resistors. Series sum and parallel equivalent
            both compute live. Accepts engineering notation.
          </p>
          <div className="grid gap-2">
            {comboParts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-right font-mono text-xs text-gray-400">
                  R{i + 1}
                </span>
                <input
                  className={inputCls + " font-mono"}
                  value={p.value}
                  onChange={(e) =>
                    setComboParts((arr) =>
                      arr.map((x) => (x.id === p.id ? { ...x, value: e.target.value } : x)),
                    )
                  }
                />
                <span className="w-28 shrink-0 text-right font-mono text-xs text-gray-500">
                  {isFinite(parseResistance(p.value)) ? formatResistance(parseResistance(p.value)) : "—"}
                </span>
                <button
                  type="button"
                  onClick={() => setComboParts((arr) => arr.filter((x) => x.id !== p.id))}
                  className="text-gray-400 hover:text-eng-rust"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setComboParts((arr) => [...arr, { id: uid(), value: "" }])}
            className="mt-3 rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-eng-navy hover:text-eng-navy"
          >
            + Add resistor
          </button>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Stat label="Series total" value={formatResistance(series)} sub="R₁ + R₂ + … + Rₙ" />
            <Stat
              label="Parallel total"
              value={comboVals.length > 0 ? formatResistance(parallel) : "—"}
              sub="1 / (1/R₁ + 1/R₂ + … + 1/Rₙ)"
              highlight
            />
          </div>
        </Card>
      </div>

      {/* ====================================================
          VOLTAGE DIVIDER
          ==================================================== */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Voltage divider">
          <p className="mb-3 text-sm text-gray-500">
            Vout = Vin × R₂ / (R₁ + R₂). Power values assume no load on Vout.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <NumField label="Vin (V)" value={vd.vin} step="0.1" onChange={(v) => setVd({ ...vd, vin: v })} />
            <NumField label="R₁ (Ω)" value={vd.r1} step="100" onChange={(v) => setVd({ ...vd, r1: v })} />
            <NumField label="R₂ (Ω)" value={vd.r2} step="100" onChange={(v) => setVd({ ...vd, r2: v })} />
          </div>
          <div className="mt-4 grid gap-2 rounded-xl bg-gray-50 p-4 text-sm">
            <Row label="Vout">
              <Mono>{isFinite(vdVout) ? `${vdVout.toFixed(3)} V` : "—"}</Mono>
            </Row>
            <Row label="Current">
              <Mono>{isFinite(vdCurrent) ? formatCurrent(vdCurrent) : "—"}</Mono>
            </Row>
            <Row label="P in R₁">
              <Mono>{isFinite(vdP1) ? formatPower(vdP1) : "—"}</Mono>
            </Row>
            <Row label="P in R₂">
              <Mono>{isFinite(vdP2) ? formatPower(vdP2) : "—"}</Mono>
            </Row>
          </div>
        </Card>

        {/* ====================================================
            LED RESISTOR
            ==================================================== */}
        <Card title="LED current limiting resistor">
          <div className="grid gap-3 sm:grid-cols-3">
            <NumField label="V supply (V)" value={led.vSupply} step="0.1" onChange={(v) => setLed({ ...led, vSupply: v })} />
            <NumField label="V forward (V)" value={led.vForward} step="0.1" onChange={(v) => setLed({ ...led, vForward: v })} />
            <NumField label="I forward (A)" value={led.iForward} step="0.001" onChange={(v) => setLed({ ...led, iForward: v })} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {[
              { l: "Red 2.0 V / 20 mA", vf: 2.0, i: 0.02 },
              { l: "Green 2.2 V / 20 mA", vf: 2.2, i: 0.02 },
              { l: "Blue 3.2 V / 20 mA", vf: 3.2, i: 0.02 },
              { l: "White 3.3 V / 20 mA", vf: 3.3, i: 0.02 },
              { l: "IR 1.2 V / 30 mA", vf: 1.2, i: 0.03 },
            ].map((p) => (
              <button
                key={p.l}
                type="button"
                onClick={() => setLed({ ...led, vForward: p.vf, iForward: p.i })}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
              >
                {p.l}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-2 rounded-xl bg-gray-50 p-4 text-sm">
            {ledHeadroom <= 0 ? (
              <p className="text-eng-rust">
                Supply voltage must exceed forward voltage.
              </p>
            ) : (
              <>
                <Row label="Required R">
                  <Mono>{isFinite(ledR) ? formatResistance(ledR) : "—"}</Mono>
                </Row>
                <Row label="Power dissipated">
                  <Mono>{isFinite(ledP) ? formatPower(ledP) : "—"}</Mono>
                </Row>
                <Row label="Recommended wattage">
                  <Mono>{isFinite(ledP) ? recommendWattage(ledP) : "—"}</Mono>
                </Row>
                {ledRecommended && (
                  <>
                    <Row label="Nearest E24 (5%)">
                      <Mono>{formatResistance(ledRecommended.e24)}</Mono>
                    </Row>
                    <Row label="Nearest E96 (1%)">
                      <Mono>{formatResistance(ledRecommended.e96)}</Mono>
                    </Row>
                  </>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      {/* ====================================================
          OHM'S LAW
          ==================================================== */}
      <div className="mt-6">
        <Card title="Ohm's law + power">
          <p className="mb-3 text-sm text-gray-500">
            Pick which two values you know — the other two are derived.
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {([
              ["VI", "Know V & I"],
              ["VR", "Know V & R"],
              ["VP", "Know V & P"],
              ["IR", "Know I & R"],
              ["IP", "Know I & P"],
              ["RP", "Know R & P"],
            ] as [Pair, string][]).map(([k, l]) => (
              <Seg key={k} active={ohmPair === k} onClick={() => setOhmPair(k)}>
                {l}
              </Seg>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <OhmField
              label="Voltage (V)"
              editable={ohmPair.includes("V")}
              value={ohmComputed.V}
              onChange={setOhmV}
            />
            <OhmField
              label="Current (A)"
              editable={ohmPair.includes("I")}
              value={ohmComputed.I}
              onChange={setOhmI}
              fmt={(v) => isFinite(v) ? v.toExponential(3) : ""}
            />
            <OhmField
              label="Resistance (Ω)"
              editable={ohmPair.includes("R")}
              value={ohmComputed.R}
              onChange={setOhmR}
            />
            <OhmField
              label="Power (W)"
              editable={ohmPair.includes("P")}
              value={ohmComputed.P}
              onChange={setOhmP}
              fmt={(v) => isFinite(v) ? v.toExponential(3) : ""}
            />
          </div>
          <div className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-4">
            <Row label="V">
              <Mono>{isFinite(ohmComputed.V) ? `${ohmComputed.V.toFixed(4)} V` : "—"}</Mono>
            </Row>
            <Row label="I">
              <Mono>{isFinite(ohmComputed.I) ? formatCurrent(ohmComputed.I) : "—"}</Mono>
            </Row>
            <Row label="R">
              <Mono>{isFinite(ohmComputed.R) ? formatResistance(ohmComputed.R) : "—"}</Mono>
            </Row>
            <Row label="P">
              <Mono>{isFinite(ohmComputed.P) ? formatPower(ohmComputed.P) : "—"}</Mono>
            </Row>
          </div>
          {isFinite(ohmComputed.P) && (
            <p className="mt-2 text-xs text-gray-500">
              Recommended resistor wattage: <strong className="text-eng-navy">{recommendWattage(ohmComputed.P)}</strong>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Seg({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
        (active
          ? "bg-eng-navy text-white shadow-sm"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200")
      }
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-gray-900">{children}</span>;
}

function Stat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl p-4 " +
        (highlight ? "bg-eng-navy text-white" : "bg-gray-50 text-gray-700")
      }
    >
      <div className={"text-xs font-semibold uppercase tracking-wide " + (highlight ? "text-white/70" : "text-gray-500")}>
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold">{value}</div>
      {sub && (
        <div className={"mt-1 font-mono text-[11px] " + (highlight ? "text-white/70" : "text-gray-500")}>
          {sub}
        </div>
      )}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={inputCls + " mt-1 font-mono"}
      />
    </label>
  );
}

function OhmField({
  label,
  value,
  onChange,
  editable,
  fmt,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  editable: boolean;
  fmt?: (v: number) => string;
}) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(fmt ? fmt(value) : String(Number(value.toFixed(6))));
  }, [value, focused, fmt]);
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label} {editable ? "" : <span className="text-eng-navy">(derived)</span>}
      </span>
      <input
        type="text"
        value={draft}
        readOnly={!editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number(e.target.value);
          if (isFinite(n)) onChange(n);
        }}
        className={
          inputCls +
          " mt-1 font-mono " +
          (editable ? "" : "bg-gray-50 text-eng-navy")
        }
      />
    </label>
  );
}

function BandSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: number; label: string; hex: string }[];
  value: number;
  onChange: (v: number) => void;
}) {
  const sel = options.find((o) => o.value === value);
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-2">
        <span
          className="h-6 w-6 shrink-0 rounded-full border border-gray-300"
          style={{ background: sel?.hex }}
        />
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={inputCls + " font-mono"}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function ResistorSVG({
  bandCount,
  digits,
  multIdx,
  tolIdx,
  tcIdx,
}: {
  bandCount: 4 | 5 | 6;
  digits: number[];
  multIdx: number;
  tolIdx: number;
  tcIdx: number;
}) {
  // Layout: body x=60..340 (width 280). Leads extend to 0 and 400.
  const leftBands: { hex: string }[] = [
    ...digits.map((d) => DIGIT_COLORS[d]),
    MULTIPLIER_COLORS[multIdx],
  ];
  const rightBands: { hex: string }[] = [
    TOLERANCE_COLORS[tolIdx],
    ...(bandCount === 6 ? [TC_COLORS[tcIdx]] : []),
  ];

  const bodyX = 60;
  const bodyW = 280;
  const bandW = 20;
  const leftStart = bodyX + 18;
  const leftStep = 30;
  const rightEnd = bodyX + bodyW - 18 - bandW;
  const rightStep = 30;

  return (
    <svg viewBox="0 0 400 110" className="w-full max-w-xl">
      {/* leads */}
      <line x1="0" y1="55" x2="400" y2="55" stroke="#999" strokeWidth="3" />
      {/* body */}
      <rect
        x={bodyX}
        y="30"
        rx="22"
        ry="22"
        width={bodyW}
        height="50"
        fill="#e8c896"
        stroke="#a07a4a"
        strokeWidth="1.5"
      />
      {/* left bands */}
      {leftBands.map((b, i) => (
        <rect
          key={`L${i}`}
          x={leftStart + i * leftStep}
          y="30"
          width={bandW}
          height="50"
          fill={b.hex}
          stroke="#00000010"
        />
      ))}
      {/* right bands (tolerance, TC) */}
      {rightBands.map((b, i) => (
        <rect
          key={`R${i}`}
          x={rightEnd - (rightBands.length - 1 - i) * rightStep}
          y="30"
          width={bandW}
          height="50"
          fill={b.hex}
          stroke="#00000010"
        />
      ))}
    </svg>
  );
}

// ============================================================
// Small formatters
// ============================================================

function formatMultiplier(v: number): string {
  if (v >= 1e9) return `${v / 1e9}G`;
  if (v >= 1e6) return `${v / 1e6}M`;
  if (v >= 1e3) return `${v / 1e3}k`;
  if (v >= 1) return `${v}`;
  return v.toString();
}

function formatCurrent(a: number): string {
  if (!isFinite(a)) return "—";
  const abs = Math.abs(a);
  if (abs >= 1) return `${a.toFixed(3)} A`;
  if (abs >= 1e-3) return `${(a * 1e3).toFixed(3)} mA`;
  if (abs >= 1e-6) return `${(a * 1e6).toFixed(2)} µA`;
  return `${(a * 1e9).toFixed(2)} nA`;
}

function formatPower(w: number): string {
  if (!isFinite(w)) return "—";
  const abs = Math.abs(w);
  if (abs >= 1) return `${w.toFixed(3)} W`;
  if (abs >= 1e-3) return `${(w * 1e3).toFixed(2)} mW`;
  return `${(w * 1e6).toFixed(2)} µW`;
}

function recommendWattage(p: number): string {
  // Pick a standard rating ≥ 2× actual.
  const target = p * 2;
  const ratings = [
    { w: 0.0625, label: "1/16 W" },
    { w: 0.125,  label: "1/8 W" },
    { w: 0.25,   label: "1/4 W" },
    { w: 0.5,    label: "1/2 W" },
    { w: 1,      label: "1 W" },
    { w: 2,      label: "2 W" },
    { w: 5,      label: "5 W" },
    { w: 10,     label: "10 W" },
    { w: 25,     label: "25 W" },
    { w: 50,     label: "50 W" },
  ];
  for (const r of ratings) if (r.w >= target) return r.label;
  return ">50 W";
}
