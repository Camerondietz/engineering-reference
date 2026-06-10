"use client";

// app/content/bolt-torque-tool.tsx
//
// Fastener reference: bolt size lookup (metric & SAE/inch), grade
// strength data, recommended tightening torque (from T = K·D·F), tap
// drill sizes, and a torque ↔ preload calculator.

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// Bolt data
// ============================================================

interface MetricBolt {
  size: string;       // "M8"
  diameter: number;   // nominal in mm
  pitchCoarse: number;
  pitchFine?: number;
  stressAreaCoarse: number; // mm²
  tapDrillCoarse: number;   // mm (75% thread engagement)
}

const METRIC_BOLTS: MetricBolt[] = [
  { size: "M2",    diameter: 2,   pitchCoarse: 0.4,  stressAreaCoarse: 2.07,  tapDrillCoarse: 1.6 },
  { size: "M2.5",  diameter: 2.5, pitchCoarse: 0.45, stressAreaCoarse: 3.39,  tapDrillCoarse: 2.05 },
  { size: "M3",    diameter: 3,   pitchCoarse: 0.5,  stressAreaCoarse: 5.03,  tapDrillCoarse: 2.5 },
  { size: "M4",    diameter: 4,   pitchCoarse: 0.7,  stressAreaCoarse: 8.78,  tapDrillCoarse: 3.3 },
  { size: "M5",    diameter: 5,   pitchCoarse: 0.8,  stressAreaCoarse: 14.2,  tapDrillCoarse: 4.2 },
  { size: "M6",    diameter: 6,   pitchCoarse: 1.0,  stressAreaCoarse: 20.1,  tapDrillCoarse: 5.0 },
  { size: "M8",    diameter: 8,   pitchCoarse: 1.25, pitchFine: 1.0, stressAreaCoarse: 36.6,  tapDrillCoarse: 6.8 },
  { size: "M10",   diameter: 10,  pitchCoarse: 1.5,  pitchFine: 1.25, stressAreaCoarse: 58.0,  tapDrillCoarse: 8.5 },
  { size: "M12",   diameter: 12,  pitchCoarse: 1.75, pitchFine: 1.25, stressAreaCoarse: 84.3,  tapDrillCoarse: 10.2 },
  { size: "M14",   diameter: 14,  pitchCoarse: 2.0,  pitchFine: 1.5,  stressAreaCoarse: 115,   tapDrillCoarse: 12.0 },
  { size: "M16",   diameter: 16,  pitchCoarse: 2.0,  pitchFine: 1.5,  stressAreaCoarse: 157,   tapDrillCoarse: 14.0 },
  { size: "M18",   diameter: 18,  pitchCoarse: 2.5,  pitchFine: 1.5,  stressAreaCoarse: 192,   tapDrillCoarse: 15.5 },
  { size: "M20",   diameter: 20,  pitchCoarse: 2.5,  pitchFine: 1.5,  stressAreaCoarse: 245,   tapDrillCoarse: 17.5 },
  { size: "M22",   diameter: 22,  pitchCoarse: 2.5,  pitchFine: 1.5,  stressAreaCoarse: 303,   tapDrillCoarse: 19.5 },
  { size: "M24",   diameter: 24,  pitchCoarse: 3.0,  pitchFine: 2.0,  stressAreaCoarse: 353,   tapDrillCoarse: 21.0 },
  { size: "M27",   diameter: 27,  pitchCoarse: 3.0,  pitchFine: 2.0,  stressAreaCoarse: 459,   tapDrillCoarse: 24.0 },
  { size: "M30",   diameter: 30,  pitchCoarse: 3.5,  pitchFine: 2.0,  stressAreaCoarse: 561,   tapDrillCoarse: 26.5 },
  { size: "M36",   diameter: 36,  pitchCoarse: 4.0,  pitchFine: 3.0,  stressAreaCoarse: 817,   tapDrillCoarse: 32.0 },
];

