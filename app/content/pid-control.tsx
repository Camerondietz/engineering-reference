// app/content/pid-control.tsx

export default function PidControlPage() {
  return (
    <article className="prose">
      <h1>PID Control</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#equation">The PID Equation</a></li>
            <li><a href="#actions">Term Behavior</a></li>
            <li><a href="#tuning">Tuning</a></li>
            <li><a href="#enhancements">Practical Enhancements</a></li>
            <li><a href="#troubleshooting">Troubleshooting</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            PID — Proportional, Integral, Derivative — is the workhorse
            control algorithm of industry. The vast majority of regulatory
            control in process and motion systems is some form of PID,
            often with practical refinements layered on top.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            A PID controller computes an error (setpoint − process variable)
            and produces an output that combines a reaction to the present
            error (P), the accumulation of past error (I), and the rate of
            change of error (D).
          </p>

          <h2 id="equation">The PID Equation</h2>
          <p>
            <strong>Ideal (parallel):</strong> u(t) = K<sub>p</sub>·e(t) +
            K<sub>i</sub>·∫e(τ)dτ + K<sub>d</sub>·de/dt
          </p>
          <p>
            <strong>Standard (ISA):</strong> u(t) = K<sub>p</sub> · ( e(t) +
            (1/T<sub>i</sub>)·∫e(τ)dτ + T<sub>d</sub>·de/dt )
          </p>
          <p>
            <strong>Series (interacting):</strong> common in older PLCs and
            pneumatic controllers; gains interact across terms.
          </p>

          <h2 id="actions">Term Behavior</h2>
          <ul>
            <li><strong>P</strong> — instant proportional response to error. Higher K<sub>p</sub> = faster but more oscillation. Alone, leaves an offset.</li>
            <li><strong>I</strong> — eliminates steady-state offset by integrating error. Too much I → oscillation &amp; wind-up.</li>
            <li><strong>D</strong> — anticipates change. Helps damp; very sensitive to noise; usually applied to PV (not error) to avoid &ldquo;derivative kick&rdquo; on setpoint changes.</li>
          </ul>

          <h2 id="tuning">Tuning</h2>
          <ul>
            <li><strong>Ziegler-Nichols (closed loop):</strong> raise K<sub>p</sub> until sustained oscillation (K<sub>u</sub>, P<sub>u</sub>); set Kp = 0.6 K<sub>u</sub>, T<sub>i</sub> = 0.5 P<sub>u</sub>, T<sub>d</sub> = 0.125 P<sub>u</sub>.</li>
            <li><strong>Ziegler-Nichols (open loop / reaction curve):</strong> bump test gives gain K, time constant τ, dead time θ; set tunes from table.</li>
            <li><strong>Lambda (IMC) tuning:</strong> closed-loop time constant λ chosen for desired response; mild, conservative tuning that copes with model error.</li>
            <li><strong>Cohen-Coon</strong> — faster than ZN for processes with significant dead time.</li>
            <li><strong>Auto-tune</strong> — built into most modern PLCs / DCSs (relay-feedback methods).</li>
          </ul>

          <h2 id="enhancements">Practical Enhancements</h2>
          <ul>
            <li><strong>Anti-windup</strong> — clamp or back-calculate the integral when output is saturated.</li>
            <li><strong>Bumpless transfer</strong> — preload integral when switching auto / manual.</li>
            <li><strong>Setpoint weighting (2-DOF)</strong> — different gains for SP changes vs disturbances.</li>
            <li><strong>Derivative filtering</strong> — low-pass filter D term (filter coeff. N ≈ 8–20).</li>
            <li><strong>Output rate-of-change limit</strong> — protect final control element.</li>
            <li><strong>Deadband / gap</strong> — for nuisance valve cycling.</li>
          </ul>

          <h2 id="troubleshooting">Troubleshooting</h2>
          <ul>
            <li>If loop oscillates: reduce P, then add a bit more I.</li>
            <li>If response is sluggish: increase P; reduce I if integral is winding too slowly.</li>
            <li>If valve is hunting around setpoint: noise on PV — add filter, reduce D.</li>
            <li>If output saturates and won&rsquo;t come down: anti-windup not configured.</li>
            <li>Always tune in normal operating region; tuning at startup or low load often fails at design point.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
