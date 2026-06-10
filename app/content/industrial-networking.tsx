// app/content/industrial-networking.tsx

export default function IndustrialNetworkingPage() {
  return (
    <article className="prose">
      <h1>Industrial Networking</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#purdue-model">Purdue Model</a></li>
            <li><a href="#protocols">Common Protocols</a></li>
            <li><a href="#topologies">Topologies &amp; Redundancy</a></li>
            <li><a href="#hardware">Hardware</a></li>
            <li><a href="#cabling">Cabling &amp; Practice</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Industrial networking moves control and process data inside a
            plant under tougher constraints than office IT — deterministic
            timing, extreme temperatures, EMI, decade-long lifecycles, and
            zero tolerance for downtime.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Most modern installs are Ethernet-based, but a long tail of
            fieldbus (RS-485, CAN, etc.) and legacy serial remains. Network
            decisions should follow a documented architecture standard, not
            grow ad-hoc.
          </p>

          <h2 id="purdue-model">Purdue Model</h2>
          <ul>
            <li><strong>Level 0</strong> — sensors, actuators.</li>
            <li><strong>Level 1</strong> — PLCs, RTUs, IEDs.</li>
            <li><strong>Level 2</strong> — HMI, SCADA, alarm.</li>
            <li><strong>Level 3</strong> — MES, historian, engineering.</li>
            <li><strong>Level 3.5 (DMZ)</strong> — proxies, jump hosts.</li>
            <li><strong>Levels 4–5</strong> — enterprise IT, ERP.</li>
          </ul>

          <h2 id="protocols">Common Protocols</h2>
          <ul>
            <li><strong>EtherNet/IP</strong> (CIP) — Rockwell ecosystem.</li>
            <li><strong>PROFINET</strong> — Siemens ecosystem.</li>
            <li><strong>Modbus TCP / RTU</strong> — vendor-neutral, simple.</li>
            <li><strong>EtherCAT</strong> — high-speed motion.</li>
            <li><strong>OPC UA</strong> — cross-vendor data &amp; modeling.</li>
            <li><strong>MQTT Sparkplug B</strong> — IIoT pub/sub.</li>
            <li><strong>BACnet, KNX, LON</strong> — building automation.</li>
            <li><strong>DNP3, IEC 60870-5, IEC 61850</strong> — utilities.</li>
          </ul>

          <h2 id="topologies">Topologies &amp; Redundancy</h2>
          <ul>
            <li>Star with managed switches — most common.</li>
            <li>Ring with RSTP, MRP (PROFINET), DLR (EtherNet/IP), or ERPS.</li>
            <li>Trunk + VLAN segmentation — separate control, video, IT.</li>
            <li>PRP / HSR (IEC 62439-3) for zero-failover utility networks.</li>
            <li>Redundant power supplies on critical switches.</li>
          </ul>

          <h2 id="hardware">Hardware</h2>
          <ul>
            <li>Industrial managed switches: Cisco IE, Hirschmann, Stratix, Moxa, Phoenix Contact, Siemens Scalance.</li>
            <li>Firewalls/routers: Tofino, Hirschmann EAGLE, Cisco IE / ASA.</li>
            <li>Media converters &amp; SFPs for fiber runs.</li>
            <li>Wireless: Cisco Industrial Wi-Fi, Phoenix Contact, Moxa AWK.</li>
          </ul>

          <h2 id="cabling">Cabling &amp; Practice</h2>
          <ul>
            <li>Cat 6/6A shielded (S/FTP) for industrial, M12 D/X-coded connectors.</li>
            <li>Multi-mode fiber OM3/OM4 for short runs; single-mode for long.</li>
            <li>Separate control cable from VFD/motor power; use proper grounding.</li>
            <li>Label every drop; maintain an as-built diagram.</li>
            <li>Document IP plan, VLANs, and protocols per cell/area.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
