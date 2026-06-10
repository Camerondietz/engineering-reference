// app/content/mechatronics.tsx

export default function MechatronicsPage() {
  return (
    <article className="prose">
      <h1>Mechatronics</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#building-blocks">Building Blocks</a></li>
            <li><a href="#sensors-actuators">Sensors &amp; Actuators</a></li>
            <li><a href="#control">Control &amp; Embedded Code</a></li>
            <li><a href="#design-flow">Design Flow</a></li>
            <li><a href="#tools">Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Mechatronics is the synergistic combination of mechanical
            engineering, electronics, control theory, and software. Modern
            products — robots, EVs, drones, CNC machines, printers — are
            mechatronic by nature; no single discipline can deliver them
            alone.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            A mechatronic system has four functional layers: <strong>sensing,
            actuation, control, and communication</strong>, wrapped around a
            mechanical structure. The skill is partitioning function: what
            should be done in mechanism vs electronics vs firmware vs cloud.
          </p>

          <h2 id="building-blocks">Building Blocks</h2>
          <ul>
            <li>Mechanical structure, bearings, transmissions.</li>
            <li>Power electronics — motor drives, SMPS, gate drivers.</li>
            <li>Microcontroller / SoC / FPGA + RTOS.</li>
            <li>Sensors and signal conditioning.</li>
            <li>Communication — CAN, EtherCAT, Modbus, Wi-Fi, BLE.</li>
            <li>HMI — display, indicators, mobile app.</li>
          </ul>

          <h2 id="sensors-actuators">Sensors &amp; Actuators</h2>
          <ul>
            <li><strong>Sensors:</strong> encoders, Hall, IMU (MEMS), strain gauges, load cells, thermocouples, vision.</li>
            <li><strong>Actuators:</strong> BLDC/PMSM servo, stepper, DC, AC induction, solenoid, voice coil, piezo, pneumatic, hydraulic.</li>
            <li><strong>Drives:</strong> trapezoidal, FOC (field-oriented control), microstepping.</li>
          </ul>

          <h2 id="control">Control &amp; Embedded Code</h2>
          <ul>
            <li>PID loops, feedforward, lead-lag compensators.</li>
            <li>State machines for sequencing; deterministic timing.</li>
            <li>Real-time scheduling — rate-monotonic, EDF.</li>
            <li>Safety supervision — watchdogs, brown-out, fail-safe outputs.</li>
            <li>Languages: C/C++ for MCUs, IEC 61131-3 for industrial.</li>
          </ul>

          <h2 id="design-flow">Design Flow</h2>
          <ol>
            <li>Define functional requirements &amp; environment.</li>
            <li>Partition mechanical / electrical / firmware.</li>
            <li>Model &amp; simulate (model-based design).</li>
            <li>Prototype — PCB rev A, mechanical α build.</li>
            <li>Integrate, characterize, tune control loops.</li>
            <li>EMC, environmental, &amp; safety testing.</li>
            <li>Design for manufacture &amp; field service.</li>
          </ol>

          <h2 id="tools">Tools</h2>
          <ul>
            <li><strong>MBD:</strong> MATLAB/Simulink, Simscape, LabVIEW.</li>
            <li><strong>CAD/PCB:</strong> SolidWorks, Altium, KiCad, OrCAD.</li>
            <li><strong>Firmware:</strong> STM32CubeIDE, MPLAB X, PlatformIO, Keil, IAR.</li>
            <li><strong>Test:</strong> oscilloscope, logic analyzer, CAN bus tools, dyno.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
