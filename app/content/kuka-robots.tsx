// app/content/kuka-robots.tsx

export default function KukaRobotsPage() {
  return (
    <article className="prose">
      <h1>KUKA Robots</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#models">Models</a></li>
            <li><a href="#krl">KRL Programming</a></li>
            <li><a href="#frames">Frames &amp; Setup</a></li>
            <li><a href="#workvisual">WorkVisual</a></li>
            <li><a href="#safety">SafeOperation</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            KUKA (originally Keller und Knappich Augsburg) is a German robot
            OEM identifiable by its bright orange livery. Controllers run
            <strong> KUKA System Software (KSS)</strong> on a real-time
            Windows-based platform, programmed in <strong>KRL</strong> (KUKA
            Robot Language).
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li>Controllers: KR C4, KR C5 (current), KR C5 micro.</li>
            <li>Teach pendant: smartPAD (touchscreen with mode key &amp; 6D mouse).</li>
            <li>Networks: PROFINET, EtherNet/IP, EtherCAT, KUKA Line Interface (KLI).</li>
            <li>Strong presence in automotive body shops, aerospace, foundry, large-payload work.</li>
          </ul>

          <h2 id="models">Models</h2>
          <ul>
            <li><strong>KR AGILUS</strong> — small (3–10 kg), high speed.</li>
            <li><strong>KR CYBERTECH</strong> — medium duty welding &amp; handling.</li>
            <li><strong>KR IONTEC, KR QUANTEC</strong> — mid range general purpose.</li>
            <li><strong>KR FORTEC, KR TITAN</strong> — heavy / extreme payload (up to 1,300 kg).</li>
            <li><strong>LBR iiwa</strong> — 7-axis sensitive / collaborative.</li>
            <li><strong>KMR iiwa / KMP</strong> — mobile platforms.</li>
          </ul>

          <h2 id="krl">KRL Programming</h2>
          <ul>
            <li>Pascal-like syntax with <code>DEF</code> programs &amp; <code>DEFFCT</code> functions.</li>
            <li>Motion: <code>PTP</code> (joint), <code>LIN</code> (linear), <code>CIRC</code> (circular).</li>
            <li>Approximation: <code>C_PTP</code>, <code>C_DIS</code>, <code>C_VEL</code>, <code>C_ORI</code>.</li>
            <li>System variables ($) for I/O, speeds, overrides.</li>
            <li>Submit interpreter for background tasks (similar to FANUC&rsquo;s background logic).</li>
            <li>Inline forms (Inline-Formulare) on the pendant for guided programming.</li>
          </ul>

          <h2 id="frames">Frames &amp; Setup</h2>
          <ul>
            <li><strong>$BASE</strong> — work object / base frame.</li>
            <li><strong>$TOOL</strong> — TCP frame.</li>
            <li><strong>$WORLD</strong>, <strong>$ROBROOT</strong> — global references.</li>
            <li>TCP measurement via XYZ 4-point / 6-point.</li>
            <li>Base via 3-point method.</li>
          </ul>

          <h2 id="workvisual">WorkVisual</h2>
          <ul>
            <li>Engineering environment for KR C4/C5 — configure I/O, fieldbus, safety, RoboTeam coordination.</li>
            <li>Manages KSS options &amp; technology packages (Arc, Spot, MillingTech).</li>
            <li><strong>KUKA.Sim</strong> for offline programming &amp; cell simulation.</li>
            <li>OPC UA &amp; mxAutomation interfaces for PLC-driven motion.</li>
          </ul>

          <h2 id="safety">SafeOperation</h2>
          <ul>
            <li>SafeOperation / SafeRangeMonitoring — software-defined safe zones, axis limits, monitored speeds.</li>
            <li>SIL3 / PLe per IEC 61508 / ISO 13849.</li>
            <li>Safe I/O via PROFIsafe or CIP Safety.</li>
            <li>Enables fenceless layouts, sensitive cobot operation on LBR iiwa.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
