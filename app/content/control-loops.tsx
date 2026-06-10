// app/content/control-loops.tsx

export default function ControlLoopsPage() {
  return (
    <article className="prose">
      <h1>Control Loops</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#types">Types of Loops</a></li>
            <li><a href="#stability">Stability &amp; Performance</a></li>
            <li><a href="#advanced">Advanced Strategies</a></li>
            <li><a href="#metrics">Performance Metrics</a></li>
            <li><a href="#monitoring">Loop Monitoring</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            A control loop is the closed circle of measurement, decision,
            and action that holds a process variable near its setpoint.
            Loops can be simple feedback or layered into sophisticated
            strategies for tough processes.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Every loop has four elements: sensor → transmitter → controller
            → final element. Any weak link limits the whole loop.
          </p>

          <h2 id="types">Types of Loops</h2>
          <ul>
            <li><strong>Open-loop</strong> — output is set without measuring the result.</li>
            <li><strong>Closed-loop (feedback)</strong> — output adjusts based on measured error.</li>
            <li><strong>Feedforward</strong> — output reacts to a measured disturbance before the PV changes.</li>
            <li><strong>Cascade</strong> — outer loop&rsquo;s output is inner loop&rsquo;s setpoint (e.g., temperature → jacket valve flow).</li>
            <li><strong>Ratio</strong> — keeps one stream proportional to another.</li>
            <li><strong>Split-range</strong> — one controller drives two final elements across a range.</li>
            <li><strong>Override / select</strong> — low/high signal selector chooses between competing controllers.</li>
          </ul>

          <h2 id="stability">Stability &amp; Performance</h2>
          <ul>
            <li>Gain margin &gt; 6 dB; phase margin &gt; 45° as rule-of-thumb for robust loops.</li>
            <li>Dead time hurts more than process gain — minimize sensor lag and sample period.</li>
            <li>Filter just enough to suppress noise without slowing the loop.</li>
            <li>Tune at the operating region the loop will live in.</li>
          </ul>

          <h2 id="advanced">Advanced Strategies</h2>
          <ul>
            <li><strong>Smith predictor</strong> — compensates for known dead time.</li>
            <li><strong>MPC</strong> — multivariable, constrained optimization in real time.</li>
            <li><strong>Gain scheduling</strong> — different tuning for different operating regions.</li>
            <li><strong>Adaptive control</strong> — automatic re-tuning as plant changes.</li>
            <li><strong>Fuzzy logic / rule-based</strong> — handles nonlinearities heuristically.</li>
          </ul>

          <h2 id="metrics">Performance Metrics</h2>
          <ul>
            <li><strong>IAE</strong> = ∫|e(t)|dt</li>
            <li><strong>ISE</strong> = ∫e(t)²dt (penalizes large errors)</li>
            <li><strong>ITAE</strong> = ∫t·|e(t)|dt (penalizes sustained error)</li>
            <li>Rise time, settling time, overshoot %, decay ratio (¼ for ZN).</li>
            <li>Output travel — surrogate for valve wear.</li>
          </ul>

          <h2 id="monitoring">Loop Monitoring</h2>
          <ul>
            <li>Identify oscillating loops with cross-correlation across the plant.</li>
            <li>Track time in auto / manual / cascade.</li>
            <li>Watch valve position vs travel limits — stiction is a top cause of oscillation.</li>
            <li>Tools: Honeywell Loop Scout, Emerson PlantWeb, ExperTune PlantTriage, AspenTech aspenONE APC.</li>
            <li>Most plants improve performance more by maintaining loops than by upgrading them.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