interface InchBolt {
  size: string;       // "1/4-20"
  diameter: number;   // nominal in inches
  tpi: number;
  stressAreaUnc: number; // in²
  tapDrillUnc: string;   // common drill or fractional
}

const INCH_BOLTS: InchBolt[] = [
  { size: "#4-40",   diameter: 0.112, tpi: 40, stressAreaUnc: 0.00604, tapDrillUnc: "#43 (2.26 mm)" },
  { size: "#6-32",   diameter: 0.138, tpi: 32, stressAreaUnc: 0.00909, tapDrillUnc: "#36 (2.71 mm)" },
  { size: "#8-32",   diameter: 0.164, tpi: 32, stressAreaUnc: 0.0140,  tapDrillUnc: "#29 (3.45 mm)" },
  { size: "#10-24",  diameter: 0.190, tpi: 24, stressAreaUnc: 0.0175,  tapDrillUnc: "#25 (3.80 mm)" },
  { size: "#10-32",  diameter: 0.190, tpi: 32, stressAreaUnc: 0.0200,  tapDrillUnc: "#21 (4.04 mm)" },
  { size: "1/4-20",  diameter: 0.250, tpi: 20, stressAreaUnc: 0.0318,  tapDrillUnc: "#7 (5.11 mm)" },
  { size: "5/16-18", diameter: 0.3125, tpi: 18, stressAreaUnc: 0.0524, tapDrillUnc: "F (6.53 mm)" },
  { size: "3/8-16",  diameter: 0.375, tpi: 16, stressAreaUnc: 0.0775,  tapDrillUnc: "5/16 (7.94 mm)" },
  { size: "7/16-14", diameter: 0.4375, tpi: 14, stressAreaUnc: 0.1063, tapDrillUnc: "U (9.35 mm)" },
  { size: "1/2-13",  diameter: 0.500, tpi: 13, stressAreaUnc: 0.1419,  tapDrillUnc: "27/64 (10.72 mm)" },
  { size: "9/16-12", diameter: 0.5625, tpi: 12, stressAreaUnc: 0.182,  tapDrillUnc: "31/64 (12.30 mm)" },
  { size: "5/8-11",  diameter: 0.625, tpi: 11, stressAreaUnc: 0.226,   tapDrillUnc: "17/32 (13.49 mm)" },
  { size: "3/4-10",  diameter: 0.750, tpi: 10, stressAreaUnc: 0.334,   tapDrillUnc: "21/32 (16.66 mm)" },
  { size: "7/8-9",   diameter: 0.875, tpi: 9,  stressAreaUnc: 0.462,   tapDrillUnc: "49/64 (19.45 mm)" },
  { size: "1\"-8",   diameter: 1.000, tpi: 8,  stressAreaUnc: 0.606,   tapDrillUnc: "7/8 (22.23 mm)" },
];

interface Grade {
  id: string;
  label: string;
  proofMPa: number;   // proof load stress
  yieldMPa: number;
  ultimateMPa: number;
}

const METRIC_GRADES: Grade[] = [
  { id: "4.6",  label: "Class 4.6",  proofMPa: 225, yieldMPa: 240, ultimateMPa: 400 },
  { id: "4.8",  label: "Class 4.8",  proofMPa: 310, yieldMPa: 320, ultimateMPa: 400 },
  { id: "5.8",  label: "Class 5.8",  proofMPa: 380, yieldMPa: 400, ultimateMPa: 500 },
  { id: "8.8",  label: "Class 8.8",  proofMPa: 580, yieldMPa: 640, ultimateMPa: 800 },
  { id: "10.9", label: "Class 10.9", proofMPa: 830, yieldMPa: 940, ultimateMPa: 1040 },
  { id: "12.9", label: "Class 12.9", proofMPa: 970, yieldMPa: 1100, ultimateMPa: 1220 },
];

