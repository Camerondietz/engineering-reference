// app/content/ux-ui-design.tsx

export default function UxUiDesignPage() {
  return (
    <article className="prose">
      <h1>UX / UI Design</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#process">Process</a></li>
            <li><a href="#research">Research</a></li>
            <li><a href="#ia-interaction">Information Architecture &amp; Interaction</a></li>
            <li><a href="#visual">Visual &amp; Systems</a></li>
            <li><a href="#accessibility">Accessibility</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            UX design shapes how a product feels to use; UI design shapes
            how it looks. The two are inseparable in practice — and in
            industrial software (HMIs, MES, SCADA dashboards) they directly
            affect operator effectiveness and safety.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Good UX/UI reduces task time, reduces errors, and reduces
            training. Bad UX shows up in tickets, mis-clicks, and incidents.
          </p>

          <h2 id="process">Process</h2>
          <ol>
            <li>Discovery &amp; user research.</li>
            <li>Personas &amp; journey maps.</li>
            <li>Information architecture &amp; flows.</li>
            <li>Wireframes &amp; low-fi prototypes.</li>
            <li>Visual design + design system.</li>
            <li>High-fi prototypes; usability testing.</li>
            <li>Hand-off + design QA.</li>
            <li>Measure &amp; iterate (analytics, feedback).</li>
          </ol>

          <h2 id="research">Research</h2>
          <ul>
            <li>Interviews, contextual inquiry, diary studies.</li>
            <li>Usability tests — moderated &amp; unmoderated (Maze, UserTesting).</li>
            <li>Surveys, NPS, CSAT, SUS (System Usability Scale).</li>
            <li>Analytics &amp; heatmaps (PostHog, Mixpanel, Hotjar, FullStory).</li>
            <li>5 users find ~85% of usability issues (Nielsen).</li>
          </ul>

          <h2 id="ia-interaction">Information Architecture &amp; Interaction</h2>
          <ul>
            <li>Card sorting &amp; tree testing for navigation.</li>
            <li>Affordances, signifiers, feedback (Norman).</li>
            <li>Fitts&rsquo;s Law — target distance &amp; size affect speed.</li>
            <li>Hick&rsquo;s Law — choice count slows decision.</li>
            <li>Minimize cognitive load; recognize over recall.</li>
          </ul>

          <h2 id="visual">Visual &amp; Systems</h2>
          <ul>
            <li>Design tokens for color, type, spacing, radius, shadow.</li>
            <li>Component libraries (Figma + code library in sync).</li>
            <li>Type scale (e.g. 12/14/16/20/24/32 px) and 4- or 8-px spacing grid.</li>
            <li>Mature systems: Material 3, Apple HIG, Polaris, Carbon, Atlassian.</li>
          </ul>

          <h2 id="accessibility">Accessibility</h2>
          <ul>
            <li><strong>WCAG 2.2</strong> A / AA / AAA conformance levels.</li>
            <li>Color contrast 4.5:1 (body) / 3:1 (large text).</li>
            <li>Keyboard-navigable; visible focus states.</li>
            <li>Semantic HTML; ARIA only when needed.</li>
            <li>Screen-reader testing (NVDA, JAWS, VoiceOver).</li>
            <li>EN 301 549 and US Section 508 in procurement.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
