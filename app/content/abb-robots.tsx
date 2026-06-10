// app/content/abb-robots.tsx

export default function AbbRobotsPage() {
  return (
    <article className="prose">
      <h1>ABB Robots</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#models">Robot Models</a></li>
            <li><a href="#rapid">RAPID Programming</a></li>
            <li><a href="#frames-data">Frames &amp; Data Types</a></li>
            <li><a href="#robotstudio">RobotStudio</a></li>
            <li><a href="#safety">SafeMove</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            ABB Robotics (now part of ABB&rsquo;s Process Automation business) is
            one of the &ldquo;Big Four&rdquo; industrial robot OEMs. ABB robots use the
            <strong> IRC5</strong> controller family (and the newer{" "}
            <strong>OmniCore</strong>) running the RAPID programming language.
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li>Controllers: IRC5 (Compact / Single / Dual / Panel-mounted), OmniCore C30 / E10 / V250XT.</li>
            <li>Pendant: FlexPendant (Windows CE) on IRC5, capacitive multi-touch on OmniCore.</li>
            <li>Network: EtherNet/IP, PROFINET, EtherCAT, DeviceNet.</li>
            <li>Multi-robot coordination via MultiMove (up to 4 robots in one controller).</li>
          </ul>

          <h2 id="models">Robot Models</h2>
          <ul>
            <li><strong>IRB 120 / 1100</strong> — small, ~3–4 kg payload, table-top.</li>
            <li><strong>IRB 1200 / 1600</strong> — small / medium handling, welding.</li>
            <li><strong>IRB 2600 / 4600</strong> — general purpose 12–60 kg.</li>
            <li><strong>IRB 6700 / 7600 / 8700</strong> — heavy payload, body-in-white welding.</li>
            <li><strong>IRB 360 FlexPicker</strong> — delta high-speed picking.</li>
            <li><strong>IRB 460 / 660 / 760</strong> — palletizers.</li>
            <li><strong>YuMi (IRB 14000), GoFa, SWIFTI</strong> — cobots.</li>
          </ul>

          <h2 id="rapid">RAPID Programming</h2>
          <ul>
            <li>Structured, Pascal-like; PROC routines, FUNC functions, TRAP interrupts.</li>
            <li>Motion instructions: <code>MoveJ</code>, <code>MoveL</code>, <code>MoveC</code>, <code>MoveAbsJ</code>.</li>
            <li>Zone data (z1, z10, fine) for path blending.</li>
            <li>Speed data (v50, v500, vmax).</li>
            <li>Modules organized in tasks; concurrent semi-static / static tasks for I/O monitoring.</li>
          </ul>

          <h2 id="frames-data">Frames &amp; Data Types</h2>
          <ul>
            <li><strong>tooldata</strong> — TCP definition + load.</li>
            <li><strong>wobjdata</strong> — work object frame.</li>
            <li><strong>robtarget</strong> — pose (position + orientation + config + external axis).</li>
            <li><strong>jointtarget</strong> — joint angles + external axes.</li>
            <li>Always set tool &amp; wobj at the start of a motion block.</li>
          </ul>

          <h2 id="robotstudio">RobotStudio</h2>
          <ul>
            <li>Free for offline programming, paid Premium for advanced features.</li>
            <li>Imports CAD, builds cell, simulates cycle time, generates RAPID.</li>
            <li>Virtual Controller is the same software running on the real robot — what works in simulation runs on the real one.</li>
            <li>Add-Ins for arc welding, machining (PowerPac), painting.</li>
          </ul>

          <h2 id="safety">SafeMove</h2>
          <ul>
            <li>SafeMove 2 / Pro — software-defined safe zones, monitored speed, axis limits.</li>
            <li>SIL3 / PLe per IEC 61508 / ISO 13849.</li>
            <li>Configured via RobotStudio; activated by safe I/O signals.</li>
            <li>Enables fenceless / collaborative cell layouts when combined with cobots or area scanners.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
