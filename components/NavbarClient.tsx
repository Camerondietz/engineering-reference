"use client";

// components/NavbarClient.tsx
// Sticky top bar with brand, primary nav, and an inline search box.
// Collapses to a hamburger + full-width search row on mobile.

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { NodeType } from "@/app/tools/repository";
import type { NavLink } from "@/lib/siteConfig";
import SearchBox from "./SearchBox";
import MobileMenu from "./MobileMenu";

type Props = {
  nodes: NodeType[];
  brand: string;
  nav: readonly NavLink[];
  searchPlaceholder: string;
};

export default function NavbarClient({ nodes, brand, nav, searchPlaceholder }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Desktop / tablet row */}
        <div className="flex h-16 items-center gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-gray-900"
          >
            <Image
              src="/logo.png"
              alt={brand}
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg object-cover"
              priority
            />
            <span className="whitespace-nowrap">{brand}</span>
          </Link>

          {/* Inline search — grows to fill */}
          <div className="hidden md:block flex-1 max-w-xl mx-auto">
            <SearchBox nodes={nodes} placeholder={searchPlaceholder} compact />
          </div>

          {/* Right side nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {nav.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="ml-auto md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Mobile search row — always visible below the brand bar on small screens */}
        <div className="pb-3 md:hidden">
          <SearchBox nodes={nodes} placeholder={searchPlaceholder} compact />
        </div>
      </div>
    </header>

    {/* Rendered OUTSIDE the header so `position: fixed` is relative to the */}
    {/* viewport, not the backdrop-filter ancestor.                          */}
    <MobileMenu open={open} setOpen={setOpen} nodes={nodes} nav={nav} />
    </>
  );
}
