"use client";

// app/content/cylinder-sizing-tool.tsx
//
// Hydraulic / pneumatic cylinder sizing — bore & rod, area ratios,
// extend / retract force, speed and flow demand, stroke times,
// regenerative mode, and rod buckling (Euler) check.

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// Unit conversions (internal SI: mm, bar, L/min, N)
// ============================================================

const IN_MM = 25.4;
const PSI_BAR = 14.5037738;
const GPM_LPM = 3.78541;

const inToMm = (v: number) => v * IN_MM;
const mmToIn = (v: number) => v / IN_MM;
const psiToBar = (v: number) => v / PSI_BAR;
const barToPsi = (v: number) => v * PSI_BAR;
const gpmToLpm = (v: number) => v * GPM_LPM;
const lpmToGpm = (v: number) => v / GPM_LPM;
const nToLbf = (v: number) => v / 4.44822;

// Force (N) = Pressure (bar) × 0.1 × Area (mm²)   [bar = 0.1 N/mm²]
function forceN(barP: number, areaMm2: number): number {
  return barP * 0.1 * areaMm2;
}
// Speed (mm/s) = Flow (L/min) × 16.6667 / Area (mm²)
function speedMmPerS(lpmQ: number, areaMm2: number): number {
  if (areaMm2 <= 0) return NaN;
  return (lpmQ * 16.6667) / areaMm2;
}
// Time for a stroke (s) = stroke (mm) / speed (mm/s)
function strokeTimeS(strokeMm: number, speedMmS: number): number {
  if (speedMmS <= 0) return NaN;
  return strokeMm / speedMmS;
}

// Euler buckling: P_cr = π² × E × I / (K × L)²
// E for steel ≈ 200,000 N/mm² (MPa). I = π·d⁴/64 for round rod.
function bucklingLoadN(rodDiaMm: number, lengthMm: number, K: number): number {
  if (rodDiaMm <= 0 || lengthMm <= 0) return Infinity;
  const E = 200_000;
  const I = (Math.PI * Math.pow(rodDiaMm, 4)) / 64;
  return (Math.PI * Math.PI * E * I) / Math.pow(K * lengthMm, 2);
}

const END_CONDITIONS = [
  { id: "fixed-fixed",  label: "Both ends fixed (rigid)",        K: 0.5 },
  { id: "fixed-pinned", label: "One end fixed, one pinned",       K: 0.7 },
  { id: "pinned-pinned", label: "Both ends pinned (typical clevis-clevis)", K: 1.0 },
  { id: "fixed-free",   label: "One end fixed, one free (worst)", K: 2.0 },
];

// ============================================================
// Page
// ============================================================

type UnitSystem = "metric" | "imperial";

