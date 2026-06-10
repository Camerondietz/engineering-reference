// app/content/profinet.tsx

export default function ProfinetPage() {
  return (
    <article className="prose">
      <h1>PROFINET</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#classes">Conformance Classes</a></li>
            <li><a href="#device-config">Device Configuration</a></li>
            <li><a href="#topology">Topology &amp; MRP</a></li>
            <li><a href="#safety">PROFIsafe</a></li>
            <li><a href="#troubleshooting">Troubleshooting</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            PROFINET is the open Industrial Ethernet protocol maintained by
            PI (PROFIBUS &amp; PROFINET International) and most strongly
            associated with the Siemens ecosystem.
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li>Standard Ethernet (100 Mb / 1 Gb).</li>
            <li>Uses raw Ethernet frames (EtherType 0x8892) for cyclic data.</li>
            <li>TCP/UDP for parameterization, alarms, and acyclic.</li>
            <li>Devices identified by station name (NameOfStation), not IP — IP can be assigned by the controller via DCP.</li>
          </ul>

          <h2 id="classes">Conformance Classes</h2>
          <ul>
            <li><strong>CC-A</strong> — basic RT, standard switches OK; typical jitter ~10 ms.</li>
            <li><strong>CC-B</strong> — RT + diagnostics, managed switches required.</li>
            <li><strong>CC-C</strong> — Isochronous Real-Time (IRT); deterministic, &lt;1 ms cycle, needs PROFINET-capable switches.</li>
            <li>PROFINET-CC-D adds TSN extensions.</li>
          </ul>

          <h2 id="device-config">Device Configuration</h2>
          <ul>
            <li><strong>GSDML</strong> file describes the device (modules, submodules, parameters).</li>
            <li>Import into TIA Portal; drop the device into the topology / network.</li>
            <li>Assign IP and PROFINET name (right-click → Assign device name).</li>
            <li>Set update time per slot (typ. 1–32 ms).</li>
            <li>Configure shared device / shared inputs where multiple IO controllers need access.</li>
          </ul>

          <h2 id="topology">Topology &amp; MRP</h2>
          <ul>
            <li>Star, line, tree, ring.</li>
            <li><strong>MRP (Media Redundancy Protocol)</strong> — ring with sub-200 ms failover (default).</li>
            <li>MRPD — MRP for IRT, sub-1 ms.</li>
            <li>Use PROFINET-capable managed switches (Scalance XB/XC/XR, Hirschmann, etc.).</li>
            <li>Wiring: green PROFINET cable (Cat 5e equivalent, 4-pair shielded), max 100 m between nodes.</li>
          </ul>

          <h2 id="safety">PROFIsafe</h2>
          <ul>
            <li>Black-channel approach — safety frames over standard PROFINET.</li>
            <li>SIL3 / PLe certified.</li>
            <li>Uses F-CPU and F-I/O modules.</li>
            <li>Each safety connection has a unique F_Source_Address / F_Destination_Address.</li>
          </ul>

          <h2 id="troubleshooting">Troubleshooting</h2>
          <ul>
            <li>Use TIA Portal &gt; Online &amp; diagnostics to read device status, alarms, port stats.</li>
            <li>Wireshark with PROFINET dissector.</li>
            <li>Check that device name &amp; IP match what the controller expects.</li>
            <li>BF / SF LEDs on Siemens modules indicate bus / system faults.</li>
            <li>Common issue: wrong cable type (use rated PROFINET cable; not patch cable in machinery vibration).</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
