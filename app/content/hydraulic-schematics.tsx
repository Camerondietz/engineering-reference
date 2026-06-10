// app/content/hydraulic-schematics.tsx

export default function HydraulicSchematicsPage() {
  return (
    <article className="prose">
      <h1>Hydraulic Schematics</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#symbols">Symbol Standard</a></li>
            <li><a href="#common-symbols">Common Symbols</a></li>
            <li><a href="#reading">Reading a Schematic</a></li>
            <li><a href="#circuits">Common Circuits</a></li>
            <li><a href="#tools">Drafting Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            A hydraulic schematic shows how fluid power components connect.
            It uses standardized symbols so any trained technician can
            read, troubleshoot, and modify the circuit without seeing the
            physical machine.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Schematics show <em>function</em>, not physical arrangement.
            They are read top-down (or following flow from pump to
            actuator and back to tank).
          </p>

          <h2 id="symbols">Symbol Standard</h2>
          <ul>
            <li>International: <strong>ISO 1219-1</strong> (symbols) and <strong>ISO 1219-2</strong> (component identification).</li>
            <li>ANSI/(NFPA) T3.10.1, derived from ISO 1219.</li>
            <li>Lines: solid = working, dashed = pilot/drain, double = mechanical link.</li>
            <li>Squares (envelopes) represent valves; arrows show flow paths in each position.</li>
          </ul>

          <h2 id="common-symbols">Common Symbols</h2>
          <ul>
            <li><strong>Pump</strong> — circle with arrow(s); one arrow = uni-direction, two = bi-direction.</li>
            <li><strong>Motor</strong> — circle with reversed arrow.</li>
            <li><strong>Cylinder</strong> — rectangle with piston rod.</li>
            <li><strong>Reservoir</strong> — open rectangle.</li>
            <li><strong>Directional control valve</strong> — joined envelopes (one per position); 4/3 = 4-way, 3-position.</li>
            <li><strong>Check valve</strong> — ball seating against an arrow.</li>
            <li><strong>Relief valve</strong> — square with diagonal arrow and adjustable spring.</li>
            <li><strong>Filter</strong> — diamond shape; <strong>cooler</strong> — diamond with arrows out.</li>
            <li><strong>Pressure gauge</strong> — circle with line indicator.</li>
            <li><strong>Accumulator</strong> — oval with gas/separator detail.</li>
          </ul>

          <h2 id="reading">Reading a Schematic</h2>
          <ol>
            <li>Find the pump and prime mover; note fixed vs variable displacement.</li>
            <li>Follow pressure line through filters, relief, manifold.</li>
            <li>Trace through each directional valve in its shown (de-energized / neutral) position.</li>
            <li>Identify each actuator and its return path.</li>
            <li>Check pilot, drain, and case lines (often easy to miss).</li>
            <li>Read port labels: P (pressure), T (tank), A &amp; B (work), X (pilot), Y (drain).</li>
          </ol>

          <h2 id="circuits">Common Circuits</h2>
          <ul>
            <li><strong>Meter-in / meter-out</strong> speed control.</li>
            <li><strong>Regenerative</strong> — A and B sides connected for high extend speed.</li>
            <li><strong>Sequence</strong> — pressure-staged operations.</li>
            <li><strong>Counterbalance</strong> — holds load against gravity.</li>
            <li><strong>Pilot-operated check</strong> — locked cylinder, released by pilot.</li>
            <li><strong>Unloading</strong> — dumps pump flow to tank at low pressure to save power.</li>
          </ul>

          <h2 id="tools">Drafting Tools</h2>
          <ul>
            <li>AutoCAD, AutoCAD Electrical, EPLAN Fluid, ProPneu / FluidSIM (Festo).</li>
            <li>Automation Studio, Hyflo, FluidDraw (Festo) for simulation.</li>
            <li>Always include a parts list keyed to symbol callouts (1, 2, 3 …).</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
