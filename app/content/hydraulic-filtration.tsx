// app/content/hydraulic-filtration.tsx

export default function HydraulicFiltrationPage() {
  return (
    <article className="prose">
      <h1>Hydraulic Filtration</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#cleanliness-codes">ISO 4406 Cleanliness Codes</a></li>
            <li><a href="#beta-ratio">Beta Ratio &amp; Efficiency</a></li>
            <li><a href="#filter-locations">Filter Locations</a></li>
            <li><a href="#offline">Offline / Kidney-Loop</a></li>
            <li><a href="#oil-analysis">Oil Analysis</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Contamination causes about 75% of hydraulic system failures.
            Effective filtration is the cheapest reliability improvement
            available — it pays back faster than almost any other capital
            investment in a hydraulic system.
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li>Targets contaminants: hard particles, water, air, additive depletion, oxidation by-products.</li>
            <li>Goal is not just &ldquo;new oil&rdquo; — new oil is typically <strong>dirtier</strong> than the system requires.</li>
            <li>Trend ISO codes over time; rising counts indicate a problem.</li>
          </ul>

          <h2 id="cleanliness-codes">ISO 4406 Cleanliness Codes</h2>
          <p>
            Three numbers (e.g. <strong>18/16/13</strong>) representing the
            count of particles per mL greater than 4 µm, 6 µm, and 14 µm,
            mapped to a scale code.
          </p>
          <ul>
            <li>Servo / proportional valves: <strong>16/14/11</strong> or cleaner.</li>
            <li>Industrial proportional / piston pump: <strong>18/16/13</strong>.</li>
            <li>General industrial / mobile: <strong>20/18/15</strong>.</li>
            <li>Each code step doubles the particle count.</li>
          </ul>

          <h2 id="beta-ratio">Beta Ratio &amp; Efficiency</h2>
          <ul>
            <li>β<sub>x</sub> = upstream particle count ≥ x µm ÷ downstream count.</li>
            <li>β<sub>10</sub> = 200 ⇒ efficiency = (200−1)/200 = 99.5% at 10 µm.</li>
            <li>Specify with the size in micrometers — &ldquo;10 µm at β=200&rdquo;.</li>
            <li>ISO 16889 multi-pass test is the standard rating method.</li>
          </ul>

          <h2 id="filter-locations">Filter Locations</h2>
          <ul>
            <li><strong>Suction</strong> — protects the pump; coarse (~100 µm) to avoid cavitation.</li>
            <li><strong>Pressure</strong> — fine; protects servo / proportional valves downstream of the pump.</li>
            <li><strong>Return</strong> — most common location; bulk filtration before fluid returns to tank.</li>
            <li><strong>Reservoir breather</strong> — desiccant in humid environments to keep water out.</li>
            <li>Always specify ΔP indicators and a bypass on pressure / return filters.</li>
          </ul>

          <h2 id="offline">Offline / Kidney-Loop</h2>
          <ul>
            <li>A dedicated low-flow loop continuously polishes the reservoir.</li>
            <li>Lets you use very fine filters without affecting main system response.</li>
            <li>Best ROI on systems with intermittent duty, where pressure / return filters see few passes.</li>
            <li>Often combined with water removal (vacuum dehydrator or coalescer).</li>
          </ul>

          <h2 id="oil-analysis">Oil Analysis</h2>
          <ul>
            <li>Sample from a live, mid-stream point (test port, not the drain).</li>
            <li>Standard tests: ISO particle count, viscosity, water (Karl Fischer), TAN, ICP elemental, FTIR.</li>
            <li>Trend over time — single readings are noisy.</li>
            <li>Action limits: rising wear metals → component wear; rising silicon → dirt ingress; rising water → seal or breather issue.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
