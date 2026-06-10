// app/content/industrial-automation.tsx

export default function IndustrialAutomationPage() {
  return (
    <article className="prose">
      <h1>Industrial Automation</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#automation-pyramid">Automation Pyramid</a></li>
            <li><a href="#building-blocks">Building Blocks</a></li>
            <li><a href="#design-flow">Project Workflow</a></li>
            <li><a href="#integration">Integration Challenges</a></li>
            <li><a href="#standards">Standards</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Industrial automation uses control systems — PLCs, drives,
            robots, instruments, HMI / SCADA, MES — to operate factories,
            utilities, and process plants with minimal direct human
            intervention.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Automation is justified by safety, consistent quality,
            throughput, labor cost, and the ability to operate around the
            clock. It is constrained by capital, downtime risk, and skill
            availability.
          </p>

          <h2 id="automation-pyramid">Automation Pyramid</h2>
          <ul>
            <li><strong>Field</strong> — sensors, actuators, drives.</li>
            <li><strong>Control</strong> — PLCs, RTUs, DCS.</li>
            <li><strong>Supervisory</strong> — SCADA, HMI.</li>
            <li><strong>Plant management</strong> — MES, historian, batch.</li>
            <li><strong>Enterprise</strong> — ERP, PLM.</li>
          </ul>

          <h2 id="building-blocks">Building Blocks</h2>
          <ul>
            <li>Programmable controllers (PLC / DCS / IPC).</li>
            <li>HMI / SCADA software.</li>
            <li>Servo &amp; VFD drives.</li>
            <li>Industrial robots and vision.</li>
            <li>Industrial networking (EtherNet/IP, PROFINET, Modbus, EtherCAT, OPC UA).</li>
            <li>Safety systems (safety PLC, light curtains, safe drives).</li>
            <li>Industrial PCs and historians.</li>
          </ul>

          <h2 id="design-flow">Project Workflow</h2>
          <ol>
            <li>URS / FRS — user &amp; functional requirements.</li>
            <li>Conceptual design &amp; vendor selection.</li>
            <li>Detailed design — schematics, P&amp;IDs, network drawings.</li>
            <li>Panel build &amp; software development.</li>
            <li>FAT — factory acceptance test.</li>
            <li>Install &amp; commission on site.</li>
            <li>SAT — site acceptance test.</li>
            <li>Hand-over, training, warranty support.</li>
          </ol>

          <h2 id="integration">Integration Challenges</h2>
          <ul>
            <li>Mixed-vendor protocol translation (OPC UA, gateways).</li>
            <li>OT/IT segmentation per IEC 62443.</li>
            <li>Legacy equipment with limited connectivity.</li>
            <li>Time synchronization (PTP/NTP) across cells.</li>
            <li>Change management — every download is a risk.</li>
          </ul>

          <h2 id="standards">Standards</h2>
          <ul>
            <li><strong>IEC 61131-3</strong> — PLC programming languages.</li>
            <li><strong>ISA-95</strong> — enterprise / control integration.</li>
            <li><strong>ISA-88</strong> — batch control.</li>
            <li><strong>ISA-101</strong> — HMI design.</li>
            <li><strong>IEC 62443</strong> — industrial cybersecurity.</li>
            <li><strong>NFPA 79</strong> — industrial machinery electrical.</li>
            <li><strong>ISO 13849 / IEC 62061</strong> — functional safety of machinery.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