export default function CylinderSizingToolPage() {
  const [units, setUnits] = useState<UnitSystem>("imperial");
  // Inputs always stored in their display units; converted on use.
  const [bore, setBore] = useState(2);          // in or mm
  const [rod, setRod] = useState(1);            // in or mm
  const [stroke, setStroke] = useState(12);     // in or mm
  const [pressure, setPressure] = useState(2000); // psi or bar
  const [flow, setFlow] = useState(5);          // gpm or L/min
  const [endIdx, setEndIdx] = useState(2);
  const [sf, setSf] = useState(3);

  function switchUnits(u: UnitSystem) {
    if (u === units) return;
    setUnits(u);
    if (u === "metric") {
      setBore(round(inToMm(bore), 1));
      setRod(round(inToMm(rod), 1));
      setStroke(round(inToMm(stroke), 0));
      setPressure(round(psiToBar(pressure), 0));
      setFlow(round(gpmToLpm(flow), 1));
    } else {
      setBore(round(mmToIn(bore), 3));
      setRod(round(mmToIn(rod), 3));
      setStroke(round(mmToIn(stroke), 2));
      setPressure(round(barToPsi(pressure), 0));
      setFlow(round(lpmToGpm(flow), 2));
    }
  }

  // Convert inputs to SI for the math.
  const boreMm = units === "metric" ? bore : inToMm(bore);
  const rodMm  = units === "metric" ? rod  : inToMm(rod);
  const strokeMm = units === "metric" ? stroke : inToMm(stroke);
  const pressureBar = units === "metric" ? pressure : psiToBar(pressure);
  const flowLpm = units === "metric" ? flow : gpmToLpm(flow);

  const calc = useMemo(() => {
    const pistonArea = (Math.PI / 4) * boreMm * boreMm;     // mm²
    const rodArea    = (Math.PI / 4) * rodMm * rodMm;       // mm²
    const annularArea = Math.max(0, pistonArea - rodArea);  // mm²

    const extForceN = forceN(pressureBar, pistonArea);
    const retForceN = forceN(pressureBar, annularArea);

    const extSpeedMmS = speedMmPerS(flowLpm, pistonArea);
    const retSpeedMmS = speedMmPerS(flowLpm, annularArea);
    const extTimeS = strokeTimeS(strokeMm, extSpeedMmS);
    const retTimeS = strokeTimeS(strokeMm, retSpeedMmS);

    // Regenerative extend: P also acts on rod side and that flow returns to
    // cap side → effective extend area = piston − annular = rod area.
    const regenForceN = forceN(pressureBar, rodArea);
    const regenSpeedMmS = speedMmPerS(flowLpm, rodArea);
    const regenTimeS = strokeTimeS(strokeMm, regenSpeedMmS);

    const areaRatio = annularArea > 0 ? pistonArea / annularArea : Infinity;

    // Per-stroke volumes
    const extVolL = (pistonArea * strokeMm) / 1_000_000;   // mm³ → L
    const retVolL = (annularArea * strokeMm) / 1_000_000;

    // Buckling
    const K = END_CONDITIONS[endIdx].K;
    const bucklingN = bucklingLoadN(rodMm, strokeMm, K);
    const allowableN = bucklingN / Math.max(1, sf);
    const bucklingOk = extForceN <= allowableN;

    return {
      pistonArea,
      rodArea,
      annularArea,
      extForceN,
      retForceN,
      regenForceN,
      extSpeedMmS,
      retSpeedMmS,
      regenSpeedMmS,
      extTimeS,
      retTimeS,
      regenTimeS,
      extVolL,
      retVolL,
      areaRatio,
      bucklingN,
      allowableN,
      bucklingOk,
    };
  }, [boreMm, rodMm, strokeMm, pressureBar, flowLpm, endIdx, sf]);

  // Display helpers
  const lenUnit = units === "metric" ? "mm" : "in";
  const presUnit = units === "metric" ? "bar" : "psi";
  const flowUnit = units === "metric" ? "L/min" : "gpm";
  const areaUnit = units === "metric" ? "mm²" : "in²";
  const forceUnit = units === "metric" ? "N" : "lbf";
  const speedUnit = units === "metric" ? "mm/s" : "in/s";
  const volUnit = units === "metric" ? "L" : "gal";

  function displayLen(mm: number): string {
    return units === "metric" ? mm.toFixed(2) : mmToIn(mm).toFixed(4);
  }
  function displayArea(mm2: number): string {
    return units === "metric"
      ? mm2.toFixed(1)
      : (mm2 / (IN_MM * IN_MM)).toFixed(4);
  }
  function displayForce(N: number): string {
    return units === "metric" ? N.toFixed(0) : nToLbf(N).toFixed(0);
  }
  function displaySpeed(mms: number): string {
    if (!isFinite(mms)) return "—";
    return units === "metric" ? mms.toFixed(1) : (mms / IN_MM).toFixed(2);
  }
  function displayVol(L: number): string {
    if (!isFinite(L)) return "—";
    return units === "metric" ? L.toFixed(3) : (L / 3.78541).toFixed(3);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Cylinder Sizing
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Force, speed, flow, and stroke-time for hydraulic and pneumatic
          cylinders — extend, retract, and regenerative modes — with a
          rod buckling check per Euler.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Units
          </span>
          <Seg active={units === "imperial"} onClick={() => switchUnits("imperial")}>
            Imperial (in / psi / gpm)
          </Seg>
          <Seg active={units === "metric"} onClick={() => switchUnits("metric")}>
            Metric (mm / bar / L/min)
          </Seg>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NumField label={`Bore (${lenUnit})`} value={bore} step="0.1" onChange={setBore} />
          <NumField label={`Rod (${lenUnit})`} value={rod} step="0.1" onChange={setRod} />
          <NumField label={`Stroke (${lenUnit})`} value={stroke} step="1" onChange={setStroke} />
          <NumField label={`Pressure (${presUnit})`} value={pressure} step="10" onChange={setPressure} />
          <NumField label={`Flow (${flowUnit})`} value={flow} step="0.1" onChange={setFlow} />
          <SelectNum
            label="Mounting end conditions"
            value={endIdx}
            onChange={setEndIdx}
            options={END_CONDITIONS.map((e, i) => ({
              value: i,
              label: `${e.label} (K=${e.K})`,
            }))}
          />
          <NumField label="Buckling safety factor" value={sf} step="0.5" onChange={setSf} />
        </div>
      </section>

      {/* Areas */}
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Areas">
          <Stat label="Piston area" value={`${displayArea(calc.pistonArea)} ${areaUnit}`} />
          <Stat label="Rod area"    value={`${displayArea(calc.rodArea)} ${areaUnit}`} />
          <Stat label="Annular (cap − rod)" value={`${displayArea(calc.annularArea)} ${areaUnit}`} />
          <Stat label="Area ratio (cap / annular)" value={isFinite(calc.areaRatio) ? `${calc.areaRatio.toFixed(2)} : 1` : "—"} />
        </Card>

        <Card title="Force">
          <Stat label="Extend"  value={`${displayForce(calc.extForceN)} ${forceUnit}`} highlight />
          <Stat label="Retract" value={`${displayForce(calc.retForceN)} ${forceUnit}`} />
          <Stat label="Regen extend" value={`${displayForce(calc.regenForceN)} ${forceUnit}`} sub="rod-side flow returned to cap" />
        </Card>

        <Card title="Speed">
          <Stat label="Extend" value={`${displaySpeed(calc.extSpeedMmS)} ${speedUnit}`} highlight />
          <Stat label="Retract" value={`${displaySpeed(calc.retSpeedMmS)} ${speedUnit}`} />
          <Stat label="Regen extend" value={`${displaySpeed(calc.regenSpeedMmS)} ${speedUnit}`} />
        </Card>
      </section>

      {/* Volumes and times */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Per-stroke volume">
          <Stat label="Extend volume"  value={`${displayVol(calc.extVolL)} ${volUnit}`} sub="full cap side" />
          <Stat label="Retract volume" value={`${displayVol(calc.retVolL)} ${volUnit}`} sub="rod side" />
          <p className="mt-1 text-[11px] text-gray-500">
            Multiply by cycles per minute to size your power unit.
          </p>
        </Card>
        <Card title="Stroke time">
          <Stat label="Extend"  value={isFinite(calc.extTimeS)  ? `${calc.extTimeS.toFixed(2)} s`  : "—"} />
          <Stat label="Retract" value={isFinite(calc.retTimeS)  ? `${calc.retTimeS.toFixed(2)} s`  : "—"} />
          <Stat label="Regen extend" value={isFinite(calc.regenTimeS) ? `${calc.regenTimeS.toFixed(2)} s` : "—"} sub={`${calc.areaRatio.toFixed(2)}× faster than standard extend`} />
        </Card>
      </section>

      {/* Buckling */}
      <section className="mt-6">
        <Card title="Rod buckling (Euler)">
          <p className="mb-3 text-sm text-gray-500">
            P<sub>cr</sub> = π² × E × I / (K · L)². Solid round rod, mild
            steel E = 200,000 MPa. Compares against the extend force.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Critical load"    value={`${displayForce(calc.bucklingN)} ${forceUnit}`} />
            <Stat label={`Allowable (÷${sf} SF)`} value={`${displayForce(calc.allowableN)} ${forceUnit}`} />
            <Stat
              label="Status"
              value={calc.bucklingOk ? "OK" : "OVER LIMIT"}
              highlight={calc.bucklingOk}
            />
          </div>
          {!calc.bucklingOk && (
            <p className="mt-3 rounded-lg bg-eng-rust/10 px-3 py-2 text-sm text-eng-rust">
              Extend force exceeds the allowable buckling load. Increase rod
              diameter, reduce stroke, choose stiffer end conditions, or
              reduce operating pressure.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}

// ============================================================
// Sub-components & misc
// ============================================================

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20";

function round(n: number, d: number) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
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

function SelectNum({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputCls + " mt-1"}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
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
        "flex items-baseline justify-between gap-3 rounded-lg px-3 py-2 " +
        (highlight ? "bg-eng-navy text-white" : "bg-gray-50 text-gray-700")
      }
    >
      <span className={"text-xs font-semibold uppercase tracking-wide " + (highlight ? "text-white/70" : "text-gray-500")}>
        {label}
      </span>
      <span className="text-right">
        <span className="font-mono text-sm">{value}</span>
        {sub && (
          <span className={"ml-2 text-[11px] " + (highlight ? "text-white/70" : "text-gray-500")}>
            {sub}
          </span>
        )}
      </span>
    </div>
  );
}
