// app/content/actuators.tsx

export default function ActuatorsPage() {
  return (
    <article className="prose">
      <h1>Actuators</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#electric">Electric</a></li>
            <li><a href="#pneumatic">Pneumatic</a></li>
            <li><a href="#hydraulic">Hydraulic</a></li>
            <li><a href="#selection">Selection &amp; Sizing</a></li>
            <li><a href="#control">Control &amp; Feedback</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            An actuator converts a control signal into motion or force —
            spinning a shaft, opening a valve, pushing a load. The three
            families are electric, pneumatic, and hydraulic, each with
            distinct strengths.
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li><strong>Electric</strong> — precise, clean, easy to control.</li>
            <li><strong>Pneumatic</strong> — fast, simple, inherently overload-safe.</li>
            <li><strong>Hydraulic</strong> — enormous force in a small package.</li>
          </ul>

          <h2 id="electric">Electric</h2>
          <ul>
            <li><strong>AC induction</strong> — workhorse for pumps, fans, conveyors.</li>
            <li><strong>AC servo (PMSM)</strong> — high dynamic response, closed-loop.</li>
            <li><strong>BLDC</strong> — small, efficient, integrated drive electronics.</li>
            <li><strong>Stepper</strong> — open-loop indexing; no feedback needed for many tasks.</li>
            <li><strong>DC brushed</strong> — simple, low cost, brush wear.</li>
            <li><strong>Linear motor</strong> — direct linear force, no transmission backlash.</li>
            <li><strong>Solenoid / voice coil</strong> — short-stroke, fast switching.</li>
          </ul>

          <h2 id="pneumatic">Pneumatic</h2>
          <ul>
            <li><strong>Cylinders</strong> — single- vs double-acting, rodless, rotary.</li>
            <li><strong>Air motors / vane motors.</strong></li>
            <li><strong>Grippers</strong> — parallel, angular, vacuum.</li>
            <li>Typical supply 6–8 bar (90–116 psi).</li>
            <li>Speed control via flow regulators on the exhaust port (meter-out).</li>
          </ul>

          <h2 id="hydraulic">Hydraulic</h2>
          <ul>
            <li><strong>Cylinders</strong> — tie-rod, welded; bore 1.5–24+ inches.</li>
            <li><strong>Hydraulic motors</strong> — gear, vane, piston; up to thousands of Nm.</li>
            <li>System pressures typically 1,500–5,000 psi (mobile up to 6,000+).</li>
            <li>Force F = P × A; piston-side vs rod-side area differ.</li>
          </ul>

          <h2 id="selection">Selection &amp; Sizing</h2>
          <ul>
            <li>Define load — force, torque, inertia, friction, duty cycle.</li>
            <li>Define motion profile — stroke, speed, acceleration, dwell.</li>
            <li>Apply service factor (typ. 1.25–2.0).</li>
            <li>Check thermal duty (RMS torque, ED%).</li>
            <li>Verify environment — IP rating, temperature, EX, washdown.</li>
          </ul>

          <h2 id="control">Control &amp; Feedback</h2>
          <ul>
            <li>VFD for AC induction; servo drive (e.g. Kinetix, Sinamics, Beckhoff, Yaskawa, Mitsubishi) for servo.</li>
            <li>Encoders / resolvers / Hall sensors for position.</li>
            <li>Current sense for torque control.</li>
            <li>PID loops for position, velocity, torque (cascaded).</li>
            <li>Safety functions — STO, SS1, SLS per IEC 61800-5-2.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
