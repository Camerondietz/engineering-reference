"use client";

// app/search/SearchClient.tsx
// ------------------------------------------------------------
// Mobile-first search experience:
//   - persistent filter rail (desktop) / slide-up sheet (mobile)
//   - selected filters shown as removable chips above results
//   - tiered category tree with collapse + counts
//   - tag cloud with selection + count
//   - optional "type" filter row (only when site has multiple types)
//   - ranked results from app/tools/search
//   - URL ?q= seeds the query so navbar can deep-link here
// ------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { NodeType } from "@/app/tools/repository";
import { rankNodes } from "@/app/tools/search";
import { siteConfig } from "@/lib/siteConfig";
import TagChip from "@/components/TagChip";

type Props = {
  nodes: NodeType[];        // non-category nodes ("items")
  tags: string[];           // all tags across all nodes
  categories: NodeType[];   // category-type nodes only
};

/* -------------------------------------------------- */
/* helpers                                            */
/* -------------------------------------------------- */

function buildChildMap(categories: NodeType[]) {
  const map: Record<string, NodeType[]> = {};
  categories.forEach((c) => {
    (c.parentIds && c.parentIds.length > 0 ? c.parentIds : [""]).forEach((p) => {
      (map[p] ??= []).push(c);
    });
  });
  return map;
}

function descendantsOf(id: string, childMap: Record<string, NodeType[]>): string[] {
  const out: string[] = [];
  const stack = [...(childMap[id] || [])];
  while (stack.length) {
    const n = stack.pop()!;
    out.push(n.id);
    stack.push(...(childMap[n.id] || []));
  }
  return out;
}

/* -------------------------------------------------- */
/* Category tree (collapsible)                        */
/* -------------------------------------------------- */

function CategoryTree({
  roots,
  childMap,
  counts,
  selected,
  onSelect,
}: {
  roots: NodeType[];
  childMap: Record<string, NodeType[]>;
  counts: Record<string, number>;
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="space-y-0.5 text-sm">
      {roots.map((n) => (
        <CategoryRow
          key={n.id}
          node={n}
          childMap={childMap}
          counts={counts}
          selected={selected}
          onSelect={onSelect}
          level={0}
        />
      ))}
    </ul>
  );
}

