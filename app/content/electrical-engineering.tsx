// app/content/electrical-engineering.tsx

export default function ElectricalEngineeringPage() {
  return (
    <article className="prose">
      <h1>Electrical Engineering</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#fundamentals">Fundamentals</a></li>
            <li><a href="#core-laws">Core Laws &amp; Formulas</a></li>
            <li><a href="#power-systems">Power Systems</a></li>
            <li><a href="#electronics">Electronics</a></li>
            <li><a href="#standards">Standards</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Electrical engineering covers the generation, transmission, and
            use of electrical energy and the design of analog and digital
            electronic systems — from microwatt sensors to gigawatt grids.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            The field splits into <strong>power</strong> (generation,
            transmission, distribution, motors), <strong>electronics</strong>{" "}
            (analog, digital, mixed-signal, RF), <strong>communications and
            signals</strong>, <strong>controls</strong>, and{" "}
            <strong>computer engineering</strong>. Most working engineers
            specialize in one or two areas but draw on all of them.
          </p>

          <h2 id="fundamentals">Fundamentals</h2>
          <ul>
            <li><strong>Voltage, current, resistance, power</strong> — V, I, R, P.</li>
            <li><strong>AC vs DC</strong> — RMS values, frequency, phase, reactive power.</li>
            <li><strong>Impedance</strong> — combined resistance + reactance (Z = R + jX).</li>
            <li><strong>Three-phase power</strong> — wye vs delta, line vs phase quantities.</li>
            <li><strong>Power factor</strong> — cos(φ); correction with capacitor banks.</li>
            <li><strong>Magnetic circuits</strong> — transformers, motors, solenoids.</li>
          </ul>

          <h2 id="core-laws">Core Laws &amp; Formulas</h2>
          <ul>
            <li><strong>Ohm&rsquo;s law:</strong> V = I·R</li>
            <li><strong>Power:</strong> P = V·I = I²·R = V²/R</li>
            <li><strong>Three-phase power:</strong> P = √3 · V<sub>L</sub> · I<sub>L</sub> · cos(φ)</li>
            <li><strong>Kirchhoff:</strong> ΣV around loop = 0, ΣI at node = 0</li>
            <li><strong>Capacitor energy:</strong> E = ½ · C · V²</li>
            <li><strong>Inductor energy:</strong> E = ½ · L · I²</li>
            <li><strong>RC time constant:</strong> τ = R·C</li>
            <li><strong>Resonance:</strong> f = 1 / (2π·√(LC))</li>
            <li><strong>Transformer ratio:</strong> V<sub>p</sub>/V<sub>s</sub> = N<sub>p</sub>/N<sub>s</sub></li>
          </ul>

          <h2 id="power-systems">Power Systems</h2>
          <p>
            US distribution is typically 120/208 V or 277/480 V three-phase
            wye; industrial loads use 480 V most often. Transmission runs at
            69 kV–765 kV. Common motor voltages: 230/460 V (three-phase),
            2300/4160 V (medium voltage). Size conductors per <strong>NEC
            Article 310</strong> using ampacity tables and apply derating for
            ambient temperature and conduit fill.
          </p>

          <h2 id="electronics">Electronics</h2>
          <ul>
            <li>Diodes, BJTs, MOSFETs, IGBTs — semiconductor switches.</li>
            <li>Op-amps (LM358, LM324, TL072) — amplification, filtering, comparison.</li>
            <li>Microcontrollers (STM32, ESP32, AVR, PIC) and FPGAs (Xilinx, Intel).</li>
            <li>SMPS topologies — buck, boost, buck-boost, flyback, forward.</li>
            <li>Signal integrity — impedance matching, decoupling, EMC.</li>
          </ul>

          <h2 id="standards">Standards</h2>
          <ul>
            <li><strong>NFPA 70 (NEC)</strong> — National Electrical Code.</li>
            <li><strong>NFPA 70E</strong> — electrical safety in the workplace.</li>
            <li><strong>IEEE 519</strong> — harmonic limits.</li>
            <li><strong>IEEE 1584</strong> — arc-flash incident energy.</li>
            <li><strong>IEC 60364</strong> — low-voltage installations.</li>
            <li><strong>UL 508A</strong> — industrial control panels.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
