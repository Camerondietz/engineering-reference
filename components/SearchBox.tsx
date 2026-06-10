"use client";

// components/SearchBox.tsx
// ------------------------------------------------------------
// Accessible autocomplete search box.
//   - ranks against title / tags / description (see app/tools/search)
//   - keyboard nav: ArrowUp/Down, Enter, Esc
//   - mobile-friendly sizing
//   - Enter on empty selection -> /search?q=...
//   - Enter on a highlighted result -> goto that node
// ------------------------------------------------------------

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { NodeType } from "@/app/tools/repository";
import { rankNodes } from "@/app/tools/search";

type Props = {
  nodes: NodeType[];
  placeholder?: string;
  /** Render a smaller variant suitable for the navbar */
  compact?: boolean;
  /** Optional callback fired after the user navigates (used to close the mobile menu). */
  onNavigate?: () => void;
};

export default function SearchBox({
  nodes,
  placeholder = "Search…",
  compact = false,
  onNavigate,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => rankNodes(nodes, query, 8).map((r) => r.node),
    [nodes, query],
  );

  // Reset highlight when results change
  useEffect(() => setActive(0), [query]);

  // Click-outside closes the dropdown
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) {
        go(`/${results[active].id}`);
      } else if (query.trim()) {
        go(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const sizeCls = compact
    ? "h-9 text-sm pl-9 pr-3"
    : "h-12 text-base pl-11 pr-4";

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="relative">
        <SearchIcon
          className={`absolute top-1/2 -translate-y-1/2 ${compact ? "left-3 h-4 w-4" : "left-4 h-5 w-5"} text-gray-400`}
        />
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open && results.length > 0}
          placeholder={placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={`w-full rounded-full border border-gray-200 bg-white/80 backdrop-blur ${sizeCls} shadow-sm placeholder:text-gray-400 focus:border-eng-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-eng-navy/20 transition`}
        />
      </div>

      {/* Dropdown */}
      {open && query.trim() && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 mt-2 max-h-[70vh] overflow-auto rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 z-50"
        >
          {results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">
              No matches.{" "}
              <Link
                onClick={() => onNavigate?.()}
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                className="text-eng-navy underline"
              >
                Open full search
              </Link>
            </div>
          ) : (
            <ul className="py-1">
              {results.map((node, i) => (
                <li
                  key={node.id}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    go(`/${node.id}`);
                  }}
                  className={`px-4 py-2.5 cursor-pointer flex items-start gap-3 ${
                    i === active ? "bg-gray-50" : ""
                  }`}
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-md bg-eng-amber/15 text-[11px] font-semibold text-eng-rust">
                    {node.type === "category" ? "C" : "•"}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-gray-900">
                      {node.name}
                    </span>
                    {node.description && (
                      <span className="block truncate text-xs text-gray-500">
                        {node.description}
                      </span>
                    )}
                  </span>
                </li>
              ))}
              <li className="border-t border-gray-100">
                <Link
                  onClick={() => onNavigate?.()}
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  className="block px-4 py-2.5 text-xs font-medium text-eng-navy hover:bg-gray-50"
                >
                  See all results for “{query.trim()}” →
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
