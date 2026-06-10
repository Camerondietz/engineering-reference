// app/content/plc.tsx

export default function PlcPage() {
  return (
    <article className="prose">
      <h1>PLC Systems</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#architecture">Architecture</a></li>
            <li><a href="#scan-cycle">Scan Cycle</a></li>
            <li><a href="#languages">IEC 61131-3 Languages</a></li>
            <li><a href="#io-and-tags">I/O &amp; Tags</a></li>
            <li><a href="#platforms">Major Platforms</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            A Programmable Logic Controller (PLC) is a ruggedized industrial
            computer designed to control machines and processes. It reads
            inputs, executes logic in a deterministic scan, and updates
            outputs — repeated thousands of times per second.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            PLCs replaced banks of relays in the late 1960s and are now the
            standard control element in factories, water plants, oil &amp;
            gas, and packaging. They are designed for decades of unattended
            operation in harsh environments.
          </p>

          <h2 id="architecture">Architecture</h2>
          <ul>
            <li><strong>CPU</strong> — runs the program; battery- or capacitor-backed memory.</li>
            <li><strong>Power supply</strong> — typically 24 VDC.</li>
            <li><strong>I/O modules</strong> — digital in/out, analog in/out, specialty (motion, weigh, comms).</li>
            <li><strong>Backplane / chassis</strong> or DIN-rail mount.</li>
            <li><strong>Communication</strong> — Ethernet, serial, fieldbus.</li>
            <li><strong>Programming terminal</strong> — laptop with vendor software.</li>
          </ul>

          <h2 id="scan-cycle">Scan Cycle</h2>
          <ol>
            <li>Read inputs into the input image table.</li>
            <li>Execute program logic top-to-bottom.</li>
            <li>Write outputs from the output image table.</li>
            <li>Housekeeping — communications, diagnostics.</li>
          </ol>
          <p>
            Typical scan times: 1–20 ms. Avoid I/O reads mid-scan; use the
            image table so logic sees a consistent snapshot.
          </p>

          <h2 id="languages">IEC 61131-3 Languages</h2>
          <ul>
            <li><strong>LD (Ladder Diagram)</strong> — graphical relay logic.</li>
            <li><strong>FBD (Function Block Diagram)</strong> — graphical, signal-flow.</li>
            <li><strong>ST (Structured Text)</strong> — Pascal-like text.</li>
            <li><strong>SFC (Sequential Function Chart)</strong> — state-machine sequencing.</li>
            <li><strong>IL (Instruction List)</strong> — legacy assembler-style (deprecated in 3rd ed).</li>
          </ul>

          <h2 id="io-and-tags">I/O &amp; Tags</h2>
          <ul>
            <li>Digital inputs: dry contacts, sourcing/sinking 24 V.</li>
            <li>Digital outputs: relay, transistor (sinking/sourcing), TRIAC.</li>
            <li>Analog: 4–20 mA, 0–10 V, RTD, thermocouple.</li>
            <li>Tag-based addressing &gt; absolute (e.g. <code>Conveyor_1.Run</code>).</li>
            <li>UDTs (user-defined types) keep tag structures consistent.</li>
          </ul>

          <h2 id="platforms">Major Platforms</h2>
          <ul>
            <li><strong>Rockwell / Allen-Bradley</strong> — ControlLogix, CompactLogix, Micro800; Studio 5000.</li>
            <li><strong>Siemens</strong> — S7-1200, S7-1500; TIA Portal.</li>
            <li><strong>Schneider</strong> — Modicon M580, M340; EcoStruxure Control Expert.</li>
            <li><strong>Mitsubishi</strong> — MELSEC iQ-R, iQ-F.</li>
            <li><strong>Omron</strong> — NX, NJ; Sysmac Studio.</li>
            <li><strong>Beckhoff</strong> — TwinCAT 3 (Windows-based, soft PLC).</li>
            <li><strong>Codesys-based</strong> — Wago, Eaton, ifm, many OEMs.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
