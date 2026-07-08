"use client";

// app/content/json-tool.tsx
//
// JSON formatter / validator / minifier with conversions to & from
// CSV (when the top-level is an array of flat objects). Includes a
// JSONPath-lite query helper, key sorting, and content statistics.

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// Helpers
// ============================================================

function tryParse(s: string): { ok: true; value: unknown } | { ok: false; error: string; line?: number; col?: number } {
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const m = msg.match(/position\s+(\d+)/);
    if (m) {
      const pos = Number(m[1]);
      const slice = s.slice(0, pos);
      const lines = slice.split(/\r\n|\r|\n/);
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;
      return { ok: false, error: msg, line, col };
    }
    return { ok: false, error: msg };
  }
}

function sortKeysDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeysDeep);
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>).sort()) {
      out[k] = sortKeysDeep((v as Record<string, unknown>)[k]);
    }
    return out;
  }
  return v;
}

interface Stats {
  objects: number;
  arrays: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  maxDepth: number;
}
function statsOf(v: unknown, depth = 0): Stats {
  const s: Stats = { objects: 0, arrays: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0, maxDepth: depth };
  function walk(node: unknown, d: number) {
    if (d > s.maxDepth) s.maxDepth = d;
    if (node === null) { s.nulls++; return; }
    if (Array.isArray(node)) {
      s.arrays++;
      for (const x of node) walk(x, d + 1);
      return;
    }
    switch (typeof node) {
      case "string":  s.strings++; break;
      case "number":  s.numbers++; break;
      case "boolean": s.booleans++; break;
      case "object":
        s.objects++;
        for (const k of Object.keys(node!)) walk((node as Record<string, unknown>)[k], d + 1);
        break;
    }
  }
  walk(v, depth);
  return s;
}

// JSONPath-lite: supports . property access, [index], [*], .. (recursive descent)
function evalPath(root: unknown, path: string): unknown[] {
  const tokens = parsePath(path);
  let nodes: unknown[] = [root];
  for (const t of tokens) {
    const next: unknown[] = [];
    for (const n of nodes) {
      switch (t.type) {
        case "root": next.push(n); break;
        case "key":
          if (t.key === "*") {
            if (Array.isArray(n)) next.push(...n);
            else if (n && typeof n === "object") next.push(...Object.values(n));
          } else if (n && typeof n === "object" && !Array.isArray(n)) {
            const v = (n as Record<string, unknown>)[t.key!];
            if (v !== undefined) next.push(v);
          }
          break;
        case "index":
          if (Array.isArray(n)) {
            const v = n[t.index! < 0 ? n.length + t.index! : t.index!];
            if (v !== undefined) next.push(v);
          }
          break;
        case "wildIndex":
          if (Array.isArray(n)) next.push(...n);
          break;
        case "recurse":
          next.push(...descendAll(n));
          break;
      }
    }
    nodes = next;
  }
  return nodes;
}
function descendAll(n: unknown): unknown[] {
  const out: unknown[] = [n];
  if (Array.isArray(n)) for (const x of n) out.push(...descendAll(x));
  else if (n && typeof n === "object") for (const v of Object.values(n)) out.push(...descendAll(v));
  return out;
}
interface Tok { type: "root" | "key" | "index" | "wildIndex" | "recurse"; key?: string; index?: number; }
function parsePath(p: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  if (p[0] === "$") { toks.push({ type: "root" }); i++; }
  while (i < p.length) {
    const c = p[i];
    if (c === "." && p[i + 1] === ".") { toks.push({ type: "recurse" }); i += 2; continue; }
    if (c === ".") { i++; continue; }
    if (c === "[") {
      const end = p.indexOf("]", i);
      if (end < 0) throw new Error("Unclosed [");
      const inside = p.slice(i + 1, end).trim();
      if (inside === "*") toks.push({ type: "wildIndex" });
      else if (/^-?\d+$/.test(inside)) toks.push({ type: "index", index: Number(inside) });
      else if (/^['"](.+)['"]$/.test(inside)) toks.push({ type: "key", key: inside.slice(1, -1) });
      else throw new Error(`Invalid bracket expression: ${inside}`);
      i = end + 1;
      continue;
    }
    // bare key up to next . or [
    let j = i;
    while (j < p.length && p[j] !== "." && p[j] !== "[") j++;
    const key = p.slice(i, j);
    if (key) toks.push({ type: "key", key });
    i = j;
  }
  return toks;
}

// CSV conversions
function isFlatObjectArray(v: unknown): v is Record<string, unknown>[] {
  if (!Array.isArray(v) || v.length === 0) return false;
  return v.every(
    (r) =>
      r !== null &&
      typeof r === "object" &&
      !Array.isArray(r) &&
      Object.values(r as Record<string, unknown>).every(
        (cell) => cell === null || ["string", "number", "boolean"].includes(typeof cell),
      ),
  );
}
function jsonToCsv(arr: Record<string, unknown>[]): string {
  const keys = Array.from(new Set(arr.flatMap((r) => Object.keys(r))));
  const esc = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = keys.map(esc).join(",");
  const rows = arr.map((r) => keys.map((k) => esc(r[k])).join(","));
  return [head, ...rows].join("\n");
}
function csvToJson(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
      } else cell += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).filter((r) => r.some((c) => c !== "")).map((r) => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => { o[h] = r[i] ?? ""; });
    return o;
  });
}

