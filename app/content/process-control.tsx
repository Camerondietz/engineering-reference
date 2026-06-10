// app/content/process-control.tsx

export default function ProcessControlPage() {
  return (
    <article className="prose">
      <h1>Process Control</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#process-types">Process Types</a></li>
            <li><a href="#control-strategies">Control Strategies</a></li>
            <li><a href="#process-dynamics">Process Dynamics</a></li>
            <li><a href="#dcs-vs-plc">DCS vs PLC</a></li>
            <li><a href="#standards">Standards</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Process control regulates continuous variables — temperature,
            pressure, flow, level, composition — in chemicals, refining,
            food, pharma, pulp/paper, power, water/wastewater, and oil &amp;
            gas.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            The control engineer&rsquo;s job is to hold variables at setpoint
            despite disturbances, while respecting equipment limits, safety,
            economics, and operator workload.
          </p>

          <h2 id="process-types">Process Types</h2>
          <ul>
            <li><strong>Continuous</strong> — steady flow (refining, papermaking).</li>
            <li><strong>Batch</strong> — recipe-driven, time- and event-stepped (pharma, specialty chemicals).</li>
            <li><strong>Discrete</strong> — count-based parts (handled by PLC/motion).</li>
            <li><strong>Hybrid</strong> — semi-continuous, e.g. food/beverage.</li>
          </ul>

          <h2 id="control-strategies">Control Strategies</h2>
          <ul>
            <li><strong>Feedback (PID)</strong> — the workhorse.</li>
            <li><strong>Feedforward</strong> — pre-act on measured disturbance.</li>
            <li><strong>Cascade</strong> — outer loop sets the SP of an inner loop (faster process).</li>
            <li><strong>Ratio</strong> — keep one variable proportional to another.</li>
            <li><strong>Split-range</strong> — one controller driving two valves over different ranges.</li>
            <li><strong>Override / select</strong> — high/low signal selector for constraint control.</li>
            <li><strong>MPC</strong> — model predictive control for multivariable, constrained systems.</li>
          </ul>

          <h2 id="process-dynamics">Process Dynamics</h2>
          <ul>
            <li>First-order plus dead time (FOPDT): K, τ, θ.</li>
            <li>Integrating processes — level, gas pressure.</li>
            <li>Inverse response, runaway, oscillatory dynamics.</li>
            <li>Identify with step / doublet / PRBS tests.</li>
            <li>Tune with Lambda (IMC), Ziegler-Nichols, Cohen-Coon, or auto-tune.</li>
          </ul>

          <h2 id="dcs-vs-plc">DCS vs PLC</h2>
          <ul>
            <li><strong>DCS</strong> — distributed I/O on plant network; integrated HMI, engineering, history; tuned for analog/regulatory control.</li>
            <li><strong>PLC + SCADA</strong> — discrete-strong, often cheaper; bolt on HMI/historian.</li>
            <li>Modern lines blur: most PLCs handle PID well; many DCSs handle sequencing.</li>
            <li>DCS vendors: Emerson DeltaV, Honeywell Experion, Yokogawa CENTUM, ABB 800xA, Siemens PCS 7 / PCS neo, Rockwell PlantPAx.</li>
          </ul>

          <h2 id="standards">Standards</h2>
          <ul>
            <li><strong>ISA-5.1</strong> — instrumentation symbols (P&amp;ID).</li>
            <li><strong>ISA-88</strong> — batch control.</li>
            <li><strong>ISA-95</strong> — enterprise-control integration (MES).</li>
            <li><strong>ISA-101</strong> — HMI design.</li>
            <li><strong>IEC 61511 / ISA-84</strong> — safety instrumented systems.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
