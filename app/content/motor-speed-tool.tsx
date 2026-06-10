"use client";

// app/content/motor-speed-tool.tsx
//
// AC induction motor & VFD speed / torque / power calculator. Computes
// synchronous RPM from supply frequency and pole count, applies slip
// to get nameplate (full-load) RPM, scales output via VFD drive
// frequency, and rolls out shaft torque from horsepower or kilowatts.

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// Constants & helpers
// ============================================================

const POLE_OPTIONS = [2, 4, 6, 8, 10, 12, 14, 16];

function syncRpm(hz: number, poles: number): number {
  if (poles <= 0) return NaN;
  return (120 * hz) / poles;
}

function torqueFromHpRpm(hp: number, rpm: number): number {
  // Imperial: T (lbf·ft) = 5252 × HP / RPM
  if (rpm <= 0) return NaN;
  return (5252 * hp) / rpm;
}
function torqueFromKwRpm(kw: number, rpm: number): number {
  // T (N·m) = 9549 × kW / RPM
  if (rpm <= 0) return NaN;
  return (9549 * kw) / rpm;
}
function kwFromHp(hp: number): number { return hp * 0.7457; }
function hpFromKw(kw: number): number { return kw / 0.7457; }

function flaApprox(hp: number, volts: number, eff: number, pf: number): number {
  // I (A) = (HP × 746) / (√3 × V × eff × PF)  for three-phase
  if (volts <= 0 || eff <= 0 || pf <= 0) return NaN;
  return (hp * 746) / (Math.sqrt(3) * volts * eff * pf);
}

// ============================================================
// Page
// ============================================================

