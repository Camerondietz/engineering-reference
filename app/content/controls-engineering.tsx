// app/content/controls-engineering.tsx

export default function ControlsEngineeringPage() {
  return (
    <article className="prose">
      <h1>Controls Engineering</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#system-types">System Types</a></li>
            <li><a href="#analysis">Analysis &amp; Tools</a></li>
            <li><a href="#design">Controller Design</a></li>
            <li><a href="#discrete">Discrete-Time / Digital</a></li>
            <li><a href="#tools">Software</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Controls engineering designs systems that drive measured
            quantities toward a desired behavior — speed, position,
            temperature, pressure — using feedback and feedforward.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Classical control treats single-input/single-output (SISO)
            linear systems with transfer functions. Modern control adds
            state-space, multivariable, optimal, robust, and adaptive
            methods.
          </p>

          <h2 id="system-types">System Types</h2>
          <ul>
            <li>Linear vs nonlinear.</li>
            <li>Continuous- vs discrete-time.</li>
            <li>Time-invariant vs time-varying.</li>
            <li>SISO vs MIMO.</li>
            <li>Open- vs closed-loop.</li>
          </ul>

          <h2 id="analysis">Analysis &amp; Tools</h2>
          <ul>
            <li>Transfer function G(s), block diagrams, signal-flow.</li>
            <li>Poles, zeros, and stability (LHP poles).</li>
            <li>Step / impulse / frequency response.</li>
            <li>Bode plot — gain &amp; phase margin.</li>
            <li>Nyquist criterion for stability.</li>
            <li>Root locus — closed-loop pole movement with gain.</li>
          </ul>

          <h2 id="design">Controller Design</h2>
          <ul>
            <li>P, PI, PID, PI with derivative on PV, two-degree-of-freedom.</li>
            <li>Lead, lag, lead-lag compensators.</li>
            <li>State-feedback &amp; observer (pole placement, LQR/LQG).</li>
            <li>Model Predictive Control (MPC) for constrained MIMO.</li>
            <li>Adaptive / gain-scheduled control for nonlinear plants.</li>
            <li>Feedforward to cancel measurable disturbances.</li>
          </ul>

          <h2 id="discrete">Discrete-Time / Digital</h2>
          <ul>
            <li>Sample rate ≥ 10× closed-loop bandwidth (rule of thumb).</li>
            <li>Z-transform; pole placement in the unit disk.</li>
            <li>Anti-aliasing filter before ADC.</li>
            <li>Tustin / bilinear transform for s → z.</li>
            <li>Fixed-point vs floating-point trade-offs on microcontrollers.</li>
          </ul>

          <h2 id="tools">Software</h2>
          <ul>
            <li>MATLAB / Simulink (Control System Toolbox, Simulink Control Design).</li>
            <li>Python — python-control, scipy.signal, slycot.</li>
            <li>Maple, Mathematica, Octave.</li>
            <li>System identification: MATLAB SI Toolbox, SIPPY.</li>
            <li>HIL / RCP: dSPACE, Speedgoat, NI VeriStand, Simulink Real-Time.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
