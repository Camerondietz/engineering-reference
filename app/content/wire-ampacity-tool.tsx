"use client";

// app/content/wire-ampacity-tool.tsx
//
// Wire / cable reference: AWG ↔ mm², ampacity (NEC Table 310.16, 60/75/90 °C),
// resistance, and a voltage-drop calculator for single- and three-phase.

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// AWG / wire data
// ============================================================

interface Wire {
  awg: string;
  mm2: number;       // cross-section
  diameter_in: number;
  resistance_ohm_per_kft: number; // copper @ 25°C
  ampacity60: number; // NEC 310.16, in raceway, 60°C copper
  ampacity75: number; // 75°C copper
  ampacity90: number; // 90°C copper
}

// NEC Table 310.16 (single, copper, 3 current-carrying conductors in raceway)
// plus standard physical data.
const WIRES: Wire[] = [
  { awg: "18", mm2: 0.823,  diameter_in: 0.0403, resistance_ohm_per_kft: 6.385,  ampacity60: 7,   ampacity75: 10,  ampacity90: 14 },
  { awg: "16", mm2: 1.31,   diameter_in: 0.0508, resistance_ohm_per_kft: 4.016,  ampacity60: 10,  ampacity75: 13,  ampacity90: 18 },
  { awg: "14", mm2: 2.08,   diameter_in: 0.0641, resistance_ohm_per_kft: 2.525,  ampacity60: 15,  ampacity75: 20,  ampacity90: 25 },
  { awg: "12", mm2: 3.31,   diameter_in: 0.0808, resistance_ohm_per_kft: 1.588,  ampacity60: 20,  ampacity75: 25,  ampacity90: 30 },
  { awg: "10", mm2: 5.26,   diameter_in: 0.1019, resistance_ohm_per_kft: 0.999,  ampacity60: 30,  ampacity75: 35,  ampacity90: 40 },
  { awg: "8",  mm2: 8.37,   diameter_in: 0.1285, resistance_ohm_per_kft: 0.628,  ampacity60: 40,  ampacity75: 50,  ampacity90: 55 },
  { awg: "6",  mm2: 13.30,  diameter_in: 0.1620, resistance_ohm_per_kft: 0.395,  ampacity60: 55,  ampacity75: 65,  ampacity90: 75 },
  { awg: "4",  mm2: 21.15,  diameter_in: 0.2043, resistance_ohm_per_kft: 0.249,  ampacity60: 70,  ampacity75: 85,  ampacity90: 95 },
  { awg: "3",  mm2: 26.67,  diameter_in: 0.2294, resistance_ohm_per_kft: 0.197,  ampacity60: 85,  ampacity75: 100, ampacity90: 115 },
  { awg: "2",  mm2: 33.62,  diameter_in: 0.2576, resistance_ohm_per_kft: 0.156,  ampacity60: 95,  ampacity75: 115, ampacity90: 130 },
  { awg: "1",  mm2: 42.41,  diameter_in: 0.2893, resistance_ohm_per_kft: 0.124,  ampacity60: 110, ampacity75: 130, ampacity90: 145 },
  { awg: "1/0", mm2: 53.49, diameter_in: 0.3249, resistance_ohm_per_kft: 0.0983, ampacity60: 125, ampacity75: 150, ampacity90: 170 },
  { awg: "2/0", mm2: 67.43, diameter_in: 0.3648, resistance_ohm_per_kft: 0.0779, ampacity60: 145, ampacity75: 175, ampacity90: 195 },
  { awg: "3/0", mm2: 85.01, diameter_in: 0.4096, resistance_ohm_per_kft: 0.0618, ampacity60: 165, ampacity75: 200, ampacity90: 225 },
  { awg: "4/0", mm2: 107.2, diameter_in: 0.4600, resistance_ohm_per_kft: 0.0490, ampacity60: 195, ampacity75: 230, ampacity90: 260 },
  { awg: "250 kcmil", mm2: 127, diameter_in: 0.5000, resistance_ohm_per_kft: 0.0415, ampacity60: 215, ampacity75: 255, ampacity90: 290 },
  { awg: "300 kcmil", mm2: 152, diameter_in: 0.5477, resistance_ohm_per_kft: 0.0346, ampacity60: 240, ampacity75: 285, ampacity90: 320 },
  { awg: "350 kcmil", mm2: 177, diameter_in: 0.5916, resistance_ohm_per_kft: 0.0297, ampacity60: 260, ampacity75: 310, ampacity90: 350 },
  { awg: "400 kcmil", mm2: 203, diameter_in: 0.6325, resistance_ohm_per_kft: 0.0260, ampacity60: 280, ampacity75: 335, ampacity90: 380 },
  { awg: "500 kcmil", mm2: 253, diameter_in: 0.7071, resistance_ohm_per_kft: 0.0208, ampacity60: 320, ampacity75: 380, ampacity90: 430 },
  { awg: "600 kcmil", mm2: 304, diameter_in: 0.7746, resistance_ohm_per_kft: 0.0173, ampacity60: 350, ampacity75: 420, ampacity90: 475 },
  { awg: "750 kcmil", mm2: 380, diameter_in: 0.8660, resistance_ohm_per_kft: 0.0139, ampacity60: 400, ampacity75: 475, ampacity90: 535 },
  { awg: "1000 kcmil", mm2: 507, diameter_in: 1.0000, resistance_ohm_per_kft: 0.0104, ampacity60: 455, ampacity75: 545, ampacity90: 615 },
];

