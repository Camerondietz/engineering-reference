"use client";

// app/content/gear-tool.tsx
//
// Spur-gear geometry & ratio calculator. Supports metric (module) and
// imperial (diametral pitch). Computes pitch / base / outside / root
// diameters, addendum, dedendum, circular pitch, center distance,
// gear ratio, output speed and torque.

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// Helpers
// ============================================================

const D2R = Math.PI / 180;

type Sys = "module" | "DP";

// Standard ANSI/AGMA proportions for full-depth involute teeth.
function geom(N: number, m: number, alphaDeg: number) {
  const alpha = alphaDeg * D2R;
  const pitchDia = N * m;
  const addendum = m;
  const dedendum = 1.25 * m;
  const wholeDepth = 2.25 * m;
  const outsideDia = pitchDia + 2 * addendum;
  const rootDia = pitchDia - 2 * dedendum;
  const baseDia = pitchDia * Math.cos(alpha);
  const circularPitch = Math.PI * m;
  const basePitch = circularPitch * Math.cos(alpha);
  const toothThickness = circularPitch / 2;
  return {
    pitchDia,
    addendum,
    dedendum,
    wholeDepth,
    outsideDia,
    rootDia,
    baseDia,
    circularPitch,
    basePitch,
    toothThickness,
  };
}

// ============================================================
// Page
// ============================================================

