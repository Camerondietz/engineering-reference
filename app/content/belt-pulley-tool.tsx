"use client";

// app/content/belt-pulley-tool.tsx
//
// V-belt and timing-belt selection helper. Computes pulley ratios,
// driven speed and torque, belt speed, belt length, wrap angle on
// the small pulley, and approximate power capacity. Includes a
// timing-belt teeth-count calculator for common pitches.

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// V-belt cross sections (rough power capacity per belt @ 1750 RPM
// on a 5"+ small pulley; for ballpark belt count only)
// ============================================================

const V_BELTS = [
  { id: "3L", label: "3L (fractional)", topWidth: 0.375, thickness: 0.219, hpPerBelt: 0.5 },
  { id: "4L", label: "4L (fractional)", topWidth: 0.5,   thickness: 0.281, hpPerBelt: 1.0 },
  { id: "5L", label: "5L (fractional)", topWidth: 0.625, thickness: 0.375, hpPerBelt: 1.5 },
  { id: "A",  label: "A (classical)",   topWidth: 0.5,   thickness: 0.31,  hpPerBelt: 3 },
  { id: "B",  label: "B (classical)",   topWidth: 0.66,  thickness: 0.41,  hpPerBelt: 7 },
  { id: "C",  label: "C (classical)",   topWidth: 0.875, thickness: 0.53,  hpPerBelt: 14 },
  { id: "D",  label: "D (classical)",   topWidth: 1.25,  thickness: 0.75,  hpPerBelt: 28 },
  { id: "3V", label: "3V (narrow)",     topWidth: 0.375, thickness: 0.31,  hpPerBelt: 5 },
  { id: "5V", label: "5V (narrow)",     topWidth: 0.625, thickness: 0.53,  hpPerBelt: 15 },
  { id: "8V", label: "8V (narrow)",     topWidth: 1.0,   thickness: 0.91,  hpPerBelt: 35 },
];

// ============================================================
// Timing belt pitches (mm)
// ============================================================

const TIMING_PITCHES = [
  { id: "MXL", label: "MXL", pitchMm: 2.032 },
  { id: "XL",  label: "XL",  pitchMm: 5.080 },
  { id: "L",   label: "L",   pitchMm: 9.525 },
  { id: "H",   label: "H",   pitchMm: 12.700 },
  { id: "GT2", label: "GT2 / 2 mm", pitchMm: 2.000 },
  { id: "GT3", label: "GT3 / 3 mm", pitchMm: 3.000 },
  { id: "GT5", label: "GT5 / 5 mm", pitchMm: 5.000 },
  { id: "HTD5", label: "HTD 5 mm", pitchMm: 5.000 },
  { id: "HTD8", label: "HTD 8 mm", pitchMm: 8.000 },
  { id: "HTD14", label: "HTD 14 mm", pitchMm: 14.000 },
];

// ============================================================
// Page
// ============================================================

type Units = "in" | "mm";