function bytesUtf8(s: string): number { return new TextEncoder().encode(s).length; }

// ============================================================
// Page
// ============================================================

export default function JsonToolPage() {
  const SAMPLE = JSON.stringify(
    {
      project: "PLC upgrade",
      owner: "Cameron",
      tasks: [
        { id: 1, title: "Backup PLC", done: true, hours: 0.5 },
        { id: 2, title: "Stage program", done: true, hours: 1.5 },
        { id: 3, title: "Cutover & test", done: false, hours: 4 },
      ],
      meta: { revision: 3, approved: false, tags: ["control", "ot"] },
    },
    null,
    2,
  );

  const [text, setText] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [query, setQuery] = useState("$.tasks[*].title");

  const parsed = useMemo(() => tryParse(text), [text]);
  const stats = useMemo(
    () => (parsed.ok ? statsOf(parsed.value) : null),
    [parsed],
  );

  const formatted = useMemo(() => {
    if (!parsed.ok) return "";
    return JSON.stringify(parsed.value, null, indent);
  }, [parsed, indent]);
  const minified = useMemo(() => (parsed.ok ? JSON.stringify(parsed.value) : ""), [parsed]);
  const sorted = useMemo(
    () => (parsed.ok ? JSON.stringify(sortKeysDeep(parsed.value), null, indent) : ""),
    [parsed, indent],
  );

  const csv = useMemo(() => {
    if (!parsed.ok) return null;
    return isFlatObjectArray(parsed.value) ? jsonToCsv(parsed.value) : null;
  }, [parsed]);

  const queryResults = useMemo(() => {
    if (!parsed.ok || !query.trim()) return null;
    try {
      return evalPath(parsed.value, query.trim());
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }, [parsed, query]);

  const inputBytes = bytesUtf8(text);
  const formattedBytes = formatted ? bytesUtf8(formatted) : 0;
  const minifiedBytes = minified ? bytesUtf8(minified) : 0;

  function copy(t: string) { try { navigator.clipboard?.writeText(t); } catch { /* */ } }

  // CSV ↔ JSON small panel
  const [csvIn, setCsvIn] = useState(
    "name,role,ext\nAlice,Eng,2101\nBob,Tech,2102",
  );
  const csvParsed = useMemo(() => csvToJson(csvIn), [csvIn]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          JSON Tool
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Validate, format, minify, sort keys, query with JSONPath-lite,
          and convert to / from CSV.
        </p>
      </header>

      {/* Input */}
      <Card title="Input">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          spellCheck={false}
          className="w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-xs shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {parsed.ok ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              ✓ Valid JSON
            </span>
          ) : (
            <span className="rounded-full bg-eng-rust/10 px-3 py-1 text-xs font-semibold text-eng-rust">
              ✗ {parsed.error}
              {parsed.line !== undefined && ` (line ${parsed.line}, col ${parsed.col})`}
            </span>
          )}
          <label className="flex items-center gap-2 text-xs">
            <span className="font-semibold uppercase tracking-wide text-gray-500">
              Indent
            </span>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs"
            >
              <option value={0}>None (tab-less minified)</option>
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => setText(formatted)}
            disabled={!parsed.ok}
            className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            Format in place
          </button>
          <button
            type="button"
            onClick={() => setText(sorted)}
            disabled={!parsed.ok}
            className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            Sort keys
          </button>
          <button
            type="button"
            onClick={() => setText(minified)}
            disabled={!parsed.ok}
            className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            Minify
          </button>
          <span className="ml-auto text-xs text-gray-500">
            {inputBytes.toLocaleString()} bytes
          </span>
        </div>

        {stats && (
          <div className="mt-3 flex flex-wrap gap-2">
            <StatChip label="Objects" value={stats.objects} />
            <StatChip label="Arrays" value={stats.arrays} />
            <StatChip label="Strings" value={stats.strings} />
            <StatChip label="Numbers" value={stats.numbers} />
            <StatChip label="Booleans" value={stats.booleans} />
            <StatChip label="Nulls" value={stats.nulls} />
            <StatChip label="Max depth" value={stats.maxDepth} />
            <StatChip label="Formatted" value={`${formattedBytes.toLocaleString()} B`} />
            <StatChip label="Minified" value={`${minifiedBytes.toLocaleString()} B`} />
          </div>
        )}
      </Card>

      {/* Outputs */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Pretty">
          <OutputBox text={formatted} onCopy={() => copy(formatted)} />
        </Card>
        <Card title="Minified">
          <OutputBox text={minified} onCopy={() => copy(minified)} />
        </Card>
        <Card title="Sorted keys (deep)">
          <OutputBox text={sorted} onCopy={() => copy(sorted)} />
        </Card>
        <Card title={`CSV ${csv === null ? "(top-level must be array of flat objects)" : ""}`}>
          {csv === null ? (
            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
              Provide a JSON array of objects with primitive values to export
              as CSV. Example: <code>[{"{\"a\":1,\"b\":2}"}, ...]</code>.
            </p>
          ) : (
            <OutputBox text={csv} onCopy={() => copy(csv)} />
          )}
        </Card>
      </section>

      {/* JSONPath query */}
      <section className="mt-6">
        <Card title="JSONPath-lite query">
          <p className="mb-3 text-sm text-gray-500">
            Supports <code>$</code> root, <code>.key</code>, <code>[index]</code>,
            <code>[*]</code> wildcard, <code>..</code> recursive descent.
            Example: <code>$.tasks[*].title</code>.
          </p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
          />
          <div className="mt-3">
            {typeof queryResults === "string" ? (
              <p className="rounded-lg bg-eng-rust/10 px-3 py-2 text-sm text-eng-rust">{queryResults}</p>
            ) : Array.isArray(queryResults) ? (
              <pre className="max-h-72 max-w-full overflow-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-gray-100">
                {JSON.stringify(queryResults, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-gray-500">No query.</p>
            )}
          </div>
        </Card>
      </section>

      {/* CSV → JSON */}
      <section className="mt-6">
        <Card title="CSV → JSON">
          <p className="mb-3 text-sm text-gray-500">
            Paste CSV with a header row — each row becomes an object keyed
            by the header columns.
          </p>
          <textarea
            value={csvIn}
            onChange={(e) => setCsvIn(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-xs shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
          />
          <div className="mt-3">
            <OutputBox text={JSON.stringify(csvParsed, null, 2)} onCopy={() => copy(JSON.stringify(csvParsed, null, 2))} />
          </div>
        </Card>
      </section>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-3 min-w-0">{children}</div>
    </section>
  );
}

function OutputBox({ text, onCopy }: { text: string; onCopy: () => void }) {
  return (
    <div className="relative min-w-0">
      <pre className="max-h-72 max-w-full overflow-auto rounded-lg bg-gray-900 p-3 font-mono text-xs leading-relaxed text-gray-100">
        {text || " "}
      </pre>
      <button
        type="button"
        onClick={onCopy}
        className="absolute right-2 top-2 rounded-full bg-eng-navy/80 px-3 py-1 text-[11px] font-semibold text-white hover:bg-eng-navy"
      >
        Copy
      </button>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: number | string }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
      <span className="font-semibold">{value}</span>
      <span className="text-[11px] uppercase tracking-wide opacity-70">{label}</span>
    </span>
  );
}