function CategoryRow({
  node,
  childMap,
  counts,
  selected,
  onSelect,
  level,
}: {
  node: NodeType;
  childMap: Record<string, NodeType[]>;
  counts: Record<string, number>;
  selected: string;
  onSelect: (id: string) => void;
  level: number;
}) {
  const children = childMap[node.id] || [];
  const isSelected = selected === node.id;
  const hasSelectedDescendant =
    !!selected && descendantsOf(node.id, childMap).includes(selected);
  const [expanded, setExpanded] = useState(level === 0 || hasSelectedDescendant);

  return (
    <li>
      <div
        className="flex items-center gap-1"
        style={{ paddingLeft: `${level * 12}px` }}
      >
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse" : "Expand"}
            className="h-5 w-5 inline-flex items-center justify-center rounded text-gray-400 hover:bg-gray-100"
          >
            <svg
              viewBox="0 0 20 20"
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
              fill="currentColor"
            >
              <path d="M6 4l8 6-8 6V4z" />
            </svg>
          </button>
        ) : (
          <span className="h-5 w-5 inline-block" />
        )}
        <button
          type="button"
          onClick={() => onSelect(isSelected ? "" : node.id)}
          className={[
            "flex-1 min-w-0 text-left px-2 py-1.5 rounded-md transition truncate",
            isSelected
              ? "bg-eng-navy text-white font-medium"
              : "text-gray-700 hover:bg-gray-100",
          ].join(" ")}
        >
          <span className="truncate">{node.name}</span>
          {counts[node.id] !== undefined && (
            <span
              className={[
                "ml-2 text-[11px] font-medium",
                isSelected ? "text-white/80" : "text-gray-400",
              ].join(" ")}
            >
              {counts[node.id]}
            </span>
          )}
        </button>
      </div>
      {children.length > 0 && expanded && (
        <ul className="mt-0.5 space-y-0.5">
          {children.map((c) => (
            <CategoryRow
              key={c.id}
              node={c}
              childMap={childMap}
              counts={counts}
              selected={selected}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* -------------------------------------------------- */
/* Main client                                        */
/* -------------------------------------------------- */

export default function SearchClient({ nodes, tags, categories }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState(""); // "" = all
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile sheet

  // Sync ?q= -> input (useful when navbar deep-links here)
  useEffect(() => {
    const q = params.get("q");
    if (q !== null && q !== query) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Push ?q= back into the URL when the query stabilizes (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      if (query.trim()) sp.set("q", query.trim());
      else sp.delete("q");
      router.replace(`/search${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  /* ---------- derived structures ---------- */

  const childMap = useMemo(() => buildChildMap(categories), [categories]);
  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentIds || c.parentIds.length === 0),
    [categories],
  );

  // counts of items per category (including descendants)
  const itemsPerCategory = useMemo(() => {
    const out: Record<string, number> = {};
    for (const cat of categories) {
      const ids = new Set<string>([cat.id, ...descendantsOf(cat.id, childMap)]);
      out[cat.id] = nodes.filter((n) =>
        n.parentIds?.some((p) => ids.has(p)),
      ).length;
    }
    return out;
  }, [categories, nodes, childMap]);

  // counts of items per tag (over the current type filter, not other filters,
  // so users can see what tags would do)
  const itemsPerTag = useMemo(() => {
    const out: Record<string, number> = {};
    for (const tag of tags) {
      out[tag] = nodes.filter((n) => n.tags?.includes(tag)).length;
    }
    return out;
  }, [tags, nodes]);

  /* ---------- detected types (for type filter row) ---------- */

  const detectedTypes = useMemo(() => {
    const present = new Set(nodes.map((n) => n.type || "item"));
    return siteConfig.search.types.filter((t) =>
      // include if any node matches its predicate
      nodes.some((n) => t.match(n.type)) || present.has(t.id),
    );
  }, [nodes]);

  /* ---------- filtering ---------- */

  const filtered = useMemo(() => {
    let list = nodes;

    // type
    if (selectedType) {
      const def = siteConfig.search.types.find((t) => t.id === selectedType);
      if (def) list = list.filter((n) => def.match(n.type));
    }

    // category (incl. descendants)
    if (selectedCategory) {
      const ids = new Set<string>([
        selectedCategory,
        ...descendantsOf(selectedCategory, childMap),
      ]);
      list = list.filter((n) => n.parentIds?.some((p) => ids.has(p)));
    }

    // tags (AND)
    if (selectedTags.length) {
      list = list.filter((n) =>
        selectedTags.every((t) => n.tags?.includes(t)),
      );
    }

    // text ranking
    if (query.trim()) {
      const ranked = rankNodes(list, query).map((r) => r.node);
      return ranked;
    }

    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [nodes, query, selectedCategory, selectedTags, selectedType, childMap]);

  const selectedCategoryNode = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : undefined;

  const hasActiveFilters =
    !!query.trim() ||
    !!selectedCategory ||
    selectedTags.length > 0 ||
    !!selectedType;

  function clearAll() {
    setQuery("");
    setSelectedCategory("");
    setSelectedTags([]);
    setSelectedType("");
  }

  function toggleTag(tag: string) {
    setSelectedTags((cur) =>
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
    );
  }

  /* ---------- render ---------- */

  // Sort tags by frequency desc, then alpha
  const sortedTags = useMemo(
    () =>
      [...tags].sort(
        (a, b) =>
          (itemsPerTag[b] || 0) - (itemsPerTag[a] || 0) || a.localeCompare(b),
      ),
    [tags, itemsPerTag],
  );

  const Filters = (
    <div className="space-y-7">
      {/* Type (only when more than one detected) */}
      {detectedTypes.length > 1 && (
        <div>
          <FilterHeader title="Type" />
          <div className="flex flex-wrap gap-2">
            <TagChip
              variant="filter"
              label="All"
              selected={selectedType === ""}
              onClick={() => setSelectedType("")}
            />
            {detectedTypes.map((t) => (
              <TagChip
                key={t.id}
                variant="filter"
                label={t.label}
                selected={selectedType === t.id}
                onClick={() => setSelectedType(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <FilterHeader
          title="Categories"
          action={
            selectedCategory ? (
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className="text-xs text-eng-navy hover:underline"
              >
                Clear
              </button>
            ) : null
          }
        />
        <div className="rounded-xl border border-gray-200 bg-white p-2 max-h-[40vh] overflow-auto">
          <CategoryTree
            roots={rootCategories}
            childMap={childMap}
            counts={itemsPerCategory}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <FilterHeader
          title="Tags"
          action={
            selectedTags.length > 0 ? (
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="text-xs text-eng-navy hover:underline"
              >
                Clear
              </button>
            ) : null
          }
        />
        <div className="flex flex-wrap gap-2">
          {sortedTags.map((t) => (
            <TagChip
              key={t}
              variant="filter"
              label={t}
              count={itemsPerTag[t]}
              selected={selectedTags.includes(t)}
              onClick={() => toggleTag(t)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Top control row: query box + mobile filters trigger */}
      <div className="flex items-stretch gap-2 mb-5">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={siteConfig.search.placeholder}
            className="w-full h-12 rounded-full border border-gray-200 bg-white pl-11 pr-4 text-base shadow-sm placeholder:text-gray-400 focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="md:hidden inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M3 6h18M6 12h12M10 18h4" strokeLinecap="round" />
          </svg>
          Filters
          {selectedTags.length + (selectedCategory ? 1 : 0) + (selectedType ? 1 : 0) > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-eng-navy px-1.5 text-[11px] font-semibold text-white">
              {selectedTags.length + (selectedCategory ? 1 : 0) + (selectedType ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Selected chips row */}
      {hasActiveFilters && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {selectedType && (
            <TagChip
              variant="active"
              label={`Type: ${siteConfig.search.types.find((t) => t.id === selectedType)?.label || selectedType}`}
              onRemove={() => setSelectedType("")}
            />
          )}
          {selectedCategoryNode && (
            <TagChip
              variant="active"
              label={`Category: ${selectedCategoryNode.name}`}
              onRemove={() => setSelectedCategory("")}
            />
          )}
          {selectedTags.map((t) => (
            <TagChip
              key={t}
              variant="active"
              label={`#${t}`}
              onRemove={() => toggleTag(t)}
            />
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-gray-500 hover:text-gray-900 underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Layout: rail + results */}
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-24">{Filters}</div>
        </aside>

        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              No matches. Try clearing a filter.
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filtered.map((node) => (
                <li key={node.id}>
                  <Link
                    href={`/${node.id}`}
                    className="group block h-full rounded-2xl border border-gray-100 bg-white p-5 ring-soft transition hover:-translate-y-0.5 hover:border-gray-200"
                  >
                    <h3 className="font-semibold text-gray-900 group-hover:text-eng-navy">
                      {node.name}
                    </h3>
                    {node.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {node.description}
                      </p>
                    )}
                    {node.tags && node.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {node.tags.slice(0, 4).map((t) => (
                          <TagChip key={t} label={t} />
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <span className="text-base font-semibold">Filters</span>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Close filters"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="overflow-auto p-5">{Filters}</div>
            <div className="border-t border-gray-100 p-4 flex items-center gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 h-11 rounded-full border border-gray-200 text-sm font-medium text-gray-700"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-1 h-11 rounded-full bg-eng-navy text-sm font-semibold text-white"
              >
                Show {filtered.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h3>
      {action}
    </div>
  );
}
