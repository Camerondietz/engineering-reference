// app/content/robotics.tsx

export default function RoboticsPage() {
  return (
    <article className="prose">
      <h1>Robotics</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#types">Robot Types</a></li>
            <li><a href="#kinematics">Kinematics &amp; Coordinates</a></li>
            <li><a href="#programming">Programming &amp; Integration</a></li>
            <li><a href="#safety">Safety</a></li>
            <li><a href="#vendors">Major Vendors</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Industrial robotics covers programmable mechanical systems that
            handle, weld, machine, paint, inspect, and assemble at industrial
            speeds and tolerances. Modern robots add vision, force sensing,
            and adaptive control.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            A robot cell is more than the robot — it includes the controller,
            teach pendant, end effector, fixtures, safety system, and
            integration with the line PLC. The robot is typically &lt;30% of
            the cell cost.
          </p>

          <h2 id="types">Robot Types</h2>
          <ul>
            <li><strong>Articulated (6-axis)</strong> — most common; high dexterity.</li>
            <li><strong>SCARA</strong> — fast pick-and-place, planar.</li>
            <li><strong>Delta / parallel</strong> — very fast picking, light loads.</li>
            <li><strong>Cartesian / gantry</strong> — large work envelopes.</li>
            <li><strong>Collaborative (cobot)</strong> — force-limited, no fencing.</li>
            <li><strong>AGV / AMR</strong> — mobile material handling.</li>
          </ul>

          <h2 id="kinematics">Kinematics &amp; Coordinates</h2>
          <ul>
            <li><strong>DOF</strong> — degrees of freedom; 6 to reach any pose.</li>
            <li>Forward kinematics — joint angles → TCP pose.</li>
            <li>Inverse kinematics — TCP pose → joint angles (multi-solution).</li>
            <li>Frames: World, Base, User, Tool (TCP), Object.</li>
            <li>Singularities: shoulder, elbow, wrist — slow or stop motion near them.</li>
          </ul>

          <h2 id="programming">Programming &amp; Integration</h2>
          <ul>
            <li>Vendor languages: TP/KAREL (FANUC), RAPID (ABB), KRL (KUKA), URScript (UR), Inform (Yaskawa).</li>
            <li>Offline simulation: RobotStudio, Roboguide, KUKA.Sim, Visual Components, RoboDK.</li>
            <li>Integration: digital I/O, EtherNet/IP, PROFINET to the cell PLC.</li>
            <li>Vision integration: Cognex, Keyence, iRVision, Halcon.</li>
            <li>ROS / ROS 2 for research &amp; mobile platforms.</li>
          </ul>

          <h2 id="safety">Safety</h2>
          <ul>
            <li><strong>ISO 10218-1/-2</strong> — robot &amp; integration safety.</li>
            <li><strong>ISO/TS 15066</strong> — collaborative operation.</li>
            <li>Risk assessment per ANSI B11.0.</li>
            <li>Safety-rated stops (Cat 0, 1, 2), safe zones, light curtains.</li>
            <li>Pendant deadman + e-stop.</li>
          </ul>

          <h2 id="vendors">Major Vendors</h2>
          <ul>
            <li>FANUC, ABB, KUKA, Yaskawa, Kawasaki, Mitsubishi, Stäubli.</li>
            <li>Cobots: Universal Robots, Doosan, Techman, FANUC CRX, ABB GoFa.</li>
            <li>Mobile: MiR, OTTO, Geek+, Locus, Boston Dynamics.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
