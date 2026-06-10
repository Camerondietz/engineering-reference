// app/content/industrial-engineering.tsx

export default function IndustrialEngineeringPage() {
  return (
    <article className="prose">
      <h1>Industrial Engineering</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#lean-and-six-sigma">Lean &amp; Six Sigma</a></li>
            <li><a href="#operations-research">Operations Research</a></li>
            <li><a href="#ergonomics">Ergonomics</a></li>
            <li><a href="#metrics">Key Metrics</a></li>
            <li><a href="#tools">Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Industrial engineering designs, improves, and installs integrated
            systems of people, materials, equipment, energy, and information
            to maximize productivity, quality, and safety.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Where mechanical and electrical engineers focus on the components,
            industrial engineers focus on the <em>flow</em> — how work,
            material, and information move through a facility, and how to
            make that flow faster, cheaper, and more reliable.
          </p>

          <h2 id="lean-and-six-sigma">Lean &amp; Six Sigma</h2>
          <ul>
            <li><strong>Seven wastes (TIMWOOD):</strong> Transport, Inventory, Motion, Waiting, Overproduction, Overprocessing, Defects.</li>
            <li><strong>5S:</strong> Sort, Set in order, Shine, Standardize, Sustain.</li>
            <li><strong>Kaizen, Kanban, SMED, Poka-yoke, Heijunka, Jidoka, A3.</strong></li>
            <li><strong>DMAIC:</strong> Define, Measure, Analyze, Improve, Control.</li>
            <li><strong>Belts:</strong> White, Yellow, Green, Black, Master Black.</li>
          </ul>

          <h2 id="operations-research">Operations Research</h2>
          <ul>
            <li>Linear &amp; integer programming (LP/MIP).</li>
            <li>Queuing theory (M/M/1, M/M/c, Little&rsquo;s Law: L = λW).</li>
            <li>Network flows, shortest path, transportation/assignment.</li>
            <li>Inventory models (EOQ, newsvendor, multi-echelon).</li>
            <li>Discrete-event simulation.</li>
          </ul>

          <h2 id="ergonomics">Ergonomics</h2>
          <p>
            Human factors engineering reduces injury and fatigue through
            workplace design. Reference standards: <strong>ANSI/HFES 100
            </strong> (computer workstations), <strong>NIOSH lifting
            equation</strong>, RULA and REBA assessments, and ISO 6385
            principles.
          </p>

          <h2 id="metrics">Key Metrics</h2>
          <ul>
            <li><strong>OEE</strong> = Availability × Performance × Quality (world-class ≈ 85%).</li>
            <li><strong>Takt time</strong> = Available production time / Customer demand.</li>
            <li><strong>Cycle time, lead time, throughput, WIP.</strong></li>
            <li><strong>First Pass Yield (FPY)</strong> and Rolled Throughput Yield.</li>
            <li><strong>DPMO</strong> — defects per million opportunities (Six Sigma ≈ 3.4 DPMO).</li>
          </ul>

          <h2 id="tools">Tools</h2>
          <ul>
            <li><strong>Simulation:</strong> Arena, FlexSim, AnyLogic, Simio.</li>
            <li><strong>Optimization:</strong> Gurobi, CPLEX, LINGO, Excel Solver.</li>
            <li><strong>Statistics:</strong> Minitab, JMP, R, Python (statsmodels, scikit-learn).</li>
            <li><strong>Project management:</strong> Primavera, MS Project, Smartsheet.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