export default function GearToolPage() {
  const [sys, setSys] = useState<Sys>("module");
  const [moduleMm, setModuleMm] = useState(2);   // mm
  const [dp, setDp] = useState(12);              // 1/in
  const [alpha, setAlpha] = useState(20);        // pressure angle, degrees
  const [n1, setN1] = useState(20);              // pinion teeth
  const [n2, setN2] = useState(60);              // gear teeth
  const [inputRpm, setInputRpm] = useState(1750);
  const [inputHp, setInputHp] = useState(2);
  const [efficiency, setEfficiency] = useState(0.97);

  // Module value used internally — convert DP → mm if needed.
  // 1 / DP = circular pitch in inches; module (mm) = 25.4 / DP.
  const m = sys === "module" ? moduleMm : 25.4 / Math.max(0.0001, dp);

  const pinion = useMemo(() => geom(n1, m, alpha), [n1, m, alpha]);
  const gear = useMemo(() => geom(n2, m, alpha), [n2, m, alpha]);
  const centerDist = (pinion.pitchDia + gear.pitchDia) / 2;
  const ratio = n1 > 0 ? n2 / n1 : 0;
  const outputRpm = ratio > 0 ? inputRpm / ratio : 0;
  const inputTqLbFt = inputRpm > 0 ? (5252 * inputHp) / inputRpm : 0;
  const outputTqLbFt = outputRpm > 0 ? (5252 * (inputHp * efficiency)) / outputRpm : 0;
  const dpFromModule = m > 0 ? 25.4 / m : 0;

  function switchSys(s: Sys) {
    if (s === sys) return;
    setSys(s);
    if (s === "module") {
      setModuleMm(round(25.4 / dp, 3));
    } else {
      setDp(round(25.4 / moduleMm, 2));
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Spur Gear Calculator
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Spur-gear geometry from module or diametral pitch — pitch /
          base / outside / root diameters, center distance, gear ratio,
          output speed and torque.
        </p>
      </header>

      <Card title="Inputs">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Pitch system
          </span>
          <Seg active={sys === "module"} onClick={() => switchSys("module")}>
            Metric (module, mm)
          </Seg>
          <Seg active={sys === "DP"} onClick={() => switchSys("DP")}>
            Imperial (DP, 1/in)
          </Seg>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sys === "module" ? (
            <NumField label="Module m (mm)" value={moduleMm} step="0.1" onChange={setModuleMm} />
          ) : (
            <NumField label="Diametral pitch (1/in)" value={dp} step="0.5" onChange={setDp} />
          )}
          <NumField label="Pressure angle (°)" value={alpha} step="0.5" onChange={setAlpha} />
          <NumField label="Pinion teeth (N₁)" value={n1} step="1" onChange={setN1} />
          <NumField label="Gear teeth (N₂)" value={n2} step="1" onChange={setN2} />
          <NumField label="Input RPM" value={inputRpm} step="10" onChange={setInputRpm} />
          <NumField label="Input HP" value={inputHp} step="0.1" onChange={setInputHp} />
          <NumField label="Mesh efficiency (0–1)" value={efficiency} step="0.01" onChange={setEfficiency} />
          <Stat label="Equivalent" value={sys === "module" ? `DP ≈ ${dpFromModule.toFixed(2)}` : `m ≈ ${m.toFixed(3)} mm`} />
        </div>
      </Card>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Pinion (N₁)">
          <GearRow label="Pitch diameter (d)" v={pinion.pitchDia} />
          <GearRow label="Outside diameter" v={pinion.outsideDia} />
          <GearRow label="Root diameter" v={pinion.rootDia} />
          <GearRow label="Base diameter" v={pinion.baseDia} />
          <GearRow label="Addendum" v={pinion.addendum} />
          <GearRow label="Dedendum" v={pinion.dedendum} />
          <GearRow label="Whole depth" v={pinion.wholeDepth} />
          <GearRow label="Circular pitch" v={pinion.circularPitch} />
          <GearRow label="Tooth thickness (at PCD)" v={pinion.toothThickness} />
        </Card>
        <Card title="Gear (N₂)">
          <GearRow label="Pitch diameter (D)" v={gear.pitchDia} />
          <GearRow label="Outside diameter" v={gear.outsideDia} />
          <GearRow label="Root diameter" v={gear.rootDia} />
          <GearRow label="Base diameter" v={gear.baseDia} />
          <GearRow label="Addendum" v={gear.addendum} />
          <GearRow label="Dedendum" v={gear.dedendum} />
          <GearRow label="Whole depth" v={gear.wholeDepth} />
          <GearRow label="Circular pitch" v={gear.circularPitch} />
          <GearRow label="Tooth thickness (at PCD)" v={gear.toothThickness} />
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Mesh">
          <Stat label="Gear ratio (N₂/N₁)" value={`${ratio.toFixed(3)} : 1`} highlight />
          <Stat label="Center distance" value={`${centerDist.toFixed(3)} mm`} sub={`${(centerDist / 25.4).toFixed(4)} in`} />
        </Card>
        <Card title="Speed">
          <Stat label="Input RPM" value={inputRpm.toString()} />
          <Stat label="Output RPM" value={outputRpm.toFixed(1)} highlight />
        </Card>
        <Card title="Torque (lossless / with η)">
          <Stat label="Input torque" value={`${inputTqLbFt.toFixed(2)} lbf·ft`} sub={`${(inputTqLbFt * 1.3558).toFixed(2)} N·m`} />
          <Stat label="Output torque (× η)" value={`${outputTqLbFt.toFixed(2)} lbf·ft`} sub={`${(outputTqLbFt * 1.3558).toFixed(2)} N·m`} highlight />
        </Card>
      </section>

      <section className="mt-6">
        <Card title="Notes">
          <ul className="list-disc pl-5 text-sm text-gray-600">
            <li>Standard full-depth involute teeth — addendum = m, dedendum = 1.25 m, whole depth = 2.25 m.</li>
            <li>Module (mm) and Diametral Pitch (1/in) are reciprocals through 25.4: m = 25.4 / DP.</li>
            <li>Most industrial spur gears use a 20° pressure angle (some legacy 14.5° or modern 25°).</li>
            <li>Avoid undercutting — minimum pinion teeth ≈ 17 at 20° pressure angle.</li>
            <li>Gear ratio &gt; 6:1 in a single stage gets large &amp; inefficient; stage if needed.</li>
          </ul>
        </Card>
      </section>
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

function GearRow({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-gray-100 pb-1 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-right font-mono text-sm">
        <span>{v.toFixed(3)} mm</span>
        <span className="ml-2 text-[11px] text-gray-500">{(v / 25.4).toFixed(4)} in</span>
      </span>
    </div>
  );
}
