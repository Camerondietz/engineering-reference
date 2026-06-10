// app/content/fanuc-robots.tsx

export default function FanucRobotsPage() {
  return (
    <article className="prose">
      <h1>FANUC Robots</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#models">Robot Models</a></li>
            <li><a href="#programming">Programming</a></li>
            <li><a href="#frames">Frames &amp; Setup</a></li>
            <li><a href="#vision">iRVision</a></li>
            <li><a href="#safety">Safety &amp; DCS</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            FANUC (Fuji Automatic NUmerical Control) is the world&rsquo;s
            largest industrial robot manufacturer. FANUC robots are
            recognized by their yellow color and the R-30iB / R-30iB Plus /
            R-50iA controllers running on Linux-based real-time firmware.
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li>Controller series: R-30iA (legacy), R-30iB Plus, R-50iA (latest).</li>
            <li>Teach pendant: iPendant (color touch, soft keys, jog wheel).</li>
            <li>Networking: EtherNet/IP, PROFINET, EtherCAT, DeviceNet.</li>
            <li>Integrated vision (iRVision) and force sensing options.</li>
          </ul>

          <h2 id="models">Robot Models</h2>
          <ul>
            <li><strong>LR Mate 200iD</strong> — small, 7 kg payload, tabletop.</li>
            <li><strong>M-10iD / M-20iD</strong> — medium articulated, welding &amp; handling.</li>
            <li><strong>M-710iC</strong> — long reach (1,300–3,100 mm).</li>
            <li><strong>R-2000iC</strong> — heavy 165–270 kg payload spot weld / palletize.</li>
            <li><strong>M-410 / M-710 palletizers</strong> — 4-axis high speed.</li>
            <li><strong>SR/SCARA, M-1iA delta</strong> — high-speed picking.</li>
            <li><strong>CR / CRX cobots</strong> — collaborative, force-limited.</li>
          </ul>

          <h2 id="programming">Programming</h2>
          <ul>
            <li><strong>TP (Teach Pendant) programs</strong> — line-by-line motion instructions: J / L / C (joint, linear, circular).</li>
            <li><strong>KAREL</strong> — Pascal-like text language for background tasks &amp; complex logic.</li>
            <li>Motion options: CNT (continuous) / FINE termination, ACC override.</li>
            <li>Macros for repeated routines; SUBPROGRAMS for shared code.</li>
            <li>Background logic for I/O, communication, safety supervision.</li>
            <li>ROBOGUIDE — offline programming &amp; simulation.</li>
          </ul>

          <h2 id="frames">Frames &amp; Setup</h2>
          <ul>
            <li><strong>World</strong> — robot base frame (fixed).</li>
            <li><strong>User Frame</strong> — workpiece coordinate; teach with 3- or 4-point method.</li>
            <li><strong>Tool Frame (TCP)</strong> — end of tooling; teach with 3-point or 6-point method.</li>
            <li><strong>JOG Frame</strong> — operator convenience for manual moves.</li>
            <li>Recalibrate after a crash or tool change.</li>
          </ul>

          <h2 id="vision">iRVision</h2>
          <ul>
            <li>2-D, 2.5-D, and 3-D vision built into the R-30iB controller.</li>
            <li>Cameras: SC130E / SC1300 mono, KOWA lenses; SLS-3D for true 3-D.</li>
            <li>Calibration grid for camera-to-robot frame alignment.</li>
            <li>Vision register passes offsets to motion instructions for guided picking.</li>
          </ul>

          <h2 id="safety">Safety &amp; DCS</h2>
          <ul>
            <li><strong>DCS (Dual Check Safety)</strong> — software-defined safe zones, joint limits, speed limits monitored by redundant CPUs.</li>
            <li>SIL2 / PLd safety functions on standard controller; SIL3 / PLe with options.</li>
            <li>Safe I/O for door switches, light curtains, e-stops.</li>
            <li>Required risk assessment per ISO 10218 / RIA TR R15.306.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
