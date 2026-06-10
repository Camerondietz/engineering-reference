// app/content/chemical-engineering.tsx

export default function ChemicalEngineeringPage() {
  return (
    <article className="prose">
      <h1>Chemical Engineering</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#unit-operations">Unit Operations</a></li>
            <li><a href="#mass-energy-balances">Mass &amp; Energy Balances</a></li>
            <li><a href="#reactor-design">Reactor Design</a></li>
            <li><a href="#process-safety">Process Safety</a></li>
            <li><a href="#tools-and-standards">Tools &amp; Standards</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Chemical engineering scales molecular-level chemistry to
            industrial processes — refining, petrochemicals, pharmaceuticals,
            food, polymers, semiconductors, and clean energy.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            The discipline rests on three legs: <strong>transport
            phenomena</strong> (momentum, heat, mass), <strong>thermodynamics
            &amp; kinetics</strong> (equilibrium and reaction rates), and{" "}
            <strong>unit operations &amp; process design</strong>. PFDs and
            P&amp;IDs are the working drawings of the field.
          </p>

          <h2 id="unit-operations">Unit Operations</h2>
          <ul>
            <li><strong>Separations</strong> — distillation, absorption, extraction, membrane, crystallization.</li>
            <li><strong>Heat transfer</strong> — shell-and-tube and plate exchangers, fired heaters, reboilers.</li>
            <li><strong>Fluid flow</strong> — pumps, compressors, control valves, piping.</li>
            <li><strong>Reaction</strong> — CSTR, PFR, batch, packed-bed, fluidized-bed.</li>
            <li><strong>Solids handling</strong> — drying, milling, conveying, filtration.</li>
          </ul>

          <h2 id="mass-energy-balances">Mass &amp; Energy Balances</h2>
          <p>
            Steady-state inputs equal outputs plus accumulation. Always
            define the system boundary first, then write a balance on each
            component and on total enthalpy. McCabe&ndash;Thiele, Ponchon&ndash;Savarit,
            and shortcut Fenske&ndash;Underwood&ndash;Gilliland methods are still the
            fastest way to size a distillation column before rigorous
            simulation.
          </p>

          <h2 id="reactor-design">Reactor Design</h2>
          <ul>
            <li><strong>Batch:</strong> dC<sub>A</sub>/dt = −r<sub>A</sub></li>
            <li><strong>CSTR:</strong> V = F<sub>A0</sub>·X / (−r<sub>A</sub>)</li>
            <li><strong>PFR:</strong> V = F<sub>A0</sub> · ∫₀ˣ dX / (−r<sub>A</sub>)</li>
            <li><strong>Arrhenius:</strong> k = A·exp(−E<sub>a</sub>/RT)</li>
          </ul>

          <h2 id="process-safety">Process Safety</h2>
          <p>
            Loss of containment is the dominant hazard. Standard tools:
            HAZOP, LOPA, what-if/checklist, FMEA. SIL ratings (per IEC 61511)
            quantify the risk reduction of safety instrumented functions.
            OSHA <strong>29 CFR 1910.119</strong> (PSM) governs facilities
            handling highly hazardous chemicals.
          </p>

          <h2 id="tools-and-standards">Tools &amp; Standards</h2>
          <ul>
            <li><strong>Simulation:</strong> Aspen Plus, Aspen HYSYS, ChemCAD, PRO/II, gPROMS.</li>
            <li><strong>Heat exchangers:</strong> HTRI, Aspen EDR.</li>
            <li><strong>Process safety:</strong> PHAST, DNV Safeti.</li>
            <li><strong>Standards:</strong> ASME B31.3 (process piping), API 520/521 (relief), API 650 (tanks), ISA-5.1 (P&amp;ID symbols).</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
