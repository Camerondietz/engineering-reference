import { siteConfig } from "@/lib/siteConfig";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  const updated = "January 1, 2026";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Legal
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">Last updated {updated}.</p>
      </header>

      <section className="docs">
        <p>
          This Privacy Policy explains how {siteConfig.name} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects and uses information
          when you visit {siteConfig.domain}. By using the site you agree to the
          practices described here.
        </p>

        <h2>Information we collect</h2>
        <p>
          {siteConfig.name} is a static website. We do not require you to create
          an account and we do not knowingly collect personal information from
          visitors. We may receive the following limited information
          automatically:
        </p>
        <ul>
          <li>
            <strong>Log data.</strong> Basic request information such as IP
            address, browser type, referring page, and timestamp, retained only
            as long as needed for security and diagnostics.
          </li>
          <li>
            <strong>Cookies.</strong> The site itself does not set tracking
            cookies. Embedded third-party content (for example linked maps or
            videos) may set their own cookies if you interact with them.
          </li>
          <li>
            <strong>Analytics.</strong> If analytics are enabled in the future,
            we will use a privacy-respecting provider and update this page
            before doing so.
          </li>
        </ul>

        <h2>How we use information</h2>
        <p>We use the limited information we receive to:</p>
        <ul>
          <li>Operate and maintain the site.</li>
          <li>Diagnose technical problems and prevent abuse.</li>
          <li>Understand which content is useful so we can improve it.</li>
        </ul>

        <h2>Sharing</h2>
        <p>
          We do not sell personal information. We do not share it with third
          parties except as required by law or to protect our rights and the
          safety of our users.
        </p>

        <h2>Third-party links</h2>
        <p>
          Pages on this site may link to external websites we do not control.
          Their privacy practices are governed by their own policies; please
          review those policies before sharing information with them.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>
          This site is intended for a general audience and is not directed at
          children under 13. We do not knowingly collect information from
          children.
        </p>

        <h2>Your choices</h2>
        <p>
          You can block cookies and limit data collection in your browser
          settings. Disabling cookies will not affect your ability to read the
          content on {siteConfig.name}.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we
          will revise the &ldquo;Last updated&rdquo; date above. Significant
          changes will be highlighted on the site.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Reach out via the contact information
          listed on {siteConfig.domain}.
        </p>
      </section>
    </main>
  );
}