const INCH_GRADES: Grade[] = [
  // psi values converted to MPa for internal consistency
  { id: "G2",  label: "SAE Grade 2",  proofMPa: 379,  yieldMPa: 393,  ultimateMPa: 510 },
  { id: "G5",  label: "SAE Grade 5",  proofMPa: 586,  yieldMPa: 634,  ultimateMPa: 827 },
  { id: "G8",  label: "SAE Grade 8",  proofMPa: 827,  yieldMPa: 896,  ultimateMPa: 1034 },
  { id: "A2",  label: "A2 Stainless", proofMPa: 210,  yieldMPa: 450,  ultimateMPa: 700 },
  { id: "A4",  label: "A4 Stainless", proofMPa: 210,  yieldMPa: 450,  ultimateMPa: 700 },
];

interface Lubrication {
  id: string;
  label: string;
  k: number; // nut factor
}
const LUBES: Lubrication[] = [
  { id: "dry",   label: "Dry / as-received",     k: 0.20 },
  { id: "zinc",  label: "Zinc plated",           k: 0.18 },
  { id: "oil",   label: "Lightly oiled",         k: 0.15 },
  { id: "moly",  label: "Moly / anti-seize",     k: 0.10 },
  { id: "ptfe",  label: "PTFE / waxed",          k: 0.12 },
];

// ============================================================
// Helpers
// ============================================================

function clampPreloadPct(p: number) {
  return Math.max(0, Math.min(100, p));
}

function formatTorque(nm: number): string {
  if (!isFinite(nm)) return "—";
  if (nm < 1) return `${(nm * 1000).toFixed(1)} N·mm`;
  if (nm >= 1000) return `${(nm / 1000).toFixed(2)} kN·m`;
  return `${nm.toFixed(2)} N·m`;
}

function nmToFtLb(nm: number): number { return nm / 1.355818; }
function nmToInLb(nm: number): number { return nm / 0.112985; }
function nToLbf(n: number): number { return n / 4.44822; }
function nToKN(n: number): number { return n / 1000; }

// ============================================================
// Page
// ============================================================

type System = "metric" | "inch";

