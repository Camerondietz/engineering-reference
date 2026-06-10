// app/content/systems-engineering.tsx

export default function SystemsEngineeringPage() {
  return (
    <article className="prose">
      <h1>Systems Engineering</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#v-model">The V-Model</a></li>
            <li><a href="#requirements">Requirements</a></li>
            <li><a href="#architecture">Architecture &amp; Interfaces</a></li>
            <li><a href="#verification-validation">V&amp;V</a></li>
            <li><a href="#standards-tools">Standards &amp; Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Systems engineering is the interdisciplinary practice of taking a
            complex system from concept through retirement — balancing
            requirements, interfaces, cost, schedule, and risk across
            multiple engineering domains.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            The systems engineer owns the &ldquo;whole product&rdquo; view: how
            mechanical, electrical, software, and human elements work
            together. The role is heavy on documentation, traceability, and
            disciplined decision-making rather than detail design.
          </p>

          <h2 id="v-model">The V-Model</h2>
          <ol>
            <li>Stakeholder needs &amp; concept of operations (ConOps).</li>
            <li>System requirements.</li>
            <li>System architecture &amp; design.</li>
            <li>Subsystem &amp; component design.</li>
            <li>Implementation / build.</li>
            <li>Component verification.</li>
            <li>Subsystem &amp; system integration.</li>
            <li>System verification.</li>
            <li>Validation against operational need.</li>
          </ol>

          <h2 id="requirements">Requirements</h2>
          <ul>
            <li>Good requirements are <strong>unambiguous, verifiable, feasible, necessary, and complete</strong>.</li>
            <li>Use &ldquo;shall&rdquo; for binding statements; avoid &ldquo;should&rdquo; or &ldquo;may&rdquo;.</li>
            <li>Capture rationale &amp; source — drives traceability.</li>
            <li>Decompose: stakeholder → system → subsystem → component.</li>
            <li>Manage in a tool (DOORS, Jama, Polarion) — not in Word.</li>
          </ul>

          <h2 id="architecture">Architecture &amp; Interfaces</h2>
          <p>
            Define functional, physical, and logical architectures. Capture
            interfaces in an <strong>Interface Control Document (ICD)</strong>{" "}
            covering signals, protocols, timing, power, mechanical
            envelopes, and environmental limits. Bad interfaces — not bad
            components — cause most integration failures.
          </p>

          <h2 id="verification-validation">Verification &amp; Validation</h2>
          <ul>
            <li><strong>Verification:</strong> &ldquo;Did we build it right?&rdquo; — meets specs.</li>
            <li><strong>Validation:</strong> &ldquo;Did we build the right thing?&rdquo; — meets need.</li>
            <li>Methods: <strong>Test, Analysis, Demonstration, Inspection</strong> (TADI).</li>
            <li>Maintain a Requirements Verification Traceability Matrix (RVTM).</li>
          </ul>

          <h2 id="standards-tools">Standards &amp; Tools</h2>
          <ul>
            <li><strong>ISO/IEC/IEEE 15288</strong> — systems life-cycle processes.</li>
            <li><strong>INCOSE Systems Engineering Handbook</strong>.</li>
            <li><strong>NASA SE Handbook (SP-2016-6105).</strong></li>
            <li><strong>MBSE:</strong> SysML, Cameo, Capella, MagicDraw, Rhapsody.</li>
            <li><strong>Requirements:</strong> IBM DOORS, Jama Connect, Polarion, Helix RM.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
