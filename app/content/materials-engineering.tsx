// app/content/materials-engineering.tsx

export default function MaterialsEngineeringPage() {
  return (
    <article className="prose">
      <h1>Materials Engineering</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#material-classes">Material Classes</a></li>
            <li><a href="#properties">Common Properties</a></li>
            <li><a href="#heat-treatment">Heat Treatment</a></li>
            <li><a href="#failure-modes">Failure Modes</a></li>
            <li><a href="#testing">Testing &amp; Standards</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Materials engineering links the internal structure of a material
            (atomic, crystalline, microstructural) to its bulk properties and
            to the processes that produce it. The same chemistry can yield
            wildly different behavior depending on grain size, phase, and
            residual stress.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Selection starts by matching service requirements — load,
            temperature, environment, life — to the material&rsquo;s strength,
            stiffness, toughness, corrosion resistance, and cost.
            Ashby charts are the canonical visual tool for this trade-off.
          </p>

          <h2 id="material-classes">Material Classes</h2>
          <ul>
            <li><strong>Metals</strong> — steels (carbon, alloy, stainless, tool), aluminum (1xxx–7xxx), copper alloys, titanium, nickel superalloys.</li>
            <li><strong>Polymers</strong> — thermoplastics (PE, PP, PC, ABS, Nylon, PEEK), thermosets (epoxy, phenolic), elastomers (NBR, EPDM, Viton).</li>
            <li><strong>Ceramics</strong> — alumina, zirconia, silicon carbide, glasses.</li>
            <li><strong>Composites</strong> — CFRP, GFRP, metal-matrix, sandwich.</li>
            <li><strong>Semiconductors</strong> — Si, Ge, GaAs, GaN, SiC.</li>
          </ul>

          <h2 id="properties">Common Properties</h2>
          <ul>
            <li><strong>Strength</strong> — yield, ultimate, fatigue limit.</li>
            <li><strong>Stiffness</strong> — Young&rsquo;s modulus E, shear G, bulk K.</li>
            <li><strong>Toughness</strong> — area under stress-strain; K<sub>IC</sub> for fracture.</li>
            <li><strong>Hardness</strong> — Brinell (HB), Rockwell (HRC/HRB), Vickers (HV).</li>
            <li><strong>Thermal</strong> — k (conductivity), α (CTE), c<sub>p</sub>.</li>
            <li><strong>Density</strong> — ρ (kg/m³).</li>
          </ul>

          <h2 id="heat-treatment">Heat Treatment</h2>
          <ul>
            <li><strong>Annealing</strong> — soften, relieve stress, improve ductility.</li>
            <li><strong>Normalizing</strong> — refine grain after forging/welding.</li>
            <li><strong>Quench &amp; temper</strong> — harden then toughen martensite.</li>
            <li><strong>Case hardening</strong> — carburizing, nitriding, induction.</li>
            <li><strong>Solution + aging</strong> — precipitation hardening (e.g. 17-4 PH, 7075-T6).</li>
          </ul>

          <h2 id="failure-modes">Failure Modes</h2>
          <ul>
            <li>Ductile and brittle fracture.</li>
            <li>Fatigue (high-cycle, low-cycle, thermal).</li>
            <li>Creep at elevated temperature (&gt;0.4 T<sub>m</sub>).</li>
            <li>Corrosion — uniform, galvanic, pitting, crevice, SCC, MIC.</li>
            <li>Wear — adhesive, abrasive, erosive, fretting.</li>
          </ul>

          <h2 id="testing">Testing &amp; Standards</h2>
          <ul>
            <li><strong>Tensile</strong> — ASTM E8 / ISO 6892.</li>
            <li><strong>Hardness</strong> — ASTM E10 (Brinell), E18 (Rockwell), E92 (Vickers).</li>
            <li><strong>Impact (Charpy)</strong> — ASTM E23.</li>
            <li><strong>Fatigue</strong> — ASTM E466.</li>
            <li><strong>NDT</strong> — UT, RT, MT, PT, ET per ASNT SNT-TC-1A.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
