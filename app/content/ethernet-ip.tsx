// app/content/ethernet-ip.tsx

export default function EthernetIpPage() {
  return (
    <article className="prose">
      <h1>EtherNet/IP</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#cip">CIP Object Model</a></li>
            <li><a href="#messaging">Implicit &amp; Explicit Messaging</a></li>
            <li><a href="#configuration">Device Configuration</a></li>
            <li><a href="#dlr">DLR &amp; Redundancy</a></li>
            <li><a href="#troubleshooting">Troubleshooting</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            EtherNet/IP (&ldquo;Industrial Protocol&rdquo;) is an Ethernet
            implementation of the <strong>Common Industrial Protocol (CIP)</strong>{" "}
            stack maintained by ODVA. It is the dominant industrial protocol
            in the Rockwell Automation ecosystem.
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li>Standard 100 Mb / 1 Gb Ethernet PHY (no special hardware required).</li>
            <li>UDP port 2222 (implicit / I/O), TCP port 44818 (explicit).</li>
            <li>Open spec; multi-vendor; certified by ODVA.</li>
            <li>Coexists with normal IT traffic but should be on its own VLAN.</li>
          </ul>

          <h2 id="cip">CIP Object Model</h2>
          <ul>
            <li>Objects expose Attributes via Services (Get_Attribute_Single, Set_Attribute_Single, etc.).</li>
            <li>Class / Instance / Attribute addressing — every parameter is reachable.</li>
            <li>Identity Object (0x01), Assembly (0x04), Connection Manager (0x06), TCP/IP Interface (0xF5), Ethernet Link (0xF6).</li>
            <li>Device profiles standardize objects across vendors (e.g. Drives, Discrete I/O).</li>
          </ul>

          <h2 id="messaging">Implicit &amp; Explicit Messaging</h2>
          <ul>
            <li><strong>Implicit (I/O)</strong> — cyclic, UDP, low overhead; RPI typically 5–100 ms.</li>
            <li><strong>Explicit</strong> — TCP, on-demand, used for config / diagnostics.</li>
            <li>Unicast or multicast for producer/consumer I/O (multicast needs IGMP snooping).</li>
            <li>CIP Safety adds time-stamped, ID-verified messages for SIL3 / PLe.</li>
          </ul>

          <h2 id="configuration">Device Configuration</h2>
          <ul>
            <li><strong>EDS file</strong> describes the device to the engineering tool.</li>
            <li>Set IP (DHCP, BOOTP, static); avoid DHCP for production devices.</li>
            <li>Add to Studio 5000 I/O tree; pick the correct connection (Exclusive Owner, Listen Only, Input Only).</li>
            <li>Configure RPI per loop performance need; lower RPI = more bandwidth.</li>
          </ul>

          <h2 id="dlr">DLR &amp; Redundancy</h2>
          <ul>
            <li><strong>Device Level Ring (DLR)</strong> — sub-3 ms recovery on a physical ring of supervisor + ring nodes.</li>
            <li>Each device needs DLR support; one supervisor (often the PLC).</li>
            <li>Cable both ports of each device; close the ring at the supervisor.</li>
            <li>For larger networks: ResilientEthernet (REP) or Spanning Tree.</li>
          </ul>

          <h2 id="troubleshooting">Troubleshooting</h2>
          <ul>
            <li>Check ControlLogix module status LEDs and module properties &gt; Connection tab for connection errors.</li>
            <li>Wireshark with CIP dissector to capture explicit messages.</li>
            <li>RSLinx Classic / FactoryTalk Linx to browse devices.</li>
            <li>Watch packet rate vs RPI — exceeding the device&rsquo;s spec causes dropped connections.</li>
            <li>Common issue: duplicate IP; second cause: IGMP / multicast not configured on the switch.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
