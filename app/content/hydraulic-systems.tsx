// app/content/hydraulic-systems.tsx

export default function HydraulicSystemsPage() {
  return (
    <article className="prose">
      <h1>Hydraulic Systems</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#circuit-types">Circuit Types</a></li>
            <li><a href="#components">Components</a></li>
            <li><a href="#formulas">Key Formulas</a></li>
            <li><a href="#fluids">Fluids</a></li>
            <li><a href="#troubleshooting">Troubleshooting</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Hydraulic systems transmit power through pressurized fluid. They
            deliver enormous force in a compact envelope and are ideal for
            heavy lifting, pressing, clamping, holding load with the system
            de-energized, and precise speed under varying load.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Pascal&rsquo;s principle: pressure applied to a confined fluid is
            transmitted equally in all directions. A small pump can move a
            large load by giving up speed for force.
          </p>

          <h2 id="circuit-types">Circuit Types</h2>
          <ul>
            <li><strong>Open-loop</strong> — fixed or variable pump draws from a reservoir, fluid returns via a directional valve. Industrial standard.</li>
            <li><strong>Closed-loop</strong> — pump and motor share a closed fluid path; common in mobile / hydrostatic drives.</li>
            <li><strong>Load-sensing</strong> — pump output tracks the highest demand pressure, saving energy.</li>
          </ul>

          <h2 id="components">Components</h2>
          <ul>
            <li>Pump (gear, vane, piston).</li>
            <li>Reservoir, breather, level &amp; temperature gauges.</li>
            <li>Filters — suction strainer, pressure, return.</li>
            <li>Directional control valves (2/3/4-way, 2/3-position).</li>
            <li>Pressure control — relief, reducing, sequence, unloading, counterbalance.</li>
            <li>Flow control — needle, pressure-compensated, proportional.</li>
            <li>Actuators — cylinders &amp; motors.</li>
            <li>Accumulators — bladder, piston, diaphragm.</li>
            <li>Heat exchangers; servo / proportional valves for closed-loop control.</li>
          </ul>

          <h2 id="formulas">Key Formulas</h2>
          <ul>
            <li><strong>Force:</strong> F (lbf) = P (psi) × A (in²)</li>
            <li><strong>Cylinder speed:</strong> v (in/s) = (Q gpm × 3.85) / A (in²)</li>
            <li><strong>Pump output:</strong> Q (gpm) = D (cu-in/rev) × N (rpm) / 231</li>
            <li><strong>Motor torque:</strong> T (in-lbf) = (P × D) / (2π × η<sub>m</sub>)</li>
            <li><strong>Hydraulic HP:</strong> HP = (Q × P) / 1714</li>
          </ul>

          <h2 id="fluids">Fluids</h2>
          <ul>
            <li>Mineral oil (ISO VG 32, 46, 68) — most common.</li>
            <li>Fire-resistant: water-glycol, invert emulsion, phosphate ester.</li>
            <li>Biodegradable: HEES, HEPG (mobile / marine).</li>
            <li>Viscosity index, pour point, oxidation resistance, additive package.</li>
            <li>Target cleanliness per ISO 4406 (e.g. 18/16/13 for typical industrial).</li>
          </ul>

          <h2 id="troubleshooting">Troubleshooting</h2>
          <ul>
            <li><strong>Noise</strong> — cavitation (suction restriction), aeration (loose fitting), worn pump.</li>
            <li><strong>Heat</strong> — internal leakage, undersized cooler, relief valve passing.</li>
            <li><strong>Slow / weak</strong> — pump worn, relief set low, internal cylinder leakage.</li>
            <li><strong>Drift</strong> — control valve leakage, holding circuit failure.</li>
            <li>Always start with fluid level, temperature, cleanliness, and filter ΔP.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
