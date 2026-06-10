"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { NodeType } from "@/app/tools/repository";
import type { NavLink } from "@/lib/siteConfig";
import SearchBox from "./SearchBox";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  nodes?: NodeType[];
  nav?: readonly NavLink[];
};

export default function MobileMenu({ open, setOpen, nodes = [], nav = [] }: Props) {
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Sheet */}
      <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-semibold tracking-tight">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <SearchBox
            nodes={nodes}
            placeholder="Search…"
            compact
            onNavigate={() => setOpen(false)}
          />
        </div>

        <nav className="px-2 pt-2 pb-6 flex flex-col">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="px-3 py-3 rounded-lg text-base font-medium text-gray-800 hover:bg-gray-50"
          >
            Home
          </Link>
          {nav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-3 rounded-lg text-base font-medium text-gray-800 hover:bg-gray-50"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
