// app/content/motion-control.tsx

export default function MotionControlPage() {
  return (
    <article className="prose">
      <h1>Motion Control</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#components">System Components</a></li>
            <li><a href="#profiles">Motion Profiles</a></li>
            <li><a href="#tuning">Loop Tuning</a></li>
            <li><a href="#multi-axis">Multi-Axis Coordination</a></li>
            <li><a href="#platforms">Platforms</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Motion control is the precise command of position, velocity,
            torque, or force in mechanical systems. It blends motor sizing,
            mechanical design, drives, controllers, and tuning into one
            tightly-coupled discipline.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            A motion system has three nested loops: <strong>torque (current)
            → velocity → position</strong>. Each is tuned independently,
            inside-out. Mechanical resonance, backlash, and stiffness
            dominate what bandwidth is achievable.
          </p>

          <h2 id="components">System Components</h2>
          <ul>
            <li><strong>Motor</strong> — servo, stepper, linear, torque.</li>
            <li><strong>Drive / amplifier</strong> — closes torque and velocity loops.</li>
            <li><strong>Feedback</strong> — incremental or absolute encoder, resolver.</li>
            <li><strong>Controller</strong> — closes position loop; coordinates axes.</li>
            <li><strong>Mechanics</strong> — ball-screw, belt, rack &amp; pinion, direct drive.</li>
          </ul>

          <h2 id="profiles">Motion Profiles</h2>
          <ul>
            <li><strong>Trapezoidal</strong> — constant accel, cruise, decel.</li>
            <li><strong>S-curve</strong> — limited jerk; smoother on mechanical structure.</li>
            <li><strong>Polynomial / spline</strong> — for vibration-sensitive paths.</li>
            <li><strong>CAM / electronic gearing</strong> — slave axis follows master.</li>
            <li><strong>Interpolation</strong> — linear, circular, helical for multi-axis.</li>
          </ul>

          <h2 id="tuning">Loop Tuning</h2>
          <ul>
            <li>Tune torque loop first (often factory-tuned for the motor).</li>
            <li>Tune velocity — raise P until oscillation, back off ~30%.</li>
            <li>Add I to remove steady-state error; watch overshoot.</li>
            <li>Tune position last; cascade outputs to velocity reference.</li>
            <li>Add feedforward (velocity, acceleration) to reduce tracking error.</li>
            <li>Notch / low-pass filters at resonance frequencies.</li>
          </ul>

          <h2 id="multi-axis">Multi-Axis Coordination</h2>
          <ul>
            <li>Synchronized motion — gantries, dual-axis YY tables.</li>
            <li>CNC: G-code interpolation across 3, 4, 5+ axes.</li>
            <li>Robotic kinematic transforms.</li>
            <li>EtherCAT / SERCOS III / PROFINET IRT for deterministic update (typically 250 μs–4 ms).</li>
          </ul>

          <h2 id="platforms">Platforms</h2>
          <ul>
            <li><strong>Rockwell</strong> — Kinetix drives, ControlLogix motion.</li>
            <li><strong>Siemens</strong> — Sinamics drives, S7-1500T technology CPU.</li>
            <li><strong>Beckhoff</strong> — TwinCAT NC/CNC, AX drives.</li>
            <li><strong>Bosch Rexroth</strong> — IndraDrive / MotionLogic.</li>
            <li><strong>Yaskawa</strong> — Sigma servo, MP motion controllers.</li>
            <li><strong>Mitsubishi</strong> — MR-J5 servo, Q/R motion CPUs.</li>
            <li><strong>Aerotech, ACS, Delta Tau (Omron)</strong> — high-end motion.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
