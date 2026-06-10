// app/content/industrial-design.tsx

export default function IndustrialDesignPage() {
  return (
    <article className="prose">
      <h1>Industrial Design</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#process">Design Process</a></li>
            <li><a href="#ergonomics">Ergonomics &amp; Human Factors</a></li>
            <li><a href="#dfm">DFM / DFA / DFx</a></li>
            <li><a href="#materials-processes">Materials &amp; Processes</a></li>
            <li><a href="#tools">Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Industrial design shapes the form, function, and user experience
            of mass-produced physical products. It sits between engineering
            and marketing: making things that work, are buildable, and
            people want to use.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            The designer balances user need, brand language, manufacturing
            reality, cost, regulation, and sustainability — usually with
            incomplete information and a moving target.
          </p>

          <h2 id="process">Design Process</h2>
          <ol>
            <li>Research &amp; user observation.</li>
            <li>Define the problem &amp; constraints.</li>
            <li>Ideation — sketches, mood boards.</li>
            <li>Concept selection &amp; rough prototypes.</li>
            <li>Detailed CAD &amp; engineering hand-off.</li>
            <li>Functional &amp; appearance prototypes.</li>
            <li>Design for manufacture; tooling.</li>
            <li>Pilot run, ramp-up, post-launch review.</li>
          </ol>

          <h2 id="ergonomics">Ergonomics &amp; Human Factors</h2>
          <ul>
            <li>Anthropometric data — 5th to 95th percentile range.</li>
            <li>Reach envelopes, grip strength, sight lines.</li>
            <li>NIOSH lifting equation; ANSI/HFES 100.</li>
            <li>Designing for accessibility — ADA, EN 17161.</li>
            <li>Color, contrast, and labeling for low-vision and colorblind users.</li>
          </ul>

          <h2 id="dfm">DFM / DFA / DFx</h2>
          <ul>
            <li><strong>DFM</strong> — fewer parts, generous tolerances, common features.</li>
            <li><strong>DFA</strong> — easy assembly orientation, poka-yoke, snap fits.</li>
            <li><strong>DFS / DFE</strong> — serviceability, environmental impact, end-of-life.</li>
            <li><strong>DFT</strong> — design for testability.</li>
            <li>Boothroyd-Dewhurst is the canonical DFA methodology.</li>
          </ul>

          <h2 id="materials-processes">Materials &amp; Processes</h2>
          <ul>
            <li>Injection molding (ABS, PC, PP, Nylon, TPE).</li>
            <li>Sheet metal (forming, stamping, laser).</li>
            <li>Die casting (Al, Zn, Mg).</li>
            <li>Machining (Al 6061, steel, brass).</li>
            <li>3D printing (FDM, SLA, SLS, MJF) — proto and low volume.</li>
            <li>Surface finishing — anodize, paint, powder coat, plating.</li>
          </ul>

          <h2 id="tools">Tools</h2>
          <ul>
            <li><strong>CAID:</strong> Rhino + Grasshopper, Alias, Gravity Sketch, Blender.</li>
            <li><strong>CAD:</strong> SolidWorks, Fusion 360, Creo, NX, Onshape.</li>
            <li><strong>Rendering:</strong> KeyShot, V-Ray, Blender Cycles, OctaneRender.</li>
            <li><strong>2D / illustration:</strong> Procreate, Adobe Illustrator.</li>
            <li><strong>Prototyping:</strong> FFF/FDM, SLA, CNC, vacuum forming.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