// Aluminum ≈ 84% of copper ampacity, ≈ 1.6× resistance — applied as a
// simple multiplier to the copper data above. Not a substitute for the
// actual NEC aluminum table for critical work.
const AL_AMP_FACTOR = 0.78;
const AL_RES_FACTOR = 1.64;

function formatOhms(o: number): string {
  if (!isFinite(o)) return "—";
  if (o >= 1) return `${o.toFixed(3)} Ω`;
  if (o >= 1e-3) return `${(o * 1000).toFixed(2)} mΩ`;
  return `${(o * 1e6).toFixed(1)} µΩ`;
}

// ============================================================
// Page
// ============================================================

type Material = "Cu" | "Al";
type System = "1ph" | "3ph" | "dc";

export default function WireAmpacityToolPage() {
  const [wireIdx, setWireIdx] = useState(3); // 12 AWG default
  const [material, setMaterial] = useState<Material>("Cu");
  const [tempRating, setTempRating] = useState<60 | 75 | 90>(75);
  const [system, setSystem] = useState<System>("1ph");
  const [voltage, setVoltage] = useState(240);
  const [current, setCurrent] = useState(20);
  const [length, setLength] = useState(50);
  const [pf, setPf] = useState(1);

  const wire = WIRES[wireIdx];
  const ampacityCu =
    tempRating === 60 ? wire.ampacity60 : tempRating === 75 ? wire.ampacity75 : wire.ampacity90;
  const ampacity = Math.round(material === "Cu" ? ampacityCu : ampacityCu * AL_AMP_FACTOR);
  const resPerKft = material === "Cu" ? wire.resistance_ohm_per_kft : wire.resistance_ohm_per_kft * AL_RES_FACTOR;

  // length in feet → resistance over one-way length
  const oneWayOhms = (resPerKft / 1000) * length;

  // Voltage drop:
  //   single-phase / DC: VD = 2 × I × R_oneway × pf
  //   three-phase:       VD = √3 × I × R_oneway × pf
  const vdrop =
    system === "3ph"
      ? Math.sqrt(3) * current * oneWayOhms * pf
      : 2 * current * oneWayOhms * pf;
  const vdropPct = voltage > 0 ? (vdrop / voltage) * 100 : NaN;
  const ampacityHeadroom = ampacity > 0 ? (current / ampacity) * 100 : NaN;

  const recommended = useMemo(() => {
    // Find smallest wire that keeps VD ≤ 3% AND ampacity ≥ current.
    for (let i = 0; i < WIRES.length; i++) {
      const w = WIRES[i];
      const ampCu =
        tempRating === 60 ? w.ampacity60 : tempRating === 75 ? w.ampacity75 : w.ampacity90;
      const amp = material === "Cu" ? ampCu : ampCu * AL_AMP_FACTOR;
      const r = material === "Cu" ? w.resistance_ohm_per_kft : w.resistance_ohm_per_kft * AL_RES_FACTOR;
      const ow = (r / 1000) * length;
      const vd = system === "3ph" ? Math.sqrt(3) * current * ow * pf : 2 * current * ow * pf;
      const pct = voltage > 0 ? (vd / voltage) * 100 : 100;
      if (amp >= current && pct <= 3) return { wire: w, vdropPct: pct, ampacity: Math.round(amp) };
    }
    return null;
  }, [tempRating, material, length, system, current, pf, voltage]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Wire Gauge &amp; Ampacity
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          AWG ↔ mm², NEC ampacity (60/75/90 °C, copper or aluminum), and
          voltage-drop calculation for single-phase, three-phase, and DC
          circuits.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Conductor size"
            value={wireIdx}
            onChange={setWireIdx}
            options={WIRES.map((w, i) => ({
              value: i,
              label: `${w.awg} (${w.mm2.toFixed(2)} mm²)`,
            }))}
          />
          <Select
            label="Material"
            value={material === "Cu" ? 0 : 1}
            onChange={(v) => setMaterial(v === 0 ? "Cu" : "Al")}
            options={[
              { value: 0, label: "Copper" },
              { value: 1, label: "Aluminum (×0.78 amp, ×1.64 R)" },
            ]}
          />
          <Select
            label="Insulation rating"
            value={tempRating}
            onChange={(v) => setTempRating(v as 60 | 75 | 90)}
            options={[
              { value: 60, label: "60 °C (TW)" },
              { value: 75, label: "75 °C (THW, RHW)" },
              { value: 90, label: "90 °C (THHN, XHHW)" },
            ]}
          />
          <Select
            label="System"
            value={system === "1ph" ? 0 : system === "3ph" ? 1 : 2}
            onChange={(v) => setSystem(v === 0 ? "1ph" : v === 1 ? "3ph" : "dc")}
            options={[
              { value: 0, label: "Single-phase AC" },
              { value: 1, label: "Three-phase AC" },
              { value: 2, label: "DC" },
            ]}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <NumField label="Voltage (V)" value={voltage} step="1" onChange={setVoltage} />
          <NumField label="Load current (A)" value={current} step="0.5" onChange={setCurrent} />
          <NumField label="One-way length (ft)" value={length} step="1" onChange={setLength} />
          <NumField label="Power factor" value={pf} step="0.05" onChange={setPf} />
        </div>
      </section>

      {/* Results */}
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Ampacity">
          <p className="font-mono text-3xl font-semibold text-eng-navy">{ampacity} A</p>
          <p className="mt-1 text-sm text-gray-600">
            NEC 310.16, {tempRating} °C{material === "Al" ? ", aluminum derated" : ""}
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Load uses{" "}
            <strong
              className={
                ampacityHeadroom > 100
                  ? "text-eng-rust"
                  : ampacityHeadroom > 80
                    ? "text-eng-rust"
                    : "text-eng-navy"
              }
            >
              {isFinite(ampacityHeadroom) ? ampacityHeadroom.toFixed(0) : "—"}%
            </strong>{" "}
            of capacity.
          </p>
        </Card>

        <Card title="Voltage drop">
          <p className="font-mono text-3xl font-semibold text-eng-navy">
            {vdrop.toFixed(2)} V
          </p>
          <p
            className={
              "mt-1 text-sm font-semibold " +
              (vdropPct > 5
                ? "text-eng-rust"
                : vdropPct > 3
                  ? "text-eng-rust"
                  : "text-emerald-700")
            }
          >
            {vdropPct.toFixed(2)}% of {voltage} V
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Target: ≤3% branch / ≤5% feeder + branch (NEC informational
            FPN 210.19).
          </p>
        </Card>

        <Card title="Recommended minimum size">
          {recommended ? (
            <>
              <p className="font-mono text-3xl font-semibold text-eng-navy">
                {recommended.wire.awg}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {recommended.wire.mm2.toFixed(2)} mm² · {recommended.ampacity} A ampacity
              </p>
              <p className="mt-3 text-xs text-gray-500">
                Voltage drop at this size: {recommended.vdropPct.toFixed(2)}%
              </p>
            </>
          ) : (
            <p className="text-sm text-eng-rust">
              No standard size meets both ampacity and 3% voltage-drop
              criteria — consider running at higher voltage or in parallel.
            </p>
          )}
        </Card>
      </section>

      {/* Physical & resistance data */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Selected conductor details">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-gray-500">Size</dt>
            <dd className="font-mono text-gray-800">{wire.awg}</dd>
            <dt className="text-gray-500">Cross-section</dt>
            <dd className="font-mono text-gray-800">{wire.mm2.toFixed(2)} mm² ({(wire.mm2 / 0.5067).toFixed(0)} kcmil)</dd>
            <dt className="text-gray-500">Diameter</dt>
            <dd className="font-mono text-gray-800">{wire.diameter_in.toFixed(4)} in ({(wire.diameter_in * 25.4).toFixed(2)} mm)</dd>
            <dt className="text-gray-500">Resistance / kft</dt>
            <dd className="font-mono text-gray-800">{formatOhms(resPerKft)}/kft</dd>
            <dt className="text-gray-500">Resistance at length</dt>
            <dd className="font-mono text-gray-800">{formatOhms(oneWayOhms)} (one-way)</dd>
          </dl>
        </Card>

        <Card title="Ampacity for this size (copper)">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-gray-500">60 °C (TW)</dt>
            <dd className="font-mono text-gray-800">{wire.ampacity60} A</dd>
            <dt className="text-gray-500">75 °C (THW)</dt>
            <dd className="font-mono text-gray-800">{wire.ampacity75} A</dd>
            <dt className="text-gray-500">90 °C (THHN)</dt>
            <dd className="font-mono text-gray-800">{wire.ampacity90} A</dd>
            <dt className="text-gray-500">75 °C aluminum</dt>
            <dd className="font-mono text-gray-800">{Math.round(wire.ampacity75 * AL_AMP_FACTOR)} A</dd>
          </dl>
          <p className="mt-3 text-[11px] text-gray-500">
            Base values from NEC Table 310.16, ≤3 current-carrying
            conductors in a raceway. Apply derating for ambient
            temperature and conduit fill per NEC 310.15.
          </p>
        </Card>
      </section>

      {/* Reference table */}
      <section className="mt-6">
        <Card title="Quick AWG reference table">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-2 py-2">AWG</th>
                  <th className="px-2 py-2 text-right">mm²</th>
                  <th className="px-2 py-2 text-right">Ø in</th>
                  <th className="px-2 py-2 text-right">Ω/kft (Cu)</th>
                  <th className="px-2 py-2 text-right">60 °C</th>
                  <th className="px-2 py-2 text-right">75 °C</th>
                  <th className="px-2 py-2 text-right">90 °C</th>
                </tr>
              </thead>
              <tbody>
                {WIRES.map((w, i) => (
                  <tr
                    key={w.awg}
                    className={
                      "border-t border-gray-100 " +
                      (i === wireIdx ? "bg-eng-navy/5" : "")
                    }
                  >
                    <td className="px-2 py-1.5 font-mono font-semibold">{w.awg}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{w.mm2.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{w.diameter_in.toFixed(4)}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{w.resistance_ohm_per_kft.toFixed(4)}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{w.ampacity60}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{w.ampacity75}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{w.ampacity90}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <p className="mt-6 max-w-3xl text-xs text-gray-500">
        Values are simplified from NEC Table 310.16 (US) for general-purpose
        sizing. Always verify against the current code edition, the
        controlling jurisdiction&rsquo;s amendments, and the actual cable
        manufacturer&rsquo;s datasheet for the installation conditions
        (ambient temperature, conduit fill, termination ratings).
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
