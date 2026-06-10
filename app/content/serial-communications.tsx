// app/content/serial-communications.tsx

export default function SerialCommunicationsPage() {
  return (
    <article className="prose">
      <h1>Serial Communications</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#standards">RS-232 / RS-422 / RS-485</a></li>
            <li><a href="#framing">UART Framing</a></li>
            <li><a href="#cabling">Cabling</a></li>
            <li><a href="#flow-control">Flow Control</a></li>
            <li><a href="#troubleshooting">Troubleshooting</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Serial communications send data one bit at a time over a small
            number of wires. Despite Ethernet&rsquo;s dominance, RS-232 / RS-485
            still drive countless field devices, instruments, and consoles.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            The basic building block is the UART: an async character with
            start, data, optional parity, and stop bits. Different physical
            layers wrap the same UART for different distance / topology.
          </p>

          <h2 id="standards">RS-232 / RS-422 / RS-485</h2>
          <ul>
            <li><strong>RS-232 (TIA-232-F)</strong> — single-ended, ±5 to ±15 V, point-to-point, ~15 m max, up to ~1 Mbit/s.</li>
            <li><strong>RS-422</strong> — differential, point-to-multipoint (1 driver, up to 10 receivers), 1,200 m at 100 kbit/s.</li>
            <li><strong>RS-485</strong> — differential, multi-drop (up to 32 unit loads), 1,200 m at 100 kbit/s. Most field use today.</li>
            <li>Wire RS-485 as A (− / inverting) and B (+ / non-inverting); pull-up/pull-down for fail-safe idle.</li>
          </ul>

          <h2 id="framing">UART Framing</h2>
          <ul>
            <li>Start bit (logic 0), data bits (5–9, usually 8), optional parity (none/odd/even/mark/space), 1 or 2 stop bits.</li>
            <li>Common config &ldquo;8N1&rdquo; = 8 data, no parity, 1 stop.</li>
            <li>Baud rate must match exactly on both ends (±2% tolerance typical).</li>
            <li>Common rates: 1200, 2400, 9600, 19200, 38400, 57600, 115200.</li>
          </ul>

          <h2 id="cabling">Cabling</h2>
          <ul>
            <li>RS-232 typically DB-9 (DTE / DCE wiring difference matters).</li>
            <li>RS-485: shielded twisted pair (e.g. Belden 3105A), 120 Ω characteristic impedance.</li>
            <li>Terminate at both physical ends of the bus only; never daisy-chain through devices&rsquo; screw terminals into a star.</li>
            <li>Bias resistors (~680 Ω) on the master to define idle state.</li>
            <li>Connect signal ground / reference between all nodes.</li>
          </ul>

          <h2 id="flow-control">Flow Control</h2>
          <ul>
            <li><strong>None</strong> — most modern devices.</li>
            <li><strong>Hardware</strong> — RTS / CTS handshake (RS-232).</li>
            <li><strong>Software</strong> — XON / XOFF (ASCII characters 0x11 / 0x13).</li>
            <li>For RS-485, the master controls direction; transceivers need RE/DE toggling.</li>
          </ul>

          <h2 id="troubleshooting">Troubleshooting</h2>
          <ul>
            <li>Use a USB-to-serial adapter (FTDI FT232, Prolific PL2303) + terminal (PuTTY, Tera Term, minicom, screen).</li>
            <li>Verify baud, data, parity, stop on both ends.</li>
            <li>Swap A/B if RS-485 doesn&rsquo;t communicate — first thing to try.</li>
            <li>Check termination &amp; biasing.</li>
            <li>Confirm signal ground is connected between RS-232 nodes.</li>
            <li>Use a protocol analyzer (Saleae Logic) to capture and decode UART frames.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
