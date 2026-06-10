// app/content/industrial-electrical.tsx

export default function IndustrialElectricalPage() {
  return (
    <article className="prose">
      <h1>Industrial Electrical</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#voltages">Common Voltages</a></li>
            <li><a href="#motor-control">Motor Control</a></li>
            <li><a href="#protection">Protection &amp; Coordination</a></li>
            <li><a href="#grounding">Grounding &amp; Bonding</a></li>
            <li><a href="#codes">Codes &amp; Standards</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Industrial electrical work covers everything from incoming
            service through the final control device — switchgear,
            transformers, MCCs, panels, drives, motors, lighting, and
            controls.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Industrial systems are dominated by three-phase power, larger
            currents, harsher environments, and stricter coordination /
            arc-flash requirements than residential or light commercial.
          </p>

          <h2 id="voltages">Common Voltages</h2>
          <ul>
            <li><strong>120 / 208 V</strong> — wye, light loads, receptacles.</li>
            <li><strong>277 / 480 V</strong> — wye, common US industrial.</li>
            <li><strong>480 V</strong> — delta or wye for most motors &lt; 200 HP.</li>
            <li><strong>2,300 / 4,160 V</strong> — medium-voltage for larger motors.</li>
            <li><strong>13.8 / 15 kV</strong> — plant distribution.</li>
            <li><strong>24 VDC</strong> — control power.</li>
          </ul>

          <h2 id="motor-control">Motor Control</h2>
          <ul>
            <li>Across-the-line full-voltage non-reversing (FVNR).</li>
            <li>Reversing (FVR), two-speed, part-winding, wye-delta.</li>
            <li>Soft starters — current-limited solid-state ramp.</li>
            <li>VFDs — wide speed range, energy savings, regenerative braking.</li>
            <li>Servo drives for precise motion.</li>
            <li>Motor data: FLA, locked-rotor, service factor, insulation class (B/F/H).</li>
          </ul>

          <h2 id="protection">Protection &amp; Coordination</h2>
          <ul>
            <li>Overcurrent — fuses (Class CC, J, L, RK), molded-case CBs, ICCBs.</li>
            <li>Short-circuit current rating (SCCR) — UL 508A requirement.</li>
            <li>Selective coordination — clear only the faulted device.</li>
            <li>Arc-flash incident energy per IEEE 1584.</li>
            <li>Ground-fault protection per NEC 230.95 for &gt;1000 A services.</li>
          </ul>

          <h2 id="grounding">Grounding &amp; Bonding</h2>
          <ul>
            <li>System ground (neutral to earth) vs equipment ground (chassis).</li>
            <li>Grounding electrode system — rods, plate, building steel, ufer.</li>
            <li>Bonding jumpers across conduits, fittings, gas/water lines.</li>
            <li>Isolated grounds for sensitive electronics — NEC 250.146(D).</li>
            <li>Per NEC Article 250.</li>
          </ul>

          <h2 id="codes">Codes &amp; Standards</h2>
          <ul>
            <li><strong>NFPA 70 (NEC)</strong> — installation.</li>
            <li><strong>NFPA 70E</strong> — workplace electrical safety.</li>
            <li><strong>NFPA 79</strong> — industrial machinery electrical.</li>
            <li><strong>UL 508A</strong> — industrial control panels.</li>
            <li><strong>UL 845</strong> — MCCs.</li>
            <li><strong>IEEE 141 / 142 / 242 / 399 / 1584</strong> — the &ldquo;color books&rdquo;.</li>
            <li><strong>IEC 60204-1</strong> — machinery electrical (international).</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
