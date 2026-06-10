// app/content/cylinders.tsx

export default function CylindersPage() {
  return (
    <article className="prose">
      <h1>Cylinders</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#types">Types</a></li>
            <li><a href="#sizing">Sizing &amp; Force Calculation</a></li>
            <li><a href="#mounting">Mounting Styles</a></li>
            <li><a href="#cushioning">Cushioning &amp; Speed</a></li>
            <li><a href="#seals">Seals &amp; Maintenance</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Cylinders are linear actuators that convert pneumatic or
            hydraulic pressure into a controlled push/pull force. They are
            the most common motion element in industrial automation.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            A cylinder consists of a barrel, piston, rod, end caps, and
            seals. Pressure on one side of the piston creates force; flow
            into that side creates motion.
          </p>

          <h2 id="types">Types</h2>
          <ul>
            <li><strong>Single-acting</strong> — pressure extends, spring retracts (or vice-versa).</li>
            <li><strong>Double-acting</strong> — pressure on both ports; most common.</li>
            <li><strong>Rodless</strong> — magnetic / band-coupled; long strokes in tight spaces.</li>
            <li><strong>Telescoping</strong> — long stroke in short retracted length.</li>
            <li><strong>Tandem / duplex</strong> — multiplied force.</li>
            <li><strong>Through-rod</strong> — equal area both sides; equal force &amp; speed.</li>
            <li><strong>Rotary actuator</strong> — limited-angle rotation (rack &amp; pinion, vane).</li>
          </ul>

          <h2 id="sizing">Sizing &amp; Force Calculation</h2>
          <ul>
            <li><strong>Extend force:</strong> F = P × A<sub>piston</sub></li>
            <li><strong>Retract force:</strong> F = P × (A<sub>piston</sub> − A<sub>rod</sub>)</li>
            <li><strong>Piston area:</strong> A = π·D²/4</li>
            <li>Apply a safety / dynamic factor of ~1.25–2 for sizing.</li>
            <li>Check rod buckling per Euler at full stroke extension.</li>
            <li>Verify air consumption (pneumatic) — scfm at duty cycle.</li>
          </ul>

          <h2 id="mounting">Mounting Styles</h2>
          <ul>
            <li><strong>Foot / side</strong> — rigid frame mount.</li>
            <li><strong>Flange</strong> — at front (head) or rear (cap).</li>
            <li><strong>Clevis</strong> — pivot at rear; rod end is also pivoted.</li>
            <li><strong>Trunnion</strong> — pivots at midpoint for angular motion.</li>
            <li><strong>Tie-rod</strong> mounts (NFPA pneumatic standard MR-series).</li>
          </ul>

          <h2 id="cushioning">Cushioning &amp; Speed</h2>
          <ul>
            <li>End-of-stroke cushions decelerate the load — adjustable needle valves on most cylinders.</li>
            <li>External shock absorbers for high-energy loads.</li>
            <li>Speed control: meter-out preferred (back-pressure smooths motion).</li>
            <li>Typical pneumatic speeds: 0.1–1 m/s; hydraulic: 0.05–0.5 m/s.</li>
          </ul>

          <h2 id="seals">Seals &amp; Maintenance</h2>
          <ul>
            <li>Rod, piston, wiper, and static seals — typically NBR, FKM (Viton), or polyurethane.</li>
            <li>Match seal material to fluid &amp; temperature (mineral oil, water-glycol, food-grade air).</li>
            <li>Common failure mode: contamination (dirty air/oil) wearing seals.</li>
            <li>Replace rod seals if leakage exceeds vendor spec; resize before installing new seals.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