export default function MotorSpeedToolPage() {
  // Nameplate
  const [supplyHz, setSupplyHz] = useState<50 | 60>(60);
  const [poles, setPoles] = useState(4);
  const [nameplateRpm, setNameplateRpm] = useState(1750);
  const [hp, setHp] = useState(5);
  const [volts, setVolts] = useState(460);
  const [efficiency, setEfficiency] = useState(0.92);
  const [pf, setPf] = useState(0.85);

  // VFD operation
  const [driveHz, setDriveHz] = useState(60);
  const [loadTorque, setLoadTorque] = useState<"constant" | "variable">("constant");

  // Belt / gear ratio
  const [driveDiameter, setDriveDiameter] = useState(4);
  const [drivenDiameter, setDrivenDiameter] = useState(8);

  const sync = syncRpm(supplyHz, poles);
  const slip = sync > 0 ? (sync - nameplateRpm) / sync : 0;
  const slipPct = slip * 100;

  // VFD output
  const vfdSync = syncRpm(driveHz, poles);
  const vfdRpm = vfdSync * (1 - slip);
  const vfdScale = supplyHz > 0 ? driveHz / supplyHz : 0;

  // Torque scaling vs base under VFD:
  //   - constant-torque load: torque ≈ rated up to base, falls above base
  //   - variable-torque load (centrifugal): torque ∝ (n/n_base)²
  const ratedTorqueNm = torqueFromKwRpm(kwFromHp(hp), nameplateRpm);
  const torqueAtDriveNm = useMemo(() => {
    if (vfdScale <= 0) return 0;
    if (loadTorque === "constant") {
      // Below base: full torque; above base: constant power → T falls 1/scale.
      return vfdScale <= 1 ? ratedTorqueNm : ratedTorqueNm / vfdScale;
    }
    // Variable torque (centrifugal): T ∝ n²
    return ratedTorqueNm * vfdScale * vfdScale;
  }, [ratedTorqueNm, vfdScale, loadTorque]);
  const powerAtDriveKw = useMemo(() => {
    return (torqueAtDriveNm * vfdRpm) / 9549;
  }, [torqueAtDriveNm, vfdRpm]);

  // Belt/gear
  const ratio = drivenDiameter > 0 ? driveDiameter / drivenDiameter : 0;
  const drivenRpm = vfdRpm * ratio;
  const drivenTorqueNm = ratio > 0 ? torqueAtDriveNm / ratio : NaN;

  const fla = useMemo(
    () => flaApprox(hp, volts, efficiency, pf),
    [hp, volts, efficiency, pf],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Motor &amp; VFD Calculator
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Synchronous and full-load RPM from supply frequency and pole
          count, VFD speed/torque scaling for constant- vs
          variable-torque loads, belt/gear reduction, and full-load
          current estimation.
        </p>
      </header>

      {/* Nameplate */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Motor nameplate</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Supply frequency
            </span>
            <div className="mt-1 flex">
              <Seg active={supplyHz === 60} onClick={() => setSupplyHz(60)}>60 Hz</Seg>
              <Seg active={supplyHz === 50} onClick={() => setSupplyHz(50)}>50 Hz</Seg>
            </div>
          </div>
          <SelectNum
            label="Pole count"
            value={poles}
            onChange={setPoles}
            options={POLE_OPTIONS.map((p) => ({ value: p, label: `${p} pole` }))}
          />
          <NumField label="Nameplate RPM" value={nameplateRpm} step="1" onChange={setNameplateRpm} />
          <NumField label="Horsepower (HP)" value={hp} step="0.1" onChange={setHp} />
          <NumField label="Voltage (V)" value={volts} step="1" onChange={setVolts} />
          <NumField label="Efficiency (0–1)" value={efficiency} step="0.01" onChange={setEfficiency} />
          <NumField label="Power factor" value={pf} step="0.01" onChange={setPf} />
        </div>
      </section>

      {/* Computed nameplate values */}
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Speed at nameplate">
          <Stat label="Synchronous RPM" value={isFinite(sync) ? sync.toFixed(0) : "—"} sub={`${supplyHz} Hz, ${poles} pole`} />
          <Stat label="Full-load RPM" value={nameplateRpm.toString()} />
          <Stat label="Slip" value={`${slipPct.toFixed(2)} %`} />
        </Card>
        <Card title="Power & torque">
          <Stat label="Rated power" value={`${hp.toFixed(2)} HP`} sub={`${kwFromHp(hp).toFixed(2)} kW`} />
          <Stat label="Rated torque" value={`${torqueFromHpRpm(hp, nameplateRpm).toFixed(2)} lbf·ft`} sub={`${ratedTorqueNm.toFixed(2)} N·m`} highlight />
        </Card>
        <Card title="Estimated FLA (3-phase)">
          <Stat label="Full-load amps" value={isFinite(fla) ? `${fla.toFixed(2)} A` : "—"} highlight />
          <p className="text-[11px] text-gray-500">
            I = (HP × 746) / (√3 × V × η × PF). Always confirm against the
            motor nameplate and NEC Table 430.250 for OCPD sizing.
          </p>
        </Card>
      </section>

      {/* Sync RPM reference */}
      <section className="mt-6">
        <Card title="Synchronous RPM reference">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-2 py-2">Poles</th>
                  <th className="px-2 py-2 text-right">60 Hz</th>
                  <th className="px-2 py-2 text-right">50 Hz</th>
                  <th className="px-2 py-2 text-right">FL (typ. 3% slip)</th>
                </tr>
              </thead>
              <tbody>
                {POLE_OPTIONS.map((p) => {
                  const s60 = syncRpm(60, p);
                  const s50 = syncRpm(50, p);
                  return (
                    <tr key={p} className={"border-t border-gray-100 " + (p === poles ? "bg-eng-navy/5" : "")}>
                      <td className="px-2 py-1.5 font-mono">{p}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{s60.toFixed(0)}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{s50.toFixed(0)}</td>
                      <td className="px-2 py-1.5 text-right font-mono text-gray-500">
                        {(s60 * 0.97).toFixed(0)} / {(s50 * 0.97).toFixed(0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* VFD */}
      <section className="mt-6">
        <Card title="VFD operation">
          <div className="grid gap-3 sm:grid-cols-3">
            <NumField label="Drive output frequency (Hz)" value={driveHz} step="0.1" onChange={setDriveHz} />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Load type
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                <Seg active={loadTorque === "constant"} onClick={() => setLoadTorque("constant")}>
                  Constant torque
                </Seg>
                <Seg active={loadTorque === "variable"} onClick={() => setLoadTorque("variable")}>
                  Variable torque (fan / pump)
                </Seg>
              </div>
            </div>
            <Stat label="Frequency vs base" value={`${(vfdScale * 100).toFixed(1)} %`} />
          </div>

          <div className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-4">
            <Stat label="Sync RPM at drive" value={isFinite(vfdSync) ? vfdSync.toFixed(0) : "—"} />
            <Stat label="Shaft RPM at drive" value={isFinite(vfdRpm) ? vfdRpm.toFixed(0) : "—"} highlight />
            <Stat label="Torque at drive" value={`${torqueAtDriveNm.toFixed(2)} N·m`} sub={`${(torqueAtDriveNm / 1.35582).toFixed(2)} lbf·ft`} highlight />
            <Stat label="Power at drive" value={`${powerAtDriveKw.toFixed(2)} kW`} sub={`${hpFromKw(powerAtDriveKw).toFixed(2)} HP`} />
          </div>

          <p className="mt-2 text-[11px] text-gray-500">
            Above base frequency (typically 60 Hz here), constant-torque loads
            enter constant-power region — torque falls inversely with speed.
            For variable-torque (centrifugal pumps / fans), torque varies with
            speed squared and power with speed cubed (the affinity laws).
          </p>
        </Card>
      </section>

      {/* Belt / gear */}
      <section className="mt-6">
        <Card title="Belt / gear reduction (driven side)">
          <p className="mb-3 text-sm text-gray-500">
            Ratio = driver / driven. Speed scales with the ratio; torque
            scales inversely. Apply efficiency separately for true output
            torque (not modeled here).
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <NumField label="Driver pulley / gear" value={driveDiameter} step="0.1" onChange={setDriveDiameter} />
            <NumField label="Driven pulley / gear" value={drivenDiameter} step="0.1" onChange={setDrivenDiameter} />
            <Stat label="Ratio" value={ratio.toFixed(3) + " : 1"} />
          </div>

          <div className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
            <Stat label="Driven RPM" value={isFinite(drivenRpm) ? drivenRpm.toFixed(1) : "—"} highlight />
            <Stat
              label="Driven torque"
              value={isFinite(drivenTorqueNm) ? `${drivenTorqueNm.toFixed(2)} N·m` : "—"}
              sub={isFinite(drivenTorqueNm) ? `${(drivenTorqueNm / 1.35582).toFixed(2)} lbf·ft` : ""}
              highlight
            />
          </div>
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
        "rounded-full px-3 py-1 text-xs font-semibold transition " +
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
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
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
      <span className="text-right font-mono text-sm">
        {value}
        {sub && (
          <span className={"ml-2 text-[11px] " + (highlight ? "text-white/70" : "text-gray-500")}>
            {sub}
          </span>
        )}
      </span>
    </div>
  );
}
