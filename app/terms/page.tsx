import { siteConfig } from "@/lib/siteConfig";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  const updated = "January 1, 2026";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Legal
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm text-gray-500">Last updated {updated}.</p>
      </header>

      <section className="docs">
        <p>
          These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use
          of {siteConfig.name} at {siteConfig.domain}. By accessing the site you
          agree to be bound by these Terms. If you do not agree, please do not
          use the site.
        </p>

        <h2>Use of the site</h2>
        <p>
          You may view, browse, and reference the content on {siteConfig.name}
          for personal, non-commercial purposes. You agree not to:
        </p>
        <ul>
          <li>Use the site in any way that violates applicable law.</li>
          <li>
            Attempt to gain unauthorized access to any part of the site or its
            underlying systems.
          </li>
          <li>
            Use automated tools to scrape, index, or copy substantial portions
            of the content without permission.
          </li>
          <li>Use the site to harass, defame, or harm others.</li>
        </ul>

        <h2>Editorial content</h2>
        <p>
          Reference material on {siteConfig.name} reflects the authors&apos;
          best understanding at the time of writing. Standards, formulas,
          material properties, and product specifications are revised
          regularly — always confirm critical values against the controlling
          standard or manufacturer documentation before use.
        </p>

        <h2>No professional advice</h2>
        <p>
          Content on this site is provided for general informational and
          educational purposes only. It is not a substitute for engineering
          judgment, professional review, or applicable codes and standards.
          Nothing here constitutes professional engineering, legal, financial,
          medical, or safety advice. You are responsible for verifying any
          information and for the engineering decisions you make.
        </p>

        <h2>Intellectual property</h2>
        <p>
          The text, layout, design, and original images on {siteConfig.name}{" "}
          are owned by {siteConfig.footerCopyrightHolder} unless otherwise
          noted. You may quote short excerpts with attribution and a link back.
          Republishing entire pages without prior written permission is not
          allowed.
        </p>

        <h2>Third-party content and links</h2>
        <p>
          The site may link to external websites or display content owned by
          others. We do not endorse and are not responsible for third-party
          content, products, or services.
        </p>

        <h2>Disclaimer of warranties</h2>
        <p>
          The site is provided on an &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; basis, without warranties of any kind, express or
          implied. To the maximum extent permitted by law, we disclaim all
          warranties, including merchantability, fitness for a particular
          purpose, and non-infringement.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, {siteConfig.name} and its
          authors are not liable for any indirect, incidental, special,
          consequential, or punitive damages arising out of or relating to your
          use of the site.
        </p>

        <h2>Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the
          site after changes are posted means you accept the revised Terms.
        </p>

        <h2>Governing law</h2>
        <p>
          These Terms are governed by the laws of the State of Texas, United
          States, without regard to its conflict-of-laws principles.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about these Terms, contact us through the channels
          listed on {siteConfig.domain}.
        </p>
      </section>
    </main>
  );
}
