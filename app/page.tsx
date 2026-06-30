import Link from "next/link";
import CategoryCard from "@/components/CategoryCard";
import FeaturedCard from "@/components/FeaturedCard";
import { siteConfig } from "@/lib/siteConfig";

export default function HomePage() {
  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-hero-grid">
        <div className="mx-auto max-w-5xl px-6 pt-24 pb-28 sm:pt-32 sm:pb-36 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-medium text-gray-600 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-eng-amber" />
            Practical. Precise. Updated regularly.
          </span>

          <h1 className="mt-6 text-5xl sm:text-6xl font-semibold tracking-tight text-gray-900">
            {siteConfig.tagline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
            {siteConfig.heroSubtitle}
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="#featured"
              className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
            >
              Explore Reference
            </Link>
            <Link
              href="/category"
              className="rounded-full border border-gray-300 bg-white/70 px-6 py-3 text-sm font-semibold text-gray-800 backdrop-blur transition hover:border-eng-navy hover:text-eng-navy"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section id="categories" className="bg-gray-50 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Browse"
            title="Pick a category"
            subtitle="Drill down into mechanical, materials, standards, electrical, and more."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {siteConfig.featuredCategories.map((c) => (
              <CategoryCard
                key={c.href}
                title={c.title}
                description={c.description}
                href={c.href}
                badge={c.badge}
              />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/category"
              className="text-sm font-semibold text-eng-navy hover:underline"
            >
              See all categories →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- FEATURED ITEMS ---------- */}
      <section id="featured" className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Editor's picks"
            title="Featured references"
            subtitle="A small, hand-picked set of the lookups engineers reach for most often."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {siteConfig.featuredItems.map((item) => (
              <FeaturedCard
                key={item.href}
                title={item.title}
                category={item.category}
                image={item.image}
                href={item.href}
              />
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-gray-600">{subtitle}</p>
      )}
    </div>
  );
}
