import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-eng-navy to-eng-blue text-white text-[14px] font-bold leading-none">
                ⚙
              </span>
              <h3 className="font-semibold text-lg tracking-tight">
                {siteConfig.shortName}
              </h3>
            </div>
            <p className="mt-3 text-sm text-gray-600 max-w-xs">
              {siteConfig.footerBlurb}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Explore
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-gray-600">
              {siteConfig.footerNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-gray-900 transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Legal
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-gray-600">
              {siteConfig.footerLegal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-gray-900 transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-500">
          © {year} {siteConfig.footerCopyrightHolder}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
