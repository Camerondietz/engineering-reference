// app/content/deviceNet.tsx

export default function DeviceNetPage() {
  return (
    <article className="prose">
      <h1>DeviceNet</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#physical">Physical Layer</a></li>
            <li><a href="#addressing">Addressing &amp; Baud</a></li>
            <li><a href="#messaging">Messaging</a></li>
            <li><a href="#configuration">Configuration</a></li>
            <li><a href="#troubleshooting">Troubleshooting</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            DeviceNet is a CAN-based industrial fieldbus that runs the
            Common Industrial Protocol (CIP) over CAN 2.0A. ODVA-managed and
            once the workhorse low-end network in the Rockwell ecosystem,
            it has been largely succeeded by EtherNet/IP for new builds but
            remains widely deployed.
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li>Multi-drop; up to 64 nodes per network.</li>
            <li>Carries data + 24 VDC power on a single 5-wire cable.</li>
            <li>Producer/consumer model — natural multicast on the CAN bus.</li>
            <li>Same CIP object model as EtherNet/IP &amp; ControlNet.</li>
          </ul>

          <h2 id="physical">Physical Layer</h2>
          <ul>
            <li>5-wire cable: V+, V−, CAN_H, CAN_L, drain (shield).</li>
            <li>Round (thick / thin) or flat KwikLink cable.</li>
            <li>120 Ω terminators at both ends of the trunk.</li>
            <li>Power supply tap on the network; some segments use dual supplies.</li>
          </ul>

          <h2 id="addressing">Addressing &amp; Baud</h2>
          <ul>
            <li>Node addresses (MAC IDs) 0–63; default 63 for new devices.</li>
            <li>Baud / max length: 125 kbps / 500 m, 250 kbps / 250 m, 500 kbps / 100 m.</li>
            <li>All nodes must use the same baud; auto-baud devices exist but pin them in production.</li>
          </ul>

          <h2 id="messaging">Messaging</h2>
          <ul>
            <li><strong>I/O messaging</strong> — implicit, time-critical: polled, change-of-state, cyclic, strobed.</li>
            <li><strong>Explicit messaging</strong> — config / diagnostics; non-real-time.</li>
            <li>Predefined Master/Slave Connection Set simplifies common use.</li>
          </ul>

          <h2 id="configuration">Configuration</h2>
          <ul>
            <li>Use RSNetWorx for DeviceNet (now FactoryTalk Linx Network Browser) for design &amp; commissioning.</li>
            <li>Load EDS files for each device.</li>
            <li>Build a scanlist on the scanner module (e.g. 1756-DNB).</li>
            <li>Map device assemblies into the scanner I/O image.</li>
          </ul>

          <h2 id="troubleshooting">Troubleshooting</h2>
          <ul>
            <li>Check 24 V power at the device drop.</li>
            <li>Measure termination — ~60 Ω across CAN_H / CAN_L with bus powered off.</li>
            <li>Duplicate MAC ID is the most common bring-up issue.</li>
            <li>Scanner LED steady green = healthy; flashing = node fault; check the node-fault table.</li>
            <li>Increase trunk wire gauge or add a second power supply if voltage drop is excessive.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
