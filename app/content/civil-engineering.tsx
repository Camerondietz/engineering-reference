// app/content/civil-engineering.tsx

export default function CivilEngineeringPage() {
  return (
    <article className="prose">
      <h1>Civil Engineering</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#sub-disciplines">Sub-Disciplines</a></li>
            <li><a href="#design-loads">Design Loads</a></li>
            <li><a href="#materials">Materials</a></li>
            <li><a href="#codes">Codes &amp; Standards</a></li>
            <li><a href="#tools">Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Civil engineering plans, designs, builds, and maintains the built
            environment — buildings, bridges, roads, dams, water systems,
            ports, and the infrastructure connecting them.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Civil work spans the full project lifecycle: feasibility,
            permitting, design, procurement, construction, commissioning,
            inspection, and life-extension. Licensure (P.E.) is the norm
            because designs directly affect public safety.
          </p>

          <h2 id="sub-disciplines">Sub-Disciplines</h2>
          <ul>
            <li><strong>Structural</strong> — buildings, bridges, towers, lateral systems.</li>
            <li><strong>Geotechnical</strong> — soils, foundations, retaining walls, slope stability.</li>
            <li><strong>Transportation</strong> — highways, rail, transit, airports.</li>
            <li><strong>Water resources</strong> — hydrology, hydraulics, storm &amp; flood management.</li>
            <li><strong>Environmental</strong> — water/wastewater treatment, air quality, remediation.</li>
            <li><strong>Construction management</strong> — scheduling, estimating, means &amp; methods.</li>
            <li><strong>Surveying &amp; geomatics</strong> — control, layout, GIS.</li>
          </ul>

          <h2 id="design-loads">Design Loads</h2>
          <p>
            Per <strong>ASCE 7</strong>: dead, live, snow, wind, seismic,
            rain, ice, flood, and earth-pressure loads, combined per the LRFD
            or ASD load combinations. Wind and seismic are usually the
            governing lateral loads.
          </p>

          <h2 id="materials">Materials</h2>
          <ul>
            <li><strong>Concrete</strong> — typical f&rsquo;c 3,000–6,000 psi; rebar Grade 60 (60 ksi yield).</li>
            <li><strong>Structural steel</strong> — A992 (W-shapes), A36 (plate/angle), A500 (HSS).</li>
            <li><strong>Masonry</strong> — CMU, brick, grouted reinforced walls.</li>
            <li><strong>Timber</strong> — sawn lumber, glulam, CLT, LVL.</li>
            <li><strong>Asphalt</strong> — HMA mixes per Superpave specs.</li>
          </ul>

          <h2 id="codes">Codes &amp; Standards</h2>
          <ul>
            <li><strong>IBC</strong> — International Building Code.</li>
            <li><strong>ASCE 7</strong> — Minimum Design Loads.</li>
            <li><strong>ACI 318</strong> — Building Code for Structural Concrete.</li>
            <li><strong>AISC 360</strong> — Steel Construction Manual.</li>
            <li><strong>AASHTO LRFD</strong> — Bridge Design Specifications.</li>
            <li><strong>NDS</strong> — National Design Specification for Wood.</li>
          </ul>

          <h2 id="tools">Tools</h2>
          <ul>
            <li><strong>Design:</strong> AutoCAD, Civil 3D, Revit, MicroStation.</li>
            <li><strong>Structural analysis:</strong> SAP2000, ETABS, RAM, RISA, STAAD.Pro.</li>
            <li><strong>Geotechnical:</strong> PLAXIS, gINT, GeoStudio.</li>
            <li><strong>Hydraulics:</strong> HEC-RAS, HEC-HMS, SWMM, WaterGEMS.</li>
            <li><strong>Scheduling:</strong> Primavera P6, MS Project.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
