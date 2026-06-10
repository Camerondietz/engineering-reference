// app/content/can-bus.tsx

export default function CanBusPage() {
  return (
    <article className="prose">
      <h1>CAN Bus</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#frame-formats">Frame Formats</a></li>
            <li><a href="#bit-timing">Bit Timing</a></li>
            <li><a href="#higher-layer">Higher-Layer Protocols</a></li>
            <li><a href="#wiring">Wiring</a></li>
            <li><a href="#troubleshooting">Troubleshooting</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Controller Area Network (CAN) is a multi-master serial bus
            developed by Bosch in the 1980s for automotive applications and
            now used across machinery, medical, marine, and aerospace.
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li>Differential, two-wire (CAN_H, CAN_L); robust against EMI.</li>
            <li>Non-destructive arbitration by message ID (lower ID = higher priority).</li>
            <li>CRC + ACK + automatic retransmission built into the protocol.</li>
            <li>Standardized in ISO 11898.</li>
          </ul>

          <h2 id="frame-formats">Frame Formats</h2>
          <ul>
            <li><strong>CAN 2.0A</strong> — 11-bit ID, up to 8 data bytes.</li>
            <li><strong>CAN 2.0B</strong> — 29-bit extended ID.</li>
            <li><strong>CAN FD</strong> — up to 64 data bytes, faster data phase (up to 8 Mbit/s).</li>
            <li><strong>CAN XL</strong> — newest; up to 2048 bytes, 10+ Mbit/s.</li>
            <li>Frame types: Data, Remote, Error, Overload.</li>
          </ul>

          <h2 id="bit-timing">Bit Timing</h2>
          <ul>
            <li>Each bit time split into Sync_Seg, Prop_Seg, Phase_Seg1, Phase_Seg2.</li>
            <li>Sample point typically 75–87.5% of bit time.</li>
            <li>SJW (Synchronization Jump Width) handles clock drift.</li>
            <li>Common bit rates: 125, 250, 500 kbit/s, 1 Mbit/s (classical CAN); higher with FD.</li>
          </ul>

          <h2 id="higher-layer">Higher-Layer Protocols</h2>
          <ul>
            <li><strong>J1939</strong> — heavy-duty vehicles (trucks, agriculture, marine).</li>
            <li><strong>CANopen</strong> — industrial, medical, motion.</li>
            <li><strong>DeviceNet</strong> — Rockwell industrial.</li>
            <li><strong>NMEA 2000</strong> — marine.</li>
            <li><strong>ISO-TP / UDS</strong> — automotive diagnostics.</li>
            <li><strong>OBD-II</strong> — automotive emissions.</li>
          </ul>

          <h2 id="wiring">Wiring</h2>
          <ul>
            <li>Twisted pair; 120 Ω termination at each end (one resistor at each physical end).</li>
            <li>Differential ~2 V dominant, ~0 V recessive (between CAN_H &amp; CAN_L).</li>
            <li>Bus length depends on bit rate: 40 m @ 1 Mbit/s, 500 m @ 125 kbit/s.</li>
            <li>Stub length should be &lt; 0.3 m at 1 Mbit/s.</li>
          </ul>

          <h2 id="troubleshooting">Troubleshooting</h2>
          <ul>
            <li>Measure ~60 Ω across CAN_H / CAN_L on a powered-off bus.</li>
            <li>Check for one or both terminators missing (120 Ω or open).</li>
            <li>Watch for bus-off state — a node with too many errors silently drops off.</li>
            <li>Tools: Vector CANalyzer / CANoe, Peak PCAN, Kvaser, BusMaster (open source).</li>
            <li>Check baud rate; common issue is a baud mismatch on one node.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
