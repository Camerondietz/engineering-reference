// app/content/industrial-it.tsx

export default function IndustrialItPage() {
  return (
    <article className="prose">
      <h1>Industrial IT</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#ot-it">OT vs IT</a></li>
            <li><a href="#infrastructure">Infrastructure</a></li>
            <li><a href="#data-flow">Data Flow</a></li>
            <li><a href="#security">Security</a></li>
            <li><a href="#standards">Standards</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Industrial IT (sometimes &ldquo;plant IT&rdquo; or the OT/IT boundary)
            covers the servers, networks, storage, and software that
            support automation systems — historians, MES, batch managers,
            engineering workstations, and the gateways between control
            networks and the enterprise.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Industrial IT lives between rigid OT lifecycles (10–20 year
            equipment, patch caution, deterministic networks) and the rapid
            change of corporate IT.
          </p>

          <h2 id="ot-it">OT vs IT</h2>
          <ul>
            <li><strong>OT priorities</strong> — availability, safety, determinism, decades-long lifecycle.</li>
            <li><strong>IT priorities</strong> — confidentiality, agility, frequent patching, short lifecycle.</li>
            <li>Patch windows are scarce in OT; segmentation makes that tolerable.</li>
            <li>Use one-way data diodes or DMZ for one-way data export.</li>
          </ul>

          <h2 id="infrastructure">Infrastructure</h2>
          <ul>
            <li>Redundant industrial / enterprise servers (often virtualized).</li>
            <li>Domain controllers, file shares, license servers, time servers.</li>
            <li>Historians and MES databases.</li>
            <li>Industrial PCs at the line; thin clients for operator HMIs.</li>
            <li>Industrial firewalls (Tofino, Fortinet RuggedFW, Cisco IE3400).</li>
            <li>Backup / DR — Veeam, Commvault; replicate off-site or cross-plant.</li>
          </ul>

          <h2 id="data-flow">Data Flow</h2>
          <ul>
            <li>PLC → OPC UA / MQTT → broker → historian.</li>
            <li>Historian → reporting (Power BI, Ignition, ThingWorx).</li>
            <li>Historian → ERP via MES (ISA-95 hierarchy).</li>
            <li>Edge / IIoT gateways for vendor cloud (Azure IoT Hub, AWS IoT).</li>
          </ul>

          <h2 id="security">Security</h2>
          <ul>
            <li>Segmentation by Purdue level; firewall between L3 and L3.5 (DMZ).</li>
            <li>Asset inventory — you can&rsquo;t protect what you can&rsquo;t see.</li>
            <li>Patch and AV exceptions documented per IEC 62443.</li>
            <li>Backup before downloads / firmware updates.</li>
            <li>Remote access via jump host with MFA, session recording.</li>
          </ul>

          <h2 id="standards">Standards</h2>
          <ul>
            <li><strong>ISA-95</strong> — enterprise/control integration.</li>
            <li><strong>IEC 62443</strong> — industrial cybersecurity.</li>
            <li><strong>NIST SP 800-82</strong> — guide to ICS security.</li>
            <li><strong>NERC CIP</strong> — bulk electric system.</li>
            <li><strong>21 CFR Part 11</strong> — electronic records / signatures (pharma).</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
