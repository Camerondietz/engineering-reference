// app/content/networking.tsx

export default function NetworkingPage() {
  return (
    <article className="prose">
      <h1>Networking</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#osi-tcpip">OSI &amp; TCP/IP</a></li>
            <li><a href="#addressing">Addressing &amp; Subnetting</a></li>
            <li><a href="#protocols">Common Protocols</a></li>
            <li><a href="#routing-switching">Routing &amp; Switching</a></li>
            <li><a href="#security">Security</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Networking moves bytes between machines reliably and securely. A
            working engineer needs to read packets, understand the stack
            layer by layer, and reason about latency, throughput, and loss.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Two reference models are everywhere: the 7-layer OSI model and
            the simpler 4-layer TCP/IP model. Both describe the same job —
            framing, addressing, delivery, ordering, and presenting bytes —
            split across cooperating layers.
          </p>

          <h2 id="osi-tcpip">OSI &amp; TCP/IP</h2>
          <ul>
            <li><strong>1 Physical</strong> — copper, fiber, RF.</li>
            <li><strong>2 Data link</strong> — Ethernet, Wi-Fi, MAC, VLANs.</li>
            <li><strong>3 Network</strong> — IPv4 / IPv6, routing.</li>
            <li><strong>4 Transport</strong> — TCP, UDP, QUIC.</li>
            <li><strong>5–7 Session / Presentation / Application</strong> — HTTP, DNS, TLS, SMTP, MQTT.</li>
          </ul>

          <h2 id="addressing">Addressing &amp; Subnetting</h2>
          <ul>
            <li>IPv4: 32 bits; private ranges 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.</li>
            <li>CIDR notation — /24 = 256 addresses, /30 = 4 (2 usable).</li>
            <li>IPv6: 128 bits; link-local fe80::/10, ULA fc00::/7.</li>
            <li>MAC: 48 bits; first 24 = OUI.</li>
            <li>NAT, PAT; loopback 127.0.0.1.</li>
          </ul>

          <h2 id="protocols">Common Protocols</h2>
          <ul>
            <li><strong>DHCP</strong> (67/68) — address assignment.</li>
            <li><strong>DNS</strong> (53) — name resolution, A/AAAA/CNAME/MX/TXT.</li>
            <li><strong>HTTP/HTTPS</strong> (80/443) — web.</li>
            <li><strong>SSH</strong> (22), <strong>RDP</strong> (3389).</li>
            <li><strong>SMTP/IMAP/POP3</strong> (25/143/110) — mail.</li>
            <li><strong>NTP/PTP</strong> — time sync.</li>
            <li><strong>SNMP</strong> (161/162) — device management.</li>
            <li>Industrial: Modbus TCP (502), EtherNet/IP (44818/2222), OPC UA (4840), PROFINET.</li>
          </ul>

          <h2 id="routing-switching">Routing &amp; Switching</h2>
          <ul>
            <li>Switches forward frames by MAC; build CAM/MAC tables.</li>
            <li>VLANs (802.1Q) segment broadcast domains.</li>
            <li>STP/RSTP (802.1D/w) prevents loops; PortFast, BPDU Guard.</li>
            <li>Routers forward packets by longest-prefix IP match.</li>
            <li>Routing protocols: OSPF, EIGRP, BGP, IS-IS.</li>
          </ul>

          <h2 id="security">Security</h2>
          <ul>
            <li>Firewall rules (stateful), zones / DMZ.</li>
            <li>TLS 1.2/1.3, certificate chains, PKI.</li>
            <li>VPN — IPsec, WireGuard, OpenVPN.</li>
            <li>802.1X port authentication.</li>
            <li>Zero Trust — verify every request, segment everything.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