export default function BeltPulleyToolPage() {
  const [units, setUnits] = useState<Units>("in");
  const [d1, setD1] = useState(3.5); // driver dia
  const [d2, setD2] = useState(7.0); // driven dia
  const [C, setC] = useState(18);    // center distance
  const [rpm, setRpm] = useState(1750);
  const [hp, setHp] = useState(5);
  const [beltIdx, setBeltIdx] = useState(3); // A

  // Timing belt
  const [n1, setN1] = useState(20);
  const [n2, setN2] = useState(40);
  const [Ctb, setCtb] = useState(150); // mm
  const [pitchIdx, setPitchIdx] = useState(7); // HTD5

  // Convert all V-belt math in user's units (works either way).
  const ratio = d2 > 0 ? d2 / d1 : 0;
  const drivenRpm = ratio > 0 ? rpm / ratio : 0;

  // Belt speed = π × D × RPM, in (length unit)/min
  const beltSpeed = Math.PI * d1 * rpm; // unit/min

  // Belt speed in standard fpm if inches; m/min if mm.
  const beltSpeedFpm = units === "in" ? beltSpeed / 12 : beltSpeed / 1000 * 3.281;
  const beltSpeedMmin = units === "in" ? (beltSpeed * 25.4) / 1000 : beltSpeed / 1000;

  // Belt length (approx open belt):
  // L = 2C + π(D1+D2)/2 + (D2-D1)² / (4C)
  const beltLen =
    2 * C + (Math.PI * (d1 + d2)) / 2 + Math.pow(d2 - d1, 2) / (4 * C);

  // Wrap angle on the small pulley:
  // θ = π - 2·sin⁻¹((D2-D1)/(2C))
  const wrapRad =
    C > 0 ? Math.PI - 2 * Math.asin(Math.min(1, Math.max(-1, (d2 - d1) / (2 * C)))) : NaN;
  const wrapDeg = isFinite(wrapRad) ? (wrapRad * 180) / Math.PI : NaN;

  // Driver torque (lbf·ft from HP & RPM)
  const driverTqFtLb = rpm > 0 ? (5252 * hp) / rpm : 0;
  const drivenTqFtLb = drivenRpm > 0 ? (5252 * hp) / drivenRpm : 0;

  // V-belt count estimate: ceil(HP / hpPerBelt × correction).
  // Apply a simple arc-of-contact correction (interp from 180° = 1.0 down to 120° ≈ 0.82).
  const belt = V_BELTS[beltIdx];
  const arcCorr = isFinite(wrapDeg) ? Math.max(0.65, 1 - (180 - wrapDeg) / 180 * 0.5) : 1;
  const beltCountEst = belt.hpPerBelt > 0 && hp > 0
    ? Math.ceil(hp / (belt.hpPerBelt * arcCorr))
    : 0;

  // Timing belt teeth count:
  // L_teeth ≈ 2C/p + (N1+N2)/2 + p·(N2-N1)² / (4π² C)
  const pitch = TIMING_PITCHES[pitchIdx].pitchMm;
  const tbTeeth = useMemo(() => {
    if (pitch <= 0 || Ctb <= 0) return NaN;
    const t =
      (2 * Ctb) / pitch +
      (n1 + n2) / 2 +
      (pitch * Math.pow(n2 - n1, 2)) / (4 * Math.PI * Math.PI * Ctb);
    return Math.ceil(t);
  }, [pitch, Ctb, n1, n2]);
  const tbLengthMm = isFinite(tbTeeth) ? tbTeeth * pitch : NaN;
  const tbRatio = n2 > 0 ? n2 / n1 : 0;

  function switchUnits(u: Units) {
    if (u === units) return;
    setUnits(u);
    if (u === "mm") {
      setD1(round(d1 * 25.4, 1));
      setD2(round(d2 * 25.4, 1));
      setC(round(C * 25.4, 0));
    } else {
      setD1(round(d1 / 25.4, 3));
      setD2(round(d2 / 25.4, 3));
      setC(round(C / 25.4, 2));
    }
  }

  const lenUnit = units === "in" ? "in" : "mm";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Belt &amp; Pulley
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          V-belt and timing-belt sizing — drive ratios, driven speed and
          torque, belt length, wrap angle, belt speed, and an estimated
          belt count by cross-section.
        </p>
      </header>

      {/* V-belt section */}
      <Card title="V-belt drive">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Units
          </span>
          <Seg active={units === "in"} onClick={() => switchUnits("in")}>Inches</Seg>
          <Seg active={units === "mm"} onClick={() => switchUnits("mm")}>Millimeters</Seg>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NumField label={`Driver Ø (${lenUnit})`} value={d1} step="0.1" onChange={setD1} />
          <NumField label={`Driven Ø (${lenUnit})`} value={d2} step="0.1" onChange={setD2} />
          <NumField label={`Center distance (${lenUnit})`} value={C} step="0.5" onChange={setC} />
          <NumField label="Driver RPM" value={rpm} step="10" onChange={setRpm} />
          <NumField label="Transmitted HP" value={hp} step="0.5" onChange={setHp} />
          <SelectNum
            label="Cross-section"
            value={beltIdx}
            onChange={setBeltIdx}
            options={V_BELTS.map((b, i) => ({ value: i, label: b.label }))}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SubCard title="Speed">
            <Stat label="Ratio" value={`${ratio.toFixed(3)} : 1`} />
            <Stat label="Driven RPM" value={drivenRpm.toFixed(1)} highlight />
            <Stat label="Belt speed" value={`${beltSpeedFpm.toFixed(0)} fpm`} sub={`${beltSpeedMmin.toFixed(1)} m/min`} />
          </SubCard>
          <SubCard title="Torque">
            <Stat label="Driver torque" value={`${driverTqFtLb.toFixed(2)} lbf·ft`} sub={`${(driverTqFtLb * 1.3558).toFixed(2)} N·m`} />
            <Stat label="Driven torque" value={`${drivenTqFtLb.toFixed(2)} lbf·ft`} sub={`${(drivenTqFtLb * 1.3558).toFixed(2)} N·m`} highlight />
          </SubCard>
          <SubCard title="Geometry">
            <Stat label={`Belt length (${lenUnit})`} value={beltLen.toFixed(2)} />
            <Stat label="Wrap on small pulley" value={isFinite(wrapDeg) ? `${wrapDeg.toFixed(1)}°` : "—"} />
            <Stat label="Estimated belts needed" value={`${beltCountEst}`} sub={`@ ${belt.hpPerBelt} HP/belt × ${arcCorr.toFixed(2)} arc corr.`} />
          </SubCard>
        </div>

        <p className="mt-3 text-[11px] text-gray-500">
          Belt count and HP/belt are ballpark only — actual capacity depends
          on pulley diameter, speed ratio, and service factor. Use the OEM
          rating chart (e.g., Gates, Bando) for production design.
        </p>
      </Card>

      {/* Timing belt section */}
      <div className="mt-6">
        <Card title="Timing belt (synchronous)">
          <p className="mb-3 text-sm text-gray-500">
            Tooth counts and metric pitch. Belt length is rounded up to a
            whole number of teeth.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <NumField label="Driver teeth (N₁)" value={n1} step="1" onChange={setN1} />
            <NumField label="Driven teeth (N₂)" value={n2} step="1" onChange={setN2} />
            <NumField label="Center distance (mm)" value={Ctb} step="1" onChange={setCtb} />
            <SelectNum
              label="Pitch"
              value={pitchIdx}
              onChange={setPitchIdx}
              options={TIMING_PITCHES.map((p, i) => ({
                value: i,
                label: `${p.label} (${p.pitchMm.toFixed(2)} mm)`,
              }))}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Stat label="Ratio" value={`${tbRatio.toFixed(3)} : 1`} />
            <Stat label="Belt teeth (min)" value={isFinite(tbTeeth) ? `${tbTeeth}` : "—"} highlight />
            <Stat label="Belt length" value={isFinite(tbLengthMm) ? `${tbLengthMm.toFixed(1)} mm` : "—"} sub={isFinite(tbLengthMm) ? `${(tbLengthMm / 25.4).toFixed(2)} in` : ""} />
          </div>
        </Card>
      </div>

      {/* V-belt reference */}
      <div className="mt-6">
        <Card title="V-belt cross-section quick reference">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-2 py-2">Profile</th>
                  <th className="px-2 py-2 text-right">Top width</th>
                  <th className="px-2 py-2 text-right">Thickness</th>
                  <th className="px-2 py-2 text-right">~HP / belt</th>
                </tr>
              </thead>
              <tbody>
                {V_BELTS.map((b, i) => (
                  <tr key={b.id} className={"border-t border-gray-100 " + (i === beltIdx ? "bg-eng-navy/5" : "")}>
                    <td className="px-2 py-1.5 font-mono font-semibold">{b.label}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{b.topWidth.toFixed(3)} in</td>
                    <td className="px-2 py-1.5 text-right font-mono">{b.thickness.toFixed(3)} in</td>
                    <td className="px-2 py-1.5 text-right font-mono">{b.hpPerBelt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

function round(n: number, d: number) { const f = Math.pow(10, d); return Math.round(n * f) / f; }

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SubCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      <div className="mt-2 flex flex-col gap-2">{children}</div>
    </div>
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
        (highlight ? "bg-eng-navy text-white" : "bg-white")
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