export default function BoltTorqueToolPage() {
  const [system, setSystem] = useState<System>("metric");
  const [sizeIdx, setSizeIdx] = useState(6); // M8 default
  const [gradeIdx, setGradeIdx] = useState(3); // 8.8 default
  const [lubeIdx, setLubeIdx] = useState(0);
  const [preloadPct, setPreloadPct] = useState(75);

  // Switch defaults when toggling system.
  function switchSystem(s: System) {
    setSystem(s);
    setSizeIdx(s === "metric" ? 6 : 5);
    setGradeIdx(s === "metric" ? 3 : 1);
  }

  const boltsList = system === "metric" ? METRIC_BOLTS : INCH_BOLTS;
  const gradesList = system === "metric" ? METRIC_GRADES : INCH_GRADES;

  const bolt = boltsList[sizeIdx];
  const grade = gradesList[gradeIdx];
  const lube = LUBES[lubeIdx];

  const calc = useMemo(() => {
    // Stress area (mm² in both systems for internal calc).
    const stressArea_mm2 =
      system === "metric"
        ? (bolt as MetricBolt).stressAreaCoarse
        : (bolt as InchBolt).stressAreaUnc * 645.16;
    const diameter_mm =
      system === "metric"
        ? (bolt as MetricBolt).diameter
        : (bolt as InchBolt).diameter * 25.4;

    // Proof load (N) = proof stress (MPa = N/mm²) × stress area.
    const proofLoadN = grade.proofMPa * stressArea_mm2;
    const yieldLoadN = grade.yieldMPa * stressArea_mm2;
    const ultLoadN = grade.ultimateMPa * stressArea_mm2;
    const preloadN = proofLoadN * (preloadPct / 100);

    // Torque T = K · D · F   (D in m, F in N → N·m)
    const torqueNm = lube.k * (diameter_mm / 1000) * preloadN;

    return {
      stressArea_mm2,
      diameter_mm,
      proofLoadN,
      yieldLoadN,
      ultLoadN,
      preloadN,
      torqueNm,
    };
  }, [system, bolt, grade, lube, preloadPct]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Bolt Torque Calculator
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Recommended tightening torque and resulting clamp force for
          metric (M) and SAE / inch fasteners. Includes tap drill sizes,
          proof / yield / ultimate loads, and a lubrication-aware
          T&nbsp;=&nbsp;K·D·F calculation.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            System
          </span>
          <Seg active={system === "metric"} onClick={() => switchSystem("metric")}>
            Metric (M)
          </Seg>
          <Seg active={system === "inch"} onClick={() => switchSystem("inch")}>
            Inch (SAE)
          </Seg>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Bolt size"
            value={sizeIdx}
            onChange={setSizeIdx}
            options={boltsList.map((b, i) => ({ value: i, label: b.size }))}
          />
          <Select
            label="Grade / class"
            value={gradeIdx}
            onChange={setGradeIdx}
            options={gradesList.map((g, i) => ({ value: i, label: g.label }))}
          />
          <Select
            label="Lubrication (K)"
            value={lubeIdx}
            onChange={setLubeIdx}
            options={LUBES.map((l, i) => ({
              value: i,
              label: `${l.label} — K = ${l.k.toFixed(2)}`,
            }))}
          />
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Target preload (% of proof)
            </span>
            <input
              type="number"
              min={0}
              max={100}
              step="1"
              value={preloadPct}
              onChange={(e) => setPreloadPct(clampPreloadPct(Number(e.target.value) || 0))}
              className={inputCls + " mt-1 font-mono"}
            />
            <span className="mt-1 block text-[11px] text-gray-500">
              Common practice: 65–75% of proof load.
            </span>
          </label>
        </div>
      </section>

      {/* Results */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Recommended torque">
          <p className="font-mono text-3xl font-semibold text-eng-navy">
            {formatTorque(calc.torqueNm)}
          </p>
          <p className="mt-1 font-mono text-sm text-gray-600">
            {nmToFtLb(calc.torqueNm).toFixed(2)} lbf·ft &middot;{" "}
            {nmToInLb(calc.torqueNm).toFixed(1)} lbf·in
          </p>
          <p className="mt-3 text-xs text-gray-500">
            T = K · D · F<br />
            ({lube.k.toFixed(2)} × {calc.diameter_mm.toFixed(2)} mm ×{" "}
            {Math.round(calc.preloadN)} N)
          </p>
        </Card>

        <Card title="Clamp force at target preload">
          <p className="font-mono text-3xl font-semibold text-eng-navy">
            {(calc.preloadN / 1000).toFixed(2)} kN
          </p>
          <p className="mt-1 font-mono text-sm text-gray-600">
            {nToLbf(calc.preloadN).toFixed(0)} lbf &middot;{" "}
            {(calc.preloadN / 9.80665).toFixed(1)} kgf
          </p>
          <p className="mt-3 text-xs text-gray-500">
            {preloadPct}% of proof load ({Math.round(calc.proofLoadN)} N).
          </p>
        </Card>
      </section>

      {/* Strength + geometry */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Strength data">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-gray-500">Proof load stress</dt>
            <dd className="font-mono text-gray-800">{grade.proofMPa} MPa</dd>
            <dt className="text-gray-500">Yield stress</dt>
            <dd className="font-mono text-gray-800">{grade.yieldMPa} MPa</dd>
            <dt className="text-gray-500">Ultimate tensile</dt>
            <dd className="font-mono text-gray-800">{grade.ultimateMPa} MPa</dd>
            <dt className="text-gray-500">Stress area</dt>
            <dd className="font-mono text-gray-800">{calc.stressArea_mm2.toFixed(2)} mm²</dd>
            <dt className="text-gray-500">Proof load (F)</dt>
            <dd className="font-mono text-gray-800">
              {(calc.proofLoadN / 1000).toFixed(2)} kN ({nToLbf(calc.proofLoadN).toFixed(0)} lbf)
            </dd>
            <dt className="text-gray-500">Yield load</dt>
            <dd className="font-mono text-gray-800">{(calc.yieldLoadN / 1000).toFixed(2)} kN</dd>
            <dt className="text-gray-500">Ultimate load</dt>
            <dd className="font-mono text-gray-800">{(calc.ultLoadN / 1000).toFixed(2)} kN</dd>
          </dl>
        </Card>

        <Card title="Geometry & tap drill">
          {system === "metric" ? (
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-gray-500">Nominal diameter</dt>
              <dd className="font-mono text-gray-800">{(bolt as MetricBolt).diameter} mm</dd>
              <dt className="text-gray-500">Coarse pitch</dt>
              <dd className="font-mono text-gray-800">{(bolt as MetricBolt).pitchCoarse} mm</dd>
              {"pitchFine" in bolt && (bolt as MetricBolt).pitchFine && (
                <>
                  <dt className="text-gray-500">Fine pitch</dt>
                  <dd className="font-mono text-gray-800">{(bolt as MetricBolt).pitchFine} mm</dd>
                </>
              )}
              <dt className="text-gray-500">Tap drill (75% engagement)</dt>
              <dd className="font-mono text-gray-800">⌀ {(bolt as MetricBolt).tapDrillCoarse} mm</dd>
            </dl>
          ) : (
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-gray-500">Nominal diameter</dt>
              <dd className="font-mono text-gray-800">
                {(bolt as InchBolt).diameter} in ({((bolt as InchBolt).diameter * 25.4).toFixed(2)} mm)
              </dd>
              <dt className="text-gray-500">Threads per inch</dt>
              <dd className="font-mono text-gray-800">{(bolt as InchBolt).tpi} TPI (UNC)</dd>
              <dt className="text-gray-500">Tap drill (UNC)</dt>
              <dd className="font-mono text-gray-800">{(bolt as InchBolt).tapDrillUnc}</dd>
            </dl>
          )}
        </Card>
      </section>

      {/* Reference table */}
      <section className="mt-6">
        <Card title="Quick torque reference for selected grade & lubrication">
          <p className="mb-3 text-xs text-gray-500">
            All sizes in {system === "metric" ? "metric" : "SAE / inch"} system at{" "}
            <strong>{grade.label}</strong> · <strong>{lube.label}</strong> · {preloadPct}% preload.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-2 py-2">Size</th>
                  <th className="px-2 py-2 text-right">Stress area</th>
                  <th className="px-2 py-2 text-right">Clamp force</th>
                  <th className="px-2 py-2 text-right">Torque (N·m)</th>
                  <th className="px-2 py-2 text-right">Torque (lbf·ft)</th>
                </tr>
              </thead>
              <tbody>
                {boltsList.map((b, i) => {
                  const sa =
                    system === "metric"
                      ? (b as MetricBolt).stressAreaCoarse
                      : (b as InchBolt).stressAreaUnc * 645.16;
                  const d =
                    system === "metric"
                      ? (b as MetricBolt).diameter
                      : (b as InchBolt).diameter * 25.4;
                  const proof = grade.proofMPa * sa;
                  const F = proof * (preloadPct / 100);
                  const T = lube.k * (d / 1000) * F;
                  return (
                    <tr
                      key={b.size}
                      className={
                        "border-t border-gray-100 " +
                        (i === sizeIdx ? "bg-eng-navy/5" : "")
                      }
                    >
                      <td className="px-2 py-1.5 font-mono font-semibold text-gray-800">{b.size}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{sa.toFixed(1)} mm²</td>
                      <td className="px-2 py-1.5 text-right font-mono">{(F / 1000).toFixed(1)} kN</td>
                      <td className="px-2 py-1.5 text-right font-mono">{T.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-right font-mono text-gray-600">{nmToFtLb(T).toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <p className="mt-6 max-w-3xl text-xs text-gray-500">
        Values are general-purpose engineering estimates based on T = K·D·F.
        Actual torque depends on joint design, friction, surface finish,
        gasket relaxation, repeated use, and elasticity of the joint. Always
        consult the OEM, joint analysis (e.g., VDI 2230), or the controlling
        spec for safety-critical assemblies.
      </p>
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

function Select<T extends number>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as T)}
        className={inputCls + " mt-1"}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
