// app/content/scada.tsx

export default function ScadaPage() {
  return (
    <article className="prose">
      <h1>SCADA</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#components">Components</a></li>
            <li><a href="#hmi-design">HMI Design</a></li>
            <li><a href="#alarms">Alarm Management</a></li>
            <li><a href="#data-history">Tags &amp; Historians</a></li>
            <li><a href="#platforms">Platforms</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            SCADA — Supervisory Control and Data Acquisition — is the
            operator-facing layer above PLCs and RTUs. It visualizes plant
            state, issues setpoint commands, records history, and manages
            alarms across geographically distributed assets.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            SCADA differs from a local HMI by scope: an HMI is one screen on
            one machine; SCADA covers entire plants, pipelines, water
            districts, or substations.
          </p>

          <h2 id="components">Components</h2>
          <ul>
            <li><strong>Field devices</strong> — PLCs, RTUs, IEDs, smart instruments.</li>
            <li><strong>Communications</strong> — Ethernet, fiber, cellular, radio, satellite.</li>
            <li><strong>SCADA server</strong> — polls / subscribes, runs scripts, hosts the tag database.</li>
            <li><strong>Historian</strong> — long-term time-series storage with compression.</li>
            <li><strong>HMI / operator clients</strong> — thick clients or web browsers.</li>
            <li><strong>Engineering workstation</strong> — for development &amp; deployment.</li>
          </ul>

          <h2 id="hmi-design">HMI Design</h2>
          <ul>
            <li>Follow <strong>ISA-101</strong> / High-Performance HMI principles.</li>
            <li>Grayscale &ldquo;at rest&rdquo;; color only for abnormal conditions.</li>
            <li>Layered displays: Level 1 overview → Level 4 detail.</li>
            <li>Consistent symbol library; trend embedded with the asset.</li>
            <li>Avoid 3-D shading, gradients, and distracting animations.</li>
          </ul>

          <h2 id="alarms">Alarm Management</h2>
          <ul>
            <li><strong>ISA-18.2 / IEC 62682</strong> — alarm philosophy &amp; lifecycle.</li>
            <li>Rationalize: every alarm must have an action and a response time.</li>
            <li>Target rates: &lt;1 alarm/op/10 min steady state; &lt;10 in first 10 min of upset.</li>
            <li>Use priority tiers; suppress redundant chattering alarms.</li>
            <li>Track KPIs: average rate, peak, standing, shelved.</li>
          </ul>

          <h2 id="data-history">Tags &amp; Historians</h2>
          <ul>
            <li>Tags scale from thousands to millions; naming conventions matter.</li>
            <li>Dead-band &amp; rate compression in the historian.</li>
            <li>Time-series stores: PI System, AVEVA Historian (Wonderware), Ignition Tag Historian, Canary, InfluxDB.</li>
            <li>Common interfaces: OPC UA, OPC DA (legacy), MQTT Sparkplug B.</li>
          </ul>

          <h2 id="platforms">Platforms</h2>
          <ul>
            <li><strong>AVEVA</strong> System Platform / Plant SCADA (Citect) / InTouch.</li>
            <li><strong>Rockwell</strong> FactoryTalk View SE / ME.</li>
            <li><strong>Siemens</strong> WinCC, WinCC OA.</li>
            <li><strong>Inductive Automation Ignition.</strong></li>
            <li><strong>GE Cimplicity, iFIX.</strong></li>
            <li><strong>Schneider</strong> EcoStruxure / ClearSCADA / Geo SCADA.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
