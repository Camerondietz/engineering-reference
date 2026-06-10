// app/content/mechanical-engineering.tsx

export default function MechanicalEngineeringPage() {
  return (
    <article className="prose">
      <h1>Mechanical Engineering</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#core-disciplines">Core Disciplines</a></li>
            <li><a href="#essential-formulas">Essential Formulas</a></li>
            <li><a href="#materials-and-manufacturing">Materials &amp; Manufacturing</a></li>
            <li><a href="#standards">Standards</a></li>
            <li><a href="#typical-tools">Typical Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Mechanical engineering applies physics, materials science, and
            mathematics to the design, analysis, manufacture, and maintenance
            of mechanical systems — from microscale MEMS sensors to
            power-plant turbines.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            The discipline rests on four pillars: <strong>statics and
            dynamics</strong> (forces and motion), <strong>mechanics of
            materials</strong> (stress, strain, deflection), <strong>thermo-fluid
            sciences</strong> (heat, work, fluid flow), and <strong>design and
            manufacturing</strong> (turning analysis into hardware). Modern
            practice layers computation — FEA, CFD, MBD — on top of these
            fundamentals.
          </p>

          <h2 id="core-disciplines">Core Disciplines</h2>
          <ul>
            <li><strong>Statics &amp; dynamics</strong> — equilibrium, free-body diagrams, Newton&rsquo;s laws, kinematics of rigid bodies.</li>
            <li><strong>Mechanics of materials</strong> — axial, bending, torsion, combined stress, beam deflection, fatigue.</li>
            <li><strong>Thermodynamics</strong> — first &amp; second laws, Carnot, Rankine, Brayton, refrigeration cycles.</li>
            <li><strong>Heat transfer</strong> — conduction (Fourier), convection (Newton&rsquo;s law of cooling), radiation (Stefan–Boltzmann).</li>
            <li><strong>Fluid mechanics</strong> — Bernoulli, continuity, Navier–Stokes, Reynolds number, pipe flow.</li>
            <li><strong>Machine design</strong> — gears, bearings, shafts, fasteners, springs, clutches, brakes.</li>
            <li><strong>Vibrations &amp; controls</strong> — natural frequency, damping, resonance, feedback control.</li>
          </ul>

          <h2 id="essential-formulas">Essential Formulas</h2>
          <ul>
            <li><strong>Axial stress:</strong> σ = F / A</li>
            <li><strong>Bending stress:</strong> σ = M·c / I</li>
            <li><strong>Torsional stress:</strong> τ = T·r / J</li>
            <li><strong>Hooke&rsquo;s law:</strong> σ = E·ε</li>
            <li><strong>Reynolds number:</strong> Re = ρVD / μ</li>
            <li><strong>Bernoulli (incompressible):</strong> P + ½ρV² + ρgh = constant</li>
            <li><strong>Heat conduction (1-D):</strong> q = −k·dT/dx</li>
            <li><strong>Carnot efficiency:</strong> η = 1 − T<sub>C</sub> / T<sub>H</sub></li>
            <li><strong>Power:</strong> P = T·ω (rotary), P = F·V (linear)</li>
          </ul>

          <h2 id="materials-and-manufacturing">Materials &amp; Manufacturing</h2>
          <p>
            Common materials: carbon &amp; alloy steels, stainless (300/400
            series), aluminum (6061-T6, 7075), brass, bronze, titanium,
            engineering polymers (Delrin, UHMW, PEEK). Standard processes —
            machining, casting, forging, stamping, injection molding, welding,
            additive — each have characteristic tolerances, finishes, and DFM
            rules that drive cost and lead time.
          </p>

          <h2 id="standards">Standards</h2>
          <ul>
            <li><strong>ASME Y14.5</strong> — Geometric Dimensioning &amp; Tolerancing (GD&amp;T).</li>
            <li><strong>ASME BPVC</strong> — Boiler &amp; Pressure Vessel Code.</li>
            <li><strong>ASME B31</strong> — Pressure piping (B31.1 power, B31.3 process).</li>
            <li><strong>ISO 2768</strong> — General tolerances for linear &amp; angular dimensions.</li>
            <li><strong>ISO 286</strong> — Limits &amp; fits.</li>
            <li><strong>ANSI/ASME B18</strong> — Fastener dimensions.</li>
          </ul>

          <h2 id="typical-tools">Typical Tools</h2>
          <ul>
            <li><strong>CAD:</strong> SolidWorks, Inventor, NX, Creo, Fusion 360, CATIA.</li>
            <li><strong>FEA:</strong> ANSYS Mechanical, Abaqus, NX Nastran, SolidWorks Simulation.</li>
            <li><strong>CFD:</strong> ANSYS Fluent, STAR-CCM+, OpenFOAM.</li>
            <li><strong>MBD/dynamics:</strong> MSC Adams, Simulink/Simscape.</li>
            <li><strong>Calculation:</strong> MathCAD, MATLAB, Excel + engineering toolkits.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
