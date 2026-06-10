// app/content/aerospace-engineering.tsx

export default function AerospaceEngineeringPage() {
  return (
    <article className="prose">
      <h1>Aerospace Engineering</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#aerodynamics">Aerodynamics</a></li>
            <li><a href="#propulsion">Propulsion</a></li>
            <li><a href="#structures-materials">Structures &amp; Materials</a></li>
            <li><a href="#avionics-controls">Avionics &amp; Controls</a></li>
            <li><a href="#standards">Standards</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Aerospace engineering covers atmospheric flight (aeronautics) and
            spaceflight (astronautics) — fixed- and rotary-wing aircraft,
            UAVs, missiles, launch vehicles, and spacecraft.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Aerospace is dominated by tight weight budgets, severe
            environments, and life-safety certification. Every gram is
            tracked; every part has a paper trail; every assumption is
            verified.
          </p>

          <h2 id="aerodynamics">Aerodynamics</h2>
          <ul>
            <li><strong>Lift:</strong> L = ½·ρ·V²·S·C<sub>L</sub></li>
            <li><strong>Drag:</strong> D = ½·ρ·V²·S·C<sub>D</sub></li>
            <li><strong>Reynolds:</strong> Re = ρVL/μ — viscous vs inertial.</li>
            <li><strong>Mach:</strong> M = V/a — subsonic, transonic, supersonic, hypersonic.</li>
            <li>Boundary layers, airfoil sections (NACA), wing planform, shock waves.</li>
          </ul>

          <h2 id="propulsion">Propulsion</h2>
          <ul>
            <li><strong>Thrust:</strong> F = ṁ·(V<sub>e</sub> − V<sub>0</sub>) + (p<sub>e</sub> − p<sub>0</sub>)·A<sub>e</sub></li>
            <li><strong>Specific impulse:</strong> I<sub>sp</sub> = F / (ṁ·g₀)</li>
            <li><strong>Tsiolkovsky:</strong> Δv = I<sub>sp</sub>·g₀·ln(m₀/m<sub>f</sub>)</li>
            <li>Turbojet, turbofan, turboprop, ramjet, scramjet, rocket (LOX/RP-1, LOX/LH2, hypergolic, solid).</li>
          </ul>

          <h2 id="structures-materials">Structures &amp; Materials</h2>
          <ul>
            <li>Semi-monocoque skin-stringer-frame construction.</li>
            <li>Materials: 2024-T3 / 7075-T6 aluminum, Ti-6Al-4V, Inconel, CFRP, honeycomb sandwich.</li>
            <li>Fatigue &amp; damage tolerance (FAR 25.571).</li>
            <li>Static, fatigue, flutter, and bird-strike testing.</li>
          </ul>

          <h2 id="avionics-controls">Avionics &amp; Controls</h2>
          <ul>
            <li>Flight control laws (mode-blending, fly-by-wire).</li>
            <li>Buses: ARINC 429, ARINC 664 (AFDX), MIL-STD-1553, CAN, TTEthernet.</li>
            <li>Inertial navigation (IMU/INS) blended with GNSS.</li>
            <li>DO-178C software, DO-254 hardware, DO-160 environmental.</li>
          </ul>

          <h2 id="standards">Standards</h2>
          <ul>
            <li><strong>FAR / EASA CS-25, CS-23</strong> — airworthiness.</li>
            <li><strong>RTCA DO-178C / DO-254 / DO-160</strong>.</li>
            <li><strong>AS9100</strong> — aerospace quality management.</li>
            <li><strong>NASA-STD-5001 / 5012</strong> — structural design.</li>
            <li><strong>ECSS</strong> — European space standards.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
