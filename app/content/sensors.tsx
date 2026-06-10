// app/content/sensors.tsx

export default function SensorsPage() {
  return (
    <article className="prose">
      <h1>Sensors</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#proximity">Proximity &amp; Presence</a></li>
            <li><a href="#temperature">Temperature</a></li>
            <li><a href="#pressure-flow">Pressure, Flow, Level</a></li>
            <li><a href="#position-motion">Position &amp; Motion</a></li>
            <li><a href="#signal-types">Signal Types</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Sensors convert a physical quantity — distance, temperature,
            pressure, position — into an electrical signal the controller
            can read. Sensor choice usually determines accuracy, response
            time, and cost more than the controller itself.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Specify sensors by measurement range, accuracy, repeatability,
            response time, output type, supply voltage, environment (IP/NEMA
            rating, temperature, vibration), and certification (UL, ATEX,
            IECEx) where required.
          </p>

          <h2 id="proximity">Proximity &amp; Presence</h2>
          <ul>
            <li><strong>Inductive</strong> — detects ferrous (and non-ferrous) metals, ~0–60 mm.</li>
            <li><strong>Capacitive</strong> — detects metals, liquids, plastics; through-wall sensing.</li>
            <li><strong>Photoelectric</strong> — through-beam, retro-reflective, diffuse.</li>
            <li><strong>Ultrasonic</strong> — distance to liquids, transparent or dark objects.</li>
            <li><strong>Laser distance</strong> — sub-mm precision; time-of-flight or triangulation.</li>
            <li><strong>Vision</strong> — pattern matching, OCR, dimensional gauging.</li>
          </ul>

          <h2 id="temperature">Temperature</h2>
          <ul>
            <li><strong>Thermocouple</strong> — wide range, fast, low cost (J, K, T, E, N, R, S, B).</li>
            <li><strong>RTD</strong> — Pt100 / Pt1000; very stable; −200 to 850 °C.</li>
            <li><strong>Thermistor</strong> — NTC/PTC; sensitive, narrow range.</li>
            <li><strong>IR pyrometer</strong> — non-contact, moving / hot surfaces.</li>
            <li><strong>Semiconductor (LM35, TMP117, DS18B20)</strong> — easy digital interfacing.</li>
          </ul>

          <h2 id="pressure-flow">Pressure, Flow, Level</h2>
          <ul>
            <li><strong>Pressure</strong> — piezoresistive, capacitive, strain-gauge; gauge, absolute, differential.</li>
            <li><strong>Flow</strong> — Coriolis (mass), magnetic (conductive liquids), vortex, turbine, orifice, ultrasonic, thermal mass.</li>
            <li><strong>Level</strong> — radar, ultrasonic, hydrostatic, capacitive, guided-wave, float, optical.</li>
          </ul>

          <h2 id="position-motion">Position &amp; Motion</h2>
          <ul>
            <li><strong>Encoders</strong> — incremental (A/B/Z) and absolute (SSI, BiSS, EnDat).</li>
            <li><strong>Resolvers</strong> — rugged angular position.</li>
            <li><strong>LVDT</strong> — linear displacement, very robust.</li>
            <li><strong>IMU</strong> — MEMS accelerometer + gyro + magnetometer.</li>
            <li><strong>Load cells / strain gauges</strong> — force and weight.</li>
          </ul>

          <h2 id="signal-types">Signal Types</h2>
          <ul>
            <li><strong>Digital (24 VDC)</strong> — PNP (sourcing) or NPN (sinking).</li>
            <li><strong>4–20 mA</strong> — current loop; immune to voltage drop.</li>
            <li><strong>0–10 V</strong> — common analog input.</li>
            <li><strong>HART</strong> — digital overlay on 4–20 mA.</li>
            <li><strong>IO-Link</strong> — smart sensors with config + diagnostics over standard cable.</li>
            <li>Fieldbus / Ethernet — PROFINET, EtherNet/IP, Modbus, EtherCAT.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
