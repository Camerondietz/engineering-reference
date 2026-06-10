// app/tools/search.ts
// ------------------------------------------------------------
// Generic, ranked search over the node graph.
// Pure functions — works in client components (no I/O).
// ------------------------------------------------------------

import type { NodeType } from "./repository";

export type Scored<T> = { node: T; score: number };

const norm = (s: string) => s.toLowerCase().trim();

/**
 * Score a single node against a query.
 *
 * Weights (highest signal first):
 *  - exact title match           : 100
 *  - title starts with query     :  60
 *  - all query tokens in title   :  35
 *  - any token in title          :  20
 *  - tag exact / starts with     :  25 / 15
 *  - any token in any tag        :  10
 *  - any token in description    :   5
 *
 * Returns 0 for "no match" — caller should filter those out.
 */
export function scoreNode(node: NodeType, rawQuery: string): number {
  const q = norm(rawQuery);
  if (!q) return 0;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;

  const title = norm(node.name || "");
  const desc = norm(node.description || "");
  const tags = (node.tags || []).map(norm);

  let score = 0;

  if (title === q) score += 100;
  if (title.startsWith(q)) score += 60;

  const titleHasAll = tokens.every((t) => title.includes(t));
  if (titleHasAll) score += 35;

  const titleHasAny = tokens.some((t) => title.includes(t));
  if (titleHasAny) score += 20;

  for (const tag of tags) {
    if (tag === q) score += 25;
    else if (tag.startsWith(q)) score += 15;
    else if (tokens.some((t) => tag.includes(t))) score += 10;
  }

  if (tokens.some((t) => desc.includes(t))) score += 5;

  return score;
}

export function rankNodes(
  nodes: NodeType[],
  query: string,
  limit = Infinity,
): Scored<NodeType>[] {
  if (!query.trim()) return [];

  const out: Scored<NodeType>[] = [];
  for (const node of nodes) {
    const score = scoreNode(node, query);
    if (score > 0) out.push({ node, score });
  }
  out.sort((a, b) => b.score - a.score || a.node.name.localeCompare(b.node.name));
  return Number.isFinite(limit) ? out.slice(0, limit) : out;
}

/** Build a short snippet around the first matched token. */
export function snippet(text: string | undefined, query: string, len = 120): string {
  if (!text) return "";
  const q = norm(query);
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q.split(/\s+/)[0] || "");
  if (idx === -1) return text.slice(0, len) + (text.length > len ? "…" : "");
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + len - 30);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}
