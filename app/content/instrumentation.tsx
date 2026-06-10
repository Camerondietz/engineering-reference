// app/content/instrumentation.tsx

export default function InstrumentationPage() {
  return (
    <article className="prose">
      <h1>Instrumentation</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#measurement-types">Measurement Types</a></li>
            <li><a href="#signals">Signal Standards</a></li>
            <li><a href="#calibration">Calibration</a></li>
            <li><a href="#documents">Documents</a></li>
            <li><a href="#area-classification">Area Classification</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Instrumentation is the equipment and discipline of measuring
            process variables and translating them into signals for control
            and recording. Without good instruments, control loops are
            guessing.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            A typical loop comprises a sensing element, transmitter, signal
            cable, controller, and final control element (control valve,
            VFD, damper). Each link affects accuracy and response.
          </p>

          <h2 id="measurement-types">Measurement Types</h2>
          <ul>
            <li><strong>Temperature</strong> — RTD, thermocouple, thermowell.</li>
            <li><strong>Pressure</strong> — gauge, absolute, differential, vacuum.</li>
            <li><strong>Flow</strong> — Coriolis, mag, vortex, orifice, ultrasonic, thermal mass, turbine.</li>
            <li><strong>Level</strong> — radar, GWR, ultrasonic, hydrostatic, capacitive, float, optical.</li>
            <li><strong>Analytical</strong> — pH, ORP, conductivity, dissolved O₂, NIR, gas chromatograph.</li>
            <li><strong>Density / viscosity / moisture.</strong></li>
          </ul>

          <h2 id="signals">Signal Standards</h2>
          <ul>
            <li><strong>4–20 mA</strong> — the industrial workhorse; loop-powered, noise-tolerant.</li>
            <li><strong>HART</strong> — digital FSK overlaid on 4–20 mA; config &amp; diagnostics.</li>
            <li><strong>1–5 V</strong> — derived across 250 Ω in 4–20 mA loops.</li>
            <li><strong>Fieldbus</strong> — Foundation Fieldbus H1, PROFIBUS PA.</li>
            <li><strong>Industrial Ethernet</strong> — PROFINET, EtherNet/IP, Modbus TCP.</li>
            <li><strong>WirelessHART, ISA100.</strong></li>
          </ul>

          <h2 id="calibration">Calibration</h2>
          <ul>
            <li>Compare device under test to a traceable reference (NIST).</li>
            <li>5-point check (0, 25, 50, 75, 100%) up &amp; down — captures hysteresis.</li>
            <li>Record As-Found / As-Left, uncertainty budget.</li>
            <li>Field calibrators: Fluke 754/729, Beamex MC6.</li>
            <li>Document per ISO/IEC 17025.</li>
          </ul>

          <h2 id="documents">Documents</h2>
          <ul>
            <li><strong>P&amp;ID</strong> — Piping &amp; Instrumentation Diagram.</li>
            <li><strong>PFD</strong> — Process Flow Diagram.</li>
            <li><strong>Instrument index, loop sheets, datasheets.</strong></li>
            <li><strong>Cause &amp; Effect matrix</strong> — interlocks &amp; SIS logic.</li>
            <li><strong>Hookup / installation details.</strong></li>
          </ul>

          <h2 id="area-classification">Area Classification</h2>
          <ul>
            <li>Class I (gases) / II (dusts) / III (fibers); Divisions 1 &amp; 2 (NEC).</li>
            <li>Zones 0/1/2 for gases, 20/21/22 for dusts (IEC/ATEX/IECEx).</li>
            <li>Protection methods: explosion-proof (Ex d), intrinsic safety (Ex i), purge (Ex p), increased safety (Ex e).</li>
            <li>NEC Articles 500–516; ATEX Directive 2014/34/EU.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
