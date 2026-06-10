// app/content/modbus.tsx

export default function ModbusPage() {
  return (
    <article className="prose">
      <h1>Modbus</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#variants">Variants</a></li>
            <li><a href="#data-model">Data Model</a></li>
            <li><a href="#function-codes">Function Codes</a></li>
            <li><a href="#wiring">Wiring &amp; Timing</a></li>
            <li><a href="#troubleshooting">Troubleshooting</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Modbus is a simple, royalty-free, master/server (now
            client/server) protocol introduced by Modicon in 1979. It has
            outlived nearly every &ldquo;modern&rdquo; competitor because it is easy
            to implement, well-documented, and universally supported.
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li>One client (master) talks to many servers (slaves).</li>
            <li>Server addresses 1–247; 0 is broadcast (RTU/ASCII only).</li>
            <li>No native authentication or encryption — segment the network.</li>
            <li>Maintained by the Modbus Organization.</li>
          </ul>

          <h2 id="variants">Variants</h2>
          <ul>
            <li><strong>Modbus RTU</strong> — binary over RS-485 / RS-232; most common in the field.</li>
            <li><strong>Modbus ASCII</strong> — readable text over serial; rarely used.</li>
            <li><strong>Modbus TCP</strong> — over Ethernet, TCP port 502; no CRC (TCP handles it).</li>
            <li><strong>Modbus over UDP</strong>, <strong>Modbus over TLS</strong> — newer additions.</li>
          </ul>

          <h2 id="data-model">Data Model</h2>
          <ul>
            <li><strong>Discrete Inputs</strong> — 1-bit, read-only (10001–19999).</li>
            <li><strong>Coils</strong> — 1-bit, read/write (00001–09999).</li>
            <li><strong>Input Registers</strong> — 16-bit, read-only (30001–39999).</li>
            <li><strong>Holding Registers</strong> — 16-bit, read/write (40001–49999).</li>
            <li>32-bit values use 2 consecutive registers; watch endianness (big / little / mixed).</li>
          </ul>

          <h2 id="function-codes">Function Codes</h2>
          <ul>
            <li><strong>0x01</strong> Read Coils.</li>
            <li><strong>0x02</strong> Read Discrete Inputs.</li>
            <li><strong>0x03</strong> Read Holding Registers.</li>
            <li><strong>0x04</strong> Read Input Registers.</li>
            <li><strong>0x05</strong> Write Single Coil.</li>
            <li><strong>0x06</strong> Write Single Register.</li>
            <li><strong>0x0F</strong> Write Multiple Coils.</li>
            <li><strong>0x10</strong> Write Multiple Registers.</li>
            <li><strong>0x17</strong> Read/Write Multiple Registers.</li>
          </ul>

          <h2 id="wiring">Wiring &amp; Timing</h2>
          <ul>
            <li>RS-485: twisted pair, 2-wire (A/B) or 4-wire; 120 Ω termination at both ends.</li>
            <li>Up to 32 nodes per segment (more with low-load transceivers); 1200 m max at 9600 baud.</li>
            <li>Common baud rates: 9600, 19200, 38400, 57600, 115200.</li>
            <li>RTU inter-character silence: 1.5× char time; inter-message silence: 3.5× char time.</li>
          </ul>

          <h2 id="troubleshooting">Troubleshooting</h2>
          <ul>
            <li>Check baud, parity, stop bits match on every node.</li>
            <li>Verify A/B polarity (a swapped pair is the #1 symptom).</li>
            <li>Termination resistor present at both ends (not the middle).</li>
            <li>Use a Modbus poller (Modbus Poll, ModScan, mbpoll) to isolate device vs master.</li>
            <li>For TCP: check port 502 firewall, server unit ID, slave timeout.</li>
            <li>Exception codes 01–04 are the most common: bad function / address / value / device failure.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
