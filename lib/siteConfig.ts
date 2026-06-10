// lib/siteConfig.ts
// ------------------------------------------------------------
// Single source of truth for site-specific branding & content.
// Swap this file (and data/nodes.json + app/content/*) to retheme
// the template for another site.
// ------------------------------------------------------------

export type NavLink = { label: string; href: string };

export type FeaturedItem = {
  title: string;
  category: string;
  image: string; // path relative to /public, e.g. "/fasteners.jpg"
  href: string; // route, e.g. "/iso-metric-threads"
};

export type FeaturedCategory = {
  title: string;
  description: string;
  href: string;
  // Optional short label rendered as a soft pill on the card
  badge?: string;
};

export const siteConfig = {
  // ---------- Brand ----------
  name: "Engineering Reference",
  shortName: "Engineering Reference",
  domain: "https://engineering-reference.example.com",
  description:
    "A practical reference library for working engineers — formulas, standards, materials, fasteners, GD&T, and design data, organized for fast lookup.",
  tagline: "The Engineer's Reference.",
  heroSubtitle:
    "Formulas, standards, materials, and design data — clear answers for the questions that come up at the workbench, on the drawing, and in the field.",

  // ---------- SEO defaults (used by app/layout + tools/seo) ----------
  defaultKeywords: [
    "engineering reference",
    "mechanical engineering formulas",
    "GD&T",
    "materials data",
    "fastener standards",
    "ASME ISO ASTM",
  ],
  locale: "en_US",

  // ---------- Navigation ----------
  primaryNav: [
    { label: "Categories", href: "/category" },
    { label: "Search", href: "/search" },
  ] satisfies NavLink[],

  footerNav: [
    { label: "Categories", href: "/category" },
    { label: "Search", href: "/search" },
  ] satisfies NavLink[],

  footerLegal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ] satisfies NavLink[],

  footerBlurb:
    "Built by engineers, for engineers — a single place for the formulas, standards, and data you reach for every week.",
  footerCopyrightHolder: "Cameron Dietz",

  // ---------- Homepage content ----------
  featuredItems: [
    {
      title: "ISO Metric Thread Sizes",
      category: "Fasteners",
      image: "/featured-fasteners.jpg",
      href: "/iso-metric-threads",
    },
    {
      title: "Material Properties: Steel & Aluminum",
      category: "Materials",
      image: "/featured-materials.jpg",
      href: "/material-properties",
    },
    {
      title: "GD&T Symbol Quick Reference",
      category: "Drafting",
      image: "/featured-gdt.jpg",
      href: "/gdt-symbols",
    },
  ] satisfies FeaturedItem[],

  featuredCategories: [
    {
      title: "Mechanical",
      description: "Fasteners, bearings, gears, shafts, springs, and machine design.",
      href: "/mechanical",
      badge: "Mech",
    },
    {
      title: "Materials",
      description: "Metals, polymers, composites — properties, treatments, and selection.",
      href: "/materials",
      badge: "Mat",
    },
    {
      title: "Standards & Codes",
      description: "ASME, ISO, ASTM, ANSI — the specs you reference on every drawing.",
      href: "/standards",
      badge: "Std",
    },
  ] satisfies FeaturedCategory[],

  // ---------- Search experience ----------
  search: {
    // Result types this site cares about. The search page renders a
    // type-filter row only when more than one type appears in results.
    types: [
      { id: "item", label: "References", match: (t?: string) => t !== "category" },
    ] as { id: string; label: string; match: (type?: string) => boolean }[],
    placeholder: "Search formulas, standards, materials, tags…",
  },
} as const;

export type SiteConfig = typeof siteConfig;
