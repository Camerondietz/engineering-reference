// app/content/hydraulic-cylinders.tsx

export default function HydraulicCylindersPage() {
  return (
    <article className="prose">
      <h1>Hydraulic Cylinders</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#construction">Construction</a></li>
            <li><a href="#sizing">Sizing &amp; Force</a></li>
            <li><a href="#mounting">Mounting Styles</a></li>
            <li><a href="#seals">Seals</a></li>
            <li><a href="#maintenance">Maintenance &amp; Failures</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Hydraulic cylinders are fluid-powered linear actuators. They
            deliver high force (thousands to millions of pounds) in a
            compact envelope and are the primary motion element in presses,
            heavy equipment, injection molders, and steel mills.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Typical industrial cylinders operate at 1,500–3,000 psi. Mobile
            and heavy-press cylinders run 3,000–5,000+ psi.
          </p>

          <h2 id="construction">Construction</h2>
          <ul>
            <li><strong>Tie-rod</strong> — bolted-up; the NFPA industrial standard. Repairable in the field.</li>
            <li><strong>Welded body</strong> — for higher pressures, mobile, &amp; shock loads.</li>
            <li><strong>Mill / heavy-duty</strong> — large bore, heavy-wall, removable rod cartridges.</li>
            <li><strong>Telescoping</strong> — long stroke from short retracted length (dump bodies).</li>
            <li><strong>Position-feedback</strong> — built-in magnetostrictive or LVDT for servo-control.</li>
          </ul>

          <h2 id="sizing">Sizing &amp; Force</h2>
          <ul>
            <li><strong>Extend force:</strong> F = P × (π/4) × D²</li>
            <li><strong>Retract force:</strong> F = P × (π/4) × (D² − d²)</li>
            <li>Apply 1.25–2.0 design factor.</li>
            <li><strong>Buckling:</strong> use Euler/Johnson with the rod&rsquo;s effective length determined by mounting style.</li>
            <li>Check minimum rod diameter chart from the cylinder OEM.</li>
            <li>Calculate flow needed: Q = (Area × Speed); verify pump &amp; valve sizing.</li>
          </ul>

          <h2 id="mounting">Mounting Styles</h2>
          <ul>
            <li><strong>MF1 / MF2</strong> — front / rear flange.</li>
            <li><strong>MS2 / MS4</strong> — side lugs / side feet.</li>
            <li><strong>MP1 / MP2 / MP3</strong> — clevis (fixed, detachable, eye).</li>
            <li><strong>MT4</strong> — intermediate fixed trunnion.</li>
            <li>Pivot mounts (clevis, trunnion) reduce side-loading.</li>
          </ul>

          <h2 id="seals">Seals</h2>
          <ul>
            <li><strong>Piston seals</strong> — single- or double-acting; PTFE-with-elastomer-energizer or polyurethane lip.</li>
            <li><strong>Rod seals</strong> — primary + secondary; polyurethane is the most common.</li>
            <li><strong>Wiper / scraper</strong> — keeps contamination out of the rod side.</li>
            <li><strong>Static seals</strong> — O-rings, often with backup rings.</li>
            <li>Material compatibility: NBR (mineral oil), FKM (high temp / aggressive fluid), HNBR, PTFE.</li>
          </ul>

          <h2 id="maintenance">Maintenance &amp; Failures</h2>
          <ul>
            <li>Most failures come from contamination — keep fluid clean per ISO 4406.</li>
            <li>Rod scoring → wiper failure → contamination ingress → seal failure (cycle).</li>
            <li>External leakage usually means rod seal; internal leakage (drift) means piston seal.</li>
            <li>Always reseal in a clean environment; check rod for nicks before reassembly.</li>
            <li>Bleed air after a service to prevent stick-slip and shock.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
