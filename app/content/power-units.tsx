// app/content/power-units.tsx

export default function PowerUnitsPage() {
  return (
    <article className="prose">
      <h1>Power Units</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#components">Components</a></li>
            <li><a href="#pumps">Pump Types</a></li>
            <li><a href="#sizing">Sizing</a></li>
            <li><a href="#cooling-filtration">Cooling &amp; Filtration</a></li>
            <li><a href="#maintenance">Maintenance</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            A hydraulic power unit (HPU) generates and conditions fluid
            power for the machine that uses it. The HPU dictates available
            pressure, flow, and reliability for every downstream actuator.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            HPUs range from suitcase-sized 1 hp portable units to
            multi-hundred-horsepower skids on stamping presses. Match the
            unit to a duty cycle, not to a peak demand.
          </p>

          <h2 id="components">Components</h2>
          <ul>
            <li>Electric motor (typically 1,800 rpm 4-pole TEFC).</li>
            <li>Hydraulic pump.</li>
            <li>Reservoir with breather, level/temperature gauge, cleanout, baffle.</li>
            <li>Suction strainer, return-line filter.</li>
            <li>Pressure relief / unloading valve.</li>
            <li>Manifold for directional &amp; flow control valves.</li>
            <li>Heat exchanger (air or water cooled).</li>
            <li>Accumulator for shock and ride control.</li>
          </ul>

          <h2 id="pumps">Pump Types</h2>
          <ul>
            <li><strong>Gear</strong> — simple, robust, low cost; fixed displacement.</li>
            <li><strong>Vane</strong> — smooth, quieter; balanced or unbalanced.</li>
            <li><strong>Piston (axial / radial)</strong> — high pressure, variable displacement, best efficiency.</li>
            <li><strong>Screw</strong> — very quiet, continuous flow (lubrication systems).</li>
          </ul>

          <h2 id="sizing">Sizing</h2>
          <ul>
            <li><strong>Pump flow:</strong> Q (gpm) = D (cu-in/rev) × N (rpm) / 231</li>
            <li><strong>Motor power:</strong> HP = Q × P / (1714 × η)</li>
            <li><strong>Reservoir:</strong> typically 3–5× pump flow (gpm → gal); &gt;10× for poor cooling environments.</li>
            <li>Verify NPSH available exceeds NPSH required by the pump.</li>
            <li>Plan for fluid expansion (~0.7% per 10 °F rise).</li>
          </ul>

          <h2 id="cooling-filtration">Cooling &amp; Filtration</h2>
          <ul>
            <li>Target steady-state fluid temp 110–140 °F (43–60 °C); never &gt;180 °F (82 °C).</li>
            <li>Heat load ≈ inefficiency × input power.</li>
            <li>Air-blast vs water shell-and-tube; thermostat-controlled fan.</li>
            <li>Filter cleanliness target: <strong>ISO 4406 16/14/11</strong> for servo, 18/16/13 for proportional, 19/17/14 for general.</li>
            <li>Bypass indicator + clogged-filter alarm.</li>
          </ul>

          <h2 id="maintenance">Maintenance</h2>
          <ul>
            <li>Sample oil quarterly; trend particle count, water, TAN, viscosity.</li>
            <li>Replace return filter per ΔP indicator; suction strainer at oil change.</li>
            <li>Inspect hoses for wear, kinks, blisters.</li>
            <li>Check breather; desiccant breathers in humid environments.</li>
            <li>Bleed accumulators before service.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
