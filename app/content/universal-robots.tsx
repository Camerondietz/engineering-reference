// app/content/universal-robots.tsx

export default function UniversalRobotsPage() {
  return (
    <article className="prose">
      <h1>Universal Robots</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#models">Models</a></li>
            <li><a href="#polyscope">Polyscope &amp; Programming</a></li>
            <li><a href="#urscript">URScript</a></li>
            <li><a href="#urcaps">URCaps Ecosystem</a></li>
            <li><a href="#safety">Safety &amp; Collaborative Operation</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Universal Robots (UR) is the Danish company that defined the
            modern collaborative robot (cobot) market with the launch of the
            UR5 in 2008. UR cobots are lightweight, force-limited 6-axis
            arms designed to share workspace with humans.
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li>Easy out-of-box deployment — typically programmed in hours, not weeks.</li>
            <li>Built-in safety functions allow fenceless operation after risk assessment.</li>
            <li>Open ecosystem via the URCaps platform.</li>
            <li>Controller runs Debian Linux with a real-time kernel.</li>
          </ul>

          <h2 id="models">Models</h2>
          <ul>
            <li><strong>UR3e</strong> — 3 kg payload, 500 mm reach. Tabletop tasks.</li>
            <li><strong>UR5e</strong> — 5 kg, 850 mm. General light assembly &amp; tending.</li>
            <li><strong>UR10e</strong> — 12.5 kg, 1,300 mm.</li>
            <li><strong>UR16e</strong> — 16 kg, 900 mm. Heavier material handling.</li>
            <li><strong>UR20</strong> — 20 kg, 1,750 mm. Palletizing &amp; welding.</li>
            <li><strong>UR30</strong> — 30 kg, 1,300 mm. Heavy duty.</li>
          </ul>

          <h2 id="polyscope">Polyscope &amp; Programming</h2>
          <ul>
            <li>Polyscope is the touchscreen pendant UI — drag-and-drop blocks: Move, Waypoint, Set, Wait, If, Loop, Subprogram.</li>
            <li>Polyscope X (newer) is the modernized environment for current-gen UR.</li>
            <li>Free-drive (hand-guided teaching) for waypoints.</li>
            <li>Built-in conveyor tracking, palletizing wizard, force control.</li>
          </ul>

          <h2 id="urscript">URScript</h2>
          <ul>
            <li>Python-like scripting; can be embedded in Polyscope programs or sent over TCP.</li>
            <li>Functions: <code>movej</code>, <code>movel</code>, <code>movep</code>, <code>movec</code>, <code>force_mode</code>, <code>set_digital_out</code>.</li>
            <li>Real-time interface at 500 Hz over port 30001/30002/30003 for external control.</li>
            <li>RTDE (Real-Time Data Exchange) for high-rate process data exchange.</li>
            <li>Dashboard server on port 29999 for headless load / start / stop.</li>
          </ul>

          <h2 id="urcaps">URCaps Ecosystem</h2>
          <ul>
            <li>Plug-in modules from third parties — grippers (Robotiq, OnRobot, Schunk), vision (Cognex, Pickit), screwdrivers, dispensing.</li>
            <li>Installed via USB or UR+ marketplace.</li>
            <li>Adds new program nodes &amp; configuration UI to Polyscope.</li>
          </ul>

          <h2 id="safety">Safety &amp; Collaborative Operation</h2>
          <ul>
            <li>17 user-configurable safety functions — TCP/elbow force, speed, momentum, position, orientation.</li>
            <li>Certified to ISO 10218-1 / -2 and ISO/TS 15066 collaborative operation.</li>
            <li>Risk assessment is still required for any cobot installation — payload, tool, workpiece, &amp; environment matter.</li>
            <li>Force-limited mode caps contact force (typ. 80–150 N), not all hazards (pinch points, sharp tools) are addressed automatically.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
