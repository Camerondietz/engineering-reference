// app/content/biomedical-engineering.tsx

export default function BiomedicalEngineeringPage() {
  return (
    <article className="prose">
      <h1>Biomedical Engineering</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#sub-fields">Sub-Fields</a></li>
            <li><a href="#device-classes">FDA Device Classes</a></li>
            <li><a href="#design-controls">Design Controls</a></li>
            <li><a href="#standards">Standards</a></li>
            <li><a href="#tools">Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Biomedical engineering applies engineering principles to medicine
            and biology — designing devices, instrumentation, imaging
            systems, prosthetics, biomaterials, and software that diagnose,
            treat, or monitor patients.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            BME work is dominated by regulatory rigor. A medical device is
            not finished when it works in the lab — it is finished when it
            survives a 510(k) clearance or PMA approval and proves safe and
            effective in clinical use.
          </p>

          <h2 id="sub-fields">Sub-Fields</h2>
          <ul>
            <li><strong>Biomechanics</strong> — orthopedics, prosthetics, gait, cardiovascular flow.</li>
            <li><strong>Biomaterials</strong> — implants, scaffolds, drug-delivery polymers.</li>
            <li><strong>Medical imaging</strong> — CT, MRI, ultrasound, PET, X-ray.</li>
            <li><strong>Biosignal processing</strong> — ECG, EEG, EMG.</li>
            <li><strong>Tissue engineering &amp; cell culture.</strong></li>
            <li><strong>Clinical engineering</strong> — hospital equipment management.</li>
            <li><strong>Health informatics &amp; software (SaMD).</strong></li>
          </ul>

          <h2 id="device-classes">FDA Device Classes</h2>
          <ul>
            <li><strong>Class I</strong> — low risk (tongue depressors, bandages). General controls.</li>
            <li><strong>Class II</strong> — moderate risk (infusion pumps, X-ray). 510(k) clearance.</li>
            <li><strong>Class III</strong> — high risk / life-sustaining (pacemakers, heart valves). PMA.</li>
          </ul>

          <h2 id="design-controls">Design Controls (21 CFR 820.30)</h2>
          <ol>
            <li>Design &amp; development planning.</li>
            <li>Design inputs (requirements).</li>
            <li>Design outputs (specs, drawings, code).</li>
            <li>Design review.</li>
            <li>Design verification (output meets input).</li>
            <li>Design validation (meets user needs in clinical use).</li>
            <li>Design transfer to manufacturing.</li>
            <li>Design changes &amp; Design History File (DHF).</li>
          </ol>

          <h2 id="standards">Standards</h2>
          <ul>
            <li><strong>ISO 13485</strong> — QMS for medical devices.</li>
            <li><strong>ISO 14971</strong> — risk management.</li>
            <li><strong>IEC 60601-1</strong> — electrical medical equipment safety.</li>
            <li><strong>IEC 62304</strong> — medical device software lifecycle.</li>
            <li><strong>ISO 10993</strong> — biocompatibility.</li>
            <li><strong>21 CFR Part 11</strong> — electronic records &amp; signatures.</li>
            <li><strong>EU MDR 2017/745</strong>.</li>
          </ul>

          <h2 id="tools">Tools</h2>
          <ul>
            <li>FEA: ANSYS, Abaqus (biomechanics).</li>
            <li>CFD: ANSYS Fluent (cardiovascular flow).</li>
            <li>Signal processing: MATLAB, Python (scipy, BioSPPy).</li>
            <li>Imaging: 3D Slicer, OsiriX, ITK/VTK.</li>
            <li>QMS: Greenlight Guru, MasterControl.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
