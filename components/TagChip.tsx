"use client";

// components/TagChip.tsx
// Pill-style tag chip used in filters and result cards.
// Three modes:
//   variant="filter"  — togglable filter (selected/unselected look)
//   variant="active"  — selected chip with an "x" remove button
//   variant="static"  — read-only label (used on cards)

import type { MouseEventHandler } from "react";

type Props = {
  label: string;
  variant?: "filter" | "active" | "static";
  selected?: boolean;
  count?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onRemove?: () => void;
};

export default function TagChip({
  label,
  variant = "static",
  selected = false,
  count,
  onClick,
  onRemove,
}: Props) {
  if (variant === "active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-medium text-eng-navy ring-1 ring-eng-navy/20">
        {label}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="-mr-1 ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-eng-navy/80 hover:bg-eng-navy/15 hover:text-eng-navy"
          >
            <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2.5} className="h-3 w-3">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </span>
    );
  }

  if (variant === "filter") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
          selected
            ? "bg-gray-900 text-white border border-gray-900"
            : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:bg-gray-50",
        ].join(" ")}
      >
        {label}
        {typeof count === "number" && (
          <span
            className={[
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              selected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500",
            ].join(" ")}
          >
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
      {label}
    </span>
  );
}
