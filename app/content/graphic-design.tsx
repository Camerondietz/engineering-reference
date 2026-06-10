// app/content/graphic-design.tsx

export default function GraphicDesignPage() {
  return (
    <article className="prose">
      <h1>Graphic Design</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#principles">Design Principles</a></li>
            <li><a href="#typography">Typography</a></li>
            <li><a href="#color">Color</a></li>
            <li><a href="#file-formats">File Formats &amp; Prepress</a></li>
            <li><a href="#tools">Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Graphic design uses type, image, color, and layout to
            communicate ideas. It spans branding, print, packaging, motion,
            and web — and in engineering contexts, it shapes everything
            from product labels to HMI screens to technical reports.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Good design is invisible: it gets the message across before the
            viewer notices the craft. Bad design fights the reader.
          </p>

          <h2 id="principles">Design Principles</h2>
          <ul>
            <li><strong>Hierarchy</strong> — what does the eye see first?</li>
            <li><strong>Contrast</strong> — size, weight, color separate important from secondary.</li>
            <li><strong>Alignment</strong> — every element on a visible grid.</li>
            <li><strong>Repetition</strong> — consistent treatment of similar things.</li>
            <li><strong>Proximity</strong> — group related items.</li>
            <li><strong>White space</strong> — breathing room is content.</li>
          </ul>

          <h2 id="typography">Typography</h2>
          <ul>
            <li>Serif (Garamond, Caslon), sans-serif (Helvetica, Inter), monospace (JetBrains Mono).</li>
            <li>Body text 14–18 px on screen, 9–11 pt in print.</li>
            <li>Line length 45–75 characters; line height 1.4–1.6.</li>
            <li>Limit to 2–3 typefaces per piece; pair display + text faces.</li>
            <li>Use proper marks: &mdash; em dash, &ndash; en dash, &lsquo;curly quotes&rsquo;.</li>
          </ul>

          <h2 id="color">Color</h2>
          <ul>
            <li>Color modes: RGB (screen), CMYK (print), Lab (color-managed).</li>
            <li>Pantone (PMS) for spot color matching.</li>
            <li>Wheel relationships: complementary, analogous, triadic, split-complement.</li>
            <li>Accessible contrast — WCAG 2.2 AA = 4.5:1 body / 3:1 large text.</li>
            <li>60–30–10 rule for proportion.</li>
          </ul>

          <h2 id="file-formats">File Formats &amp; Prepress</h2>
          <ul>
            <li><strong>Vector</strong> — SVG, AI, EPS, PDF (scales without loss).</li>
            <li><strong>Raster</strong> — PNG, JPG, WebP, AVIF, TIFF.</li>
            <li>Print: CMYK PDF/X-4, 300 dpi at final size, 3 mm bleed, registration marks.</li>
            <li>Embed or outline fonts; convert spot to process when needed.</li>
            <li>Color profiles: sRGB (web), Adobe RGB (photo), GRACoL/SWOP (print).</li>
          </ul>

          <h2 id="tools">Tools</h2>
          <ul>
            <li><strong>Adobe Creative Cloud</strong> — Illustrator, Photoshop, InDesign.</li>
            <li><strong>Affinity</strong> Designer, Photo, Publisher.</li>
            <li><strong>Figma, Sketch, Penpot</strong> — UI / collaborative.</li>
            <li><strong>CorelDRAW.</strong></li>
            <li>Free: Inkscape, GIMP, Krita, Scribus.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
