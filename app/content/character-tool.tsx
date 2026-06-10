"use client";

// app/content/character-converter.tsx
//
// Inspect and convert text — see the actual HTML behind a rich-text
// paste, expose every code point (including hidden / control / zero-
// width characters), and live-convert between plain text, hex, base64,
// URL, HTML entities, Unicode escapes, binary, and decimal codepoints.
// Plus number-base, SHA hash, and Unix-timestamp converters.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// ============================================================
// Helpers — encoders / decoders
// ============================================================

const enc = new TextEncoder();
const dec = new TextDecoder();

function toHex(s: string): string {
  return [...enc.encode(s)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}
function fromHex(s: string): string {
  const hex = s.replace(/[^0-9a-fA-F]/g, "");
  if (hex.length === 0) return "";
  if (hex.length % 2 !== 0) throw new Error("odd hex length");
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return dec.decode(bytes);
}

function toBase64(s: string): string {
  const bytes = enc.encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function fromBase64(s: string): string {
  const clean = s.replace(/\s+/g, "");
  if (clean === "") return "";
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return dec.decode(bytes);
}

function toUrl(s: string): string {
  return encodeURIComponent(s);
}
function fromUrl(s: string): string {
  return decodeURIComponent(s);
}

function toHtmlEntities(s: string): string {
  return s.replace(/[&<>"' -￿]/g, (c) => {
    if (c === "&") return "&amp;";
    if (c === "<") return "&lt;";
    if (c === ">") return "&gt;";
    if (c === '"') return "&quot;";
    if (c === "'") return "&#39;";
    return `&#${c.charCodeAt(0)};`;
  });
}
function fromHtmlEntities(s: string): string {
  if (typeof document === "undefined") return s;
  const t = document.createElement("textarea");
  t.innerHTML = s;
  return t.value;
}

function toUnicodeEscapes(s: string): string {
  return [...s]
    .map((c) => {
      const cp = c.codePointAt(0)!;
      if (cp > 0xffff) {
        // Surrogate pair as two \u escapes
        return [...c]
          .map((u) =>
            "\\u" + u.charCodeAt(0).toString(16).padStart(4, "0").toUpperCase(),
          )
          .join("");
      }
      return "\\u" + cp.toString(16).padStart(4, "0").toUpperCase();
    })
    .join("");
}
function fromUnicodeEscapes(s: string): string {
  return s.replace(
    /\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})/g,
    (_, brace, four, two) => {
      const hex = brace || four || two;
      return String.fromCodePoint(parseInt(hex, 16));
    },
  );
}

function toBinary(s: string): string {
  return [...enc.encode(s)]
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
}
function fromBinary(s: string): string {
  const bits = s.replace(/[^01]/g, "");
  if (bits.length === 0) return "";
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return dec.decode(bytes);
}

function toDecimalCp(s: string): string {
  return [...s].map((c) => c.codePointAt(0)!.toString()).join(" ");
}
function fromDecimalCp(s: string): string {
  return s
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((n) => {
      const v = parseInt(n, 10);
      if (!isFinite(v) || v < 0 || v > 0x10ffff) throw new Error("bad codepoint");
      return String.fromCodePoint(v);
    })
    .join("");
}

function safeHtmlPreview(html: string): string {
  // Strip scripts, iframes, on* handlers, javascript: URLs. Used only
  // to render the user's own pasted content for visual inspection.
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript:/gi, "blocked:");
}

function prettyHtml(html: string): string {
  // Lightweight pretty-print so the source view is readable.
  // Not a full formatter — good enough for inspection.
  let out = html
    .replace(/></g, ">\n<")
    .replace(/(<br\s*\/?>)/gi, "$1\n");
  // Indent
  let depth = 0;
  return out
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("</")) depth = Math.max(0, depth - 1);
      const padded = "  ".repeat(depth) + trimmed;
      if (
        trimmed.startsWith("<") &&
        !trimmed.startsWith("</") &&
        !trimmed.endsWith("/>") &&
        !/<(br|hr|img|input|meta|link|source)\b/i.test(trimmed) &&
        !/<\/\w+>/.test(trimmed)
      )
        depth += 1;
      return padded;
    })
    .join("\n");
}

// ============================================================
// Character inspection
// ============================================================

const ASCII_CONTROL_NAMES = [
  "NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL",
  "BS",  "HT",  "LF",  "VT",  "FF",  "CR",  "SO",  "SI",
  "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB",
  "CAN", "EM",  "SUB", "ESC", "FS",  "GS",  "RS",  "US",
] as const;

const NAMED_CHARS: Record<number, string> = {
  0x0020: "SPACE",
  0x007f: "DELETE",
  0x00a0: "NO-BREAK SPACE (NBSP)",
  0x00ad: "SOFT HYPHEN",
  0x180e: "MONGOLIAN VOWEL SEPARATOR",
  0x2000: "EN QUAD",
  0x2001: "EM QUAD",
  0x2002: "EN SPACE",
  0x2003: "EM SPACE",
  0x2004: "THREE-PER-EM SPACE",
  0x2005: "FOUR-PER-EM SPACE",
  0x2006: "SIX-PER-EM SPACE",
  0x2007: "FIGURE SPACE",
  0x2008: "PUNCTUATION SPACE",
  0x2009: "THIN SPACE",
  0x200a: "HAIR SPACE",
  0x200b: "ZERO WIDTH SPACE",
  0x200c: "ZERO WIDTH NON-JOINER",
  0x200d: "ZERO WIDTH JOINER",
  0x200e: "LEFT-TO-RIGHT MARK",
  0x200f: "RIGHT-TO-LEFT MARK",
  0x2028: "LINE SEPARATOR",
  0x2029: "PARAGRAPH SEPARATOR",
  0x202a: "LEFT-TO-RIGHT EMBEDDING",
  0x202b: "RIGHT-TO-LEFT EMBEDDING",
  0x202c: "POP DIRECTIONAL FORMATTING",
  0x202d: "LEFT-TO-RIGHT OVERRIDE",
  0x202e: "RIGHT-TO-LEFT OVERRIDE",
  0x202f: "NARROW NO-BREAK SPACE",
  0x205f: "MEDIUM MATHEMATICAL SPACE",
  0x2060: "WORD JOINER",
  0x2066: "LEFT-TO-RIGHT ISOLATE",
  0x2067: "RIGHT-TO-LEFT ISOLATE",
  0x2068: "FIRST STRONG ISOLATE",
  0x2069: "POP DIRECTIONAL ISOLATE",
  0x3000: "IDEOGRAPHIC SPACE",
  0xfeff: "ZERO WIDTH NO-BREAK SPACE (BOM)",
  0xfffc: "OBJECT REPLACEMENT CHARACTER",
  0xfffd: "REPLACEMENT CHARACTER",
};

type CharCategory =
  | "control"
  | "format"
  | "whitespace"
  | "letter"
  | "digit"
  | "punctuation"
  | "symbol"
  | "other";

function categorize(cp: number, char: string): CharCategory {
  if (cp <= 0x1f || cp === 0x7f) return "control";
  if (/\p{Cf}/u.test(char)) return "format";
  if (cp === 0x20 || cp === 0xa0 || /\s/.test(char)) return "whitespace";
  if (/\p{L}/u.test(char)) return "letter";
  if (/\p{N}/u.test(char)) return "digit";
  if (/\p{P}/u.test(char)) return "punctuation";
  if (/\p{S}/u.test(char)) return "symbol";
  return "other";
}

function isHidden(cp: number, cat: CharCategory): boolean {
  // Visually invisible but distinct (i.e., not the normal SPACE).
  if (cat === "control") return true;
  if (cat === "format") return true;
  if (cp === 0xa0 || cp === 0x2007 || cp === 0x202f) return true; // non-breaking spaces
  if (cp >= 0x2000 && cp <= 0x200a) return true; // exotic spaces
  if (cp === 0x3000) return true;
  return false;
}

function charName(cp: number): string {
  if (cp <= 0x1f) return ASCII_CONTROL_NAMES[cp];
  if (NAMED_CHARS[cp]) return NAMED_CHARS[cp];
  return "";
}

function utf16Units(c: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < c.length; i++) out.push(c.charCodeAt(i));
  return out;
}

function htmlEntityFor(c: string, cp: number): string {
  if (c === "&") return "&amp;";
  if (c === "<") return "&lt;";
  if (c === ">") return "&gt;";
  if (c === '"') return "&quot;";
  if (c === "'") return "&#39;";
  if (cp === 0xa0) return "&nbsp;";
  return `&#${cp};`;
}

function visiblePreview(c: string, cp: number, cat: CharCategory): string {
  if (cp >= 0 && cp <= 0x1f) return String.fromCharCode(0x2400 + cp); // ␀–␟
  if (cp === 0x7f) return "␡";
  if (cp === 0x20) return "·";
  if (cp === 0x09) return "→";
  if (cp === 0x0a) return "⏎";
  if (cp === 0x0d) return "↵";
  if (cat === "format") return "■";
  if (cp === 0xa0 || (cp >= 0x2000 && cp <= 0x200a) || cp === 0x202f || cp === 0x3000) return "·";
  return c;
}

interface CharInfo {
  index: number;
  char: string;
  codePoint: number;
  category: CharCategory;
  hidden: boolean;
  utf8: number[];
  utf16: number[];
  entity: string;
  name: string;
  preview: string;
}

function analyzeText(s: string): CharInfo[] {
  const out: CharInfo[] = [];
  let i = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    const cat = categorize(cp, ch);
    out.push({
      index: i++,
      char: ch,
      codePoint: cp,
      category: cat,
      hidden: isHidden(cp, cat),
      utf8: [...enc.encode(ch)],
      utf16: utf16Units(ch),
      entity: htmlEntityFor(ch, cp),
      name: charName(cp),
      preview: visiblePreview(ch, cp, cat),
    });
  }
  return out;
}

function stripHidden(s: string): string {
  let out = "";
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    const cat = categorize(cp, ch);
    if (isHidden(cp, cat) && cp !== 0x0a && cp !== 0x0d && cp !== 0x09) continue;
    out += ch;
  }
  return out;
}

// ============================================================
// Number base / hash / timestamp
// ============================================================

async function sha(algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512", text: string) {
  const buf = await crypto.subtle.digest(algorithm, enc.encode(text));
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ============================================================
// Sync textarea component (live multi-format conversion)
// ============================================================

function SyncTextarea({
  label,
  value,
  onChange,
  rows = 3,
  monospace = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  monospace?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(value);
  }, [value, focused]);

  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          {label}
        </span>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(draft)}
          className="text-[11px] font-semibold text-eng-navy hover:underline"
        >
          Copy
        </button>
      </div>
      <textarea
        value={draft}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setDraft(value);
        }}
        onChange={(e) => {
          setDraft(e.target.value);
          try {
            onChange(e.target.value);
          } catch {
            /* invalid input — just keep draft, canonical unchanged */
          }
        }}
        className={
          "w-full rounded-lg border border-gray-300 bg-white p-2 text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20 " +
          (monospace ? "font-mono" : "")
        }
      />
    </label>
  );
}

// ============================================================
// Page
// ============================================================

export default function CharacterConverterPage() {
  // Canonical text used by the live multi-format encoder.
  const [text, setText] = useState("Hello, world!");

  // Character inspector (separate input so format conversions don't
  // accidentally re-flow the table while you're typing).
  const [inspectText, setInspectText] = useState(
    "Hello, world!​ Look­here.",
  );
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);

  // Rich text / HTML inspector.
  const [pastedHtml, setPastedHtml] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [pasteView, setPasteView] = useState<"rendered" | "html" | "pretty" | "text">("html");
  const pasteAreaRef = useRef<HTMLTextAreaElement | null>(null);

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const html = e.clipboardData.getData("text/html");
    const txt = e.clipboardData.getData("text/plain");
    if (html) setPastedHtml(html);
    if (txt) setPastedText(txt);
  }

  // Number-base converter.
  const [numericMode, setNumericMode] = useState<10 | 2 | 8 | 16>(10);
  const [numericValue, setNumericValue] = useState<bigint | null>(255n);
  const [numericRaw, setNumericRaw] = useState("255");

  function setNumericFrom(base: 10 | 2 | 8 | 16, raw: string) {
    setNumericMode(base);
    setNumericRaw(raw);
    try {
      const cleaned = raw.trim().replace(/^0[xboBO]/i, "");
      if (cleaned === "") {
        setNumericValue(null);
        return;
      }
      // BigInt requires "0x" or decimal-only; route via parseInt for arbitrary bases.
      if (base === 10) setNumericValue(BigInt(cleaned));
      else if (base === 16) setNumericValue(BigInt("0x" + cleaned));
      else if (base === 8) setNumericValue(BigInt("0o" + cleaned));
      else setNumericValue(BigInt("0b" + cleaned));
    } catch {
      setNumericValue(null);
    }
  }

  // Hashes.
  const [hashInput, setHashInput] = useState("Hello, world!");
  const [hashes, setHashes] = useState<{ [k: string]: string }>({});
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      sha("SHA-1", hashInput),
      sha("SHA-256", hashInput),
      sha("SHA-384", hashInput),
      sha("SHA-512", hashInput),
    ]).then(([s1, s2, s3, s4]) => {
      if (cancelled) return;
      setHashes({ "SHA-1": s1, "SHA-256": s2, "SHA-384": s3, "SHA-512": s4 });
    });
    return () => {
      cancelled = true;
    };
  }, [hashInput]);

  // Timestamp converter.
  const [tsSec, setTsSec] = useState<number>(() => Math.floor(Date.now() / 1000));
  const tsDate = useMemo(() => new Date(tsSec * 1000), [tsSec]);

  // Memoized analysis (cap at 2000 codepoints).
  const inspected = useMemo(() => {
    const all = analyzeText(inspectText);
    return all.slice(0, 2000);
  }, [inspectText]);
  const inspectedFiltered = useMemo(
    () => (showHiddenOnly ? inspected.filter((c) => c.hidden) : inspected),
    [inspected, showHiddenOnly],
  );
  const totalCodepoints = useMemo(() => [...inspectText].length, [inspectText]);
  const utf8Bytes = useMemo(() => enc.encode(inspectText).length, [inspectText]);
  const hiddenCount = inspected.filter((c) => c.hidden).length;
  const lineCount = inspectText === "" ? 0 : inspectText.split(/\r\n|\r|\n/).length;
  const wordCount =
    inspectText.trim() === "" ? 0 : inspectText.trim().split(/\s+/).length;

  function copyText(t: string) {
    try { navigator.clipboard?.writeText(t); } catch { /* */ }
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Character &amp; Digital Conversion
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Reveal what&rsquo;s actually in your text — rich-text HTML, every
          code point, hidden / control / zero-width chars, plus live
          conversions between text, hex, base64, URL, HTML entities, Unicode
          escapes, binary, decimal code points, number bases, SHA hashes,
          and Unix timestamps. Everything runs locally.
        </p>
      </header>

      {/* =====================================================
          RICH TEXT / HTML INSPECTOR
          ===================================================== */}
      <Card title="Rich-text paste inspector">
        <p className="mb-3 text-sm text-gray-500">
          Paste from Word, Outlook, a webpage, or any rich source. The
          browser sends both <code>text/plain</code> and <code>text/html</code>{" "}
          to the clipboard; this tool captures both so you can see the actual
          HTML being copied around.
        </p>

        <textarea
          ref={pasteAreaRef}
          onPaste={handlePaste}
          placeholder="Paste rich text here (Ctrl/Cmd + V)…"
          rows={4}
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPastedHtml("");
              setPastedText("");
              if (pasteAreaRef.current) pasteAreaRef.current.value = "";
            }}
            className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-600 hover:border-eng-rust hover:text-eng-rust"
          >
            Clear
          </button>
          {pastedText && (
            <button
              type="button"
              onClick={() => setInspectText(pastedText)}
              className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
            >
              Send plain text → inspector
            </button>
          )}
          {pastedHtml && (
            <button
              type="button"
              onClick={() => copyText(pastedHtml)}
              className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
            >
              Copy raw HTML
            </button>
          )}
        </div>

        {(pastedHtml || pastedText) && (
          <>
            <div className="mt-4 flex flex-wrap gap-1 border-b border-gray-200">
              {([
                ["html", "Raw HTML"],
                ["pretty", "Pretty HTML"],
                ["rendered", "Rendered"],
                ["text", "Plain text"],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPasteView(id)}
                  className={
                    "rounded-t-lg px-3 py-1.5 text-xs font-semibold " +
                    (pasteView === id
                      ? "bg-white text-eng-navy ring-1 ring-gray-200 ring-offset-0"
                      : "text-gray-500 hover:text-gray-800")
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {pasteView === "html" && (
              <pre className="mt-3 max-h-[28rem] overflow-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
                {pastedHtml || "(no HTML payload — source provided plain text only)"}
              </pre>
            )}
            {pasteView === "pretty" && (
              <pre className="mt-3 max-h-[28rem] overflow-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
                {pastedHtml ? prettyHtml(pastedHtml) : "(no HTML payload)"}
              </pre>
            )}
            {pasteView === "rendered" && (
              <div
                className="mt-3 max-h-[28rem] overflow-auto rounded-lg border border-gray-200 bg-white p-4 text-sm"
                dangerouslySetInnerHTML={{ __html: safeHtmlPreview(pastedHtml) }}
              />
            )}
            {pasteView === "text" && (
              <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-xs text-gray-800">
                {pastedText || "(empty)"}
              </pre>
            )}

            <p className="mt-3 text-[11px] text-gray-500">
              Rendered view strips <code>&lt;script&gt;</code>,{" "}
              <code>&lt;iframe&gt;</code>, and inline event handlers so pasted
              markup can&rsquo;t execute. The Raw / Pretty views show the
              unmodified clipboard payload.
            </p>
          </>
        )}
      </Card>

      {/* =====================================================
          CHARACTER INSPECTOR
          ===================================================== */}
      <div className="mt-6">
        <Card title="Character inspector">
          <p className="mb-3 text-sm text-gray-500">
            Every code point in the input, with hidden / control / zero-width
            characters surfaced and labeled.
          </p>

          <textarea
            value={inspectText}
            onChange={(e) => setInspectText(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatChip label="Code points" value={totalCodepoints} />
            <StatChip label="UTF-16 units" value={inspectText.length} />
            <StatChip label="UTF-8 bytes" value={utf8Bytes} />
            <StatChip label="Words" value={wordCount} />
            <StatChip label="Lines" value={lineCount} />
            <StatChip
              label="Hidden"
              value={hiddenCount}
              tone={hiddenCount > 0 ? "warn" : "neutral"}
            />

            <label className="ml-auto flex items-center gap-2 text-xs font-medium text-gray-600">
              <input
                type="checkbox"
                checked={showHiddenOnly}
                onChange={(e) => setShowHiddenOnly(e.target.checked)}
              />
              Show only hidden / control / format
            </label>

            <button
              type="button"
              onClick={() => setInspectText(stripHidden(inspectText))}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:border-eng-rust hover:text-eng-rust"
            >
              Strip hidden chars
            </button>
            <button
              type="button"
              onClick={() => copyText(stripHidden(inspectText))}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:border-eng-navy hover:text-eng-navy"
            >
              Copy cleaned
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <thead className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-2 py-2">#</th>
                  <th className="px-2 py-2">Char</th>
                  <th className="px-2 py-2">U+</th>
                  <th className="px-2 py-2 text-right">Dec</th>
                  <th className="px-2 py-2">UTF-8</th>
                  <th className="px-2 py-2">UTF-16</th>
                  <th className="px-2 py-2">HTML</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Name</th>
                </tr>
              </thead>
              <tbody>
                {inspectedFiltered.map((c) => (
                  <tr
                    key={c.index}
                    className={
                      "border-t border-gray-100 " +
                      (c.hidden ? "bg-eng-amber/10" : "")
                    }
                  >
                    <td className="px-2 py-1 font-mono text-[11px] text-gray-400">
                      {c.index}
                    </td>
                    <td className="px-2 py-1 font-mono text-base">
                      <span
                        className={
                          c.hidden ? "rounded bg-eng-rust/10 px-1 text-eng-rust" : ""
                        }
                        title={c.hidden ? "Hidden / non-printing" : ""}
                      >
                        {c.preview}
                      </span>
                    </td>
                    <td className="px-2 py-1 font-mono text-xs">
                      U+{c.codePoint.toString(16).toUpperCase().padStart(4, "0")}
                    </td>
                    <td className="px-2 py-1 text-right font-mono text-xs">
                      {c.codePoint}
                    </td>
                    <td className="px-2 py-1 font-mono text-xs text-gray-700">
                      {c.utf8.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")}
                    </td>
                    <td className="px-2 py-1 font-mono text-xs text-gray-700">
                      {c.utf16.map((u) => u.toString(16).padStart(4, "0").toUpperCase()).join(" ")}
                    </td>
                    <td className="px-2 py-1 font-mono text-xs text-gray-700">
                      {c.entity}
                    </td>
                    <td className="px-2 py-1">
                      <CategoryBadge cat={c.category} />
                    </td>
                    <td className="px-2 py-1 text-xs text-gray-600">
                      {c.name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalCodepoints > 2000 && (
              <p className="mt-2 text-xs text-gray-500">
                Showing first 2,000 of {totalCodepoints.toLocaleString()} code points.
              </p>
            )}
            {inspectedFiltered.length === 0 && showHiddenOnly && (
              <p className="mt-2 text-xs text-gray-500">
                No hidden / control / format characters in this input.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* =====================================================
          MULTI-FORMAT ENCODER
          ===================================================== */}
      <div className="mt-6">
        <Card title="Live encoder / decoder">
          <p className="mb-3 text-sm text-gray-500">
            Type or paste into any field — every other field updates live.
            Invalid input in one field just leaves the others unchanged.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <SyncTextarea
              label="Plain text (UTF-8)"
              value={text}
              onChange={setText}
              monospace={false}
            />
            <SyncTextarea
              label="Hex bytes (UTF-8)"
              value={toHex(text)}
              onChange={(v) => setText(fromHex(v))}
            />
            <SyncTextarea
              label="Base64"
              value={toBase64(text)}
              onChange={(v) => setText(fromBase64(v))}
            />
            <SyncTextarea
              label="URL encoded"
              value={toUrl(text)}
              onChange={(v) => setText(fromUrl(v))}
            />
            <SyncTextarea
              label="HTML entities"
              value={toHtmlEntities(text)}
              onChange={(v) => setText(fromHtmlEntities(v))}
            />
            <SyncTextarea
              label={'Unicode escapes (\\uXXXX)'}
              value={toUnicodeEscapes(text)}
              onChange={(v) => setText(fromUnicodeEscapes(v))}
            />
            <SyncTextarea
              label="Binary (UTF-8)"
              value={toBinary(text)}
              onChange={(v) => setText(fromBinary(v))}
            />
            <SyncTextarea
              label="Decimal code points"
              value={toDecimalCp(text)}
              onChange={(v) => setText(fromDecimalCp(v))}
            />
          </div>
        </Card>
      </div>

      {/* =====================================================
          NUMBER BASE / HASH / TIMESTAMP
          ===================================================== */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Number base converter">
          <p className="mb-3 text-sm text-gray-500">
            Type into any base; the others convert. Handles arbitrarily large
            integers.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <BaseField
              label="Decimal (base 10)"
              base={10}
              value={numericValue !== null ? numericValue.toString(10) : ""}
              activeBase={numericMode}
              rawValue={numericRaw}
              onChange={(v) => setNumericFrom(10, v)}
            />
            <BaseField
              label="Hexadecimal (base 16)"
              base={16}
              value={numericValue !== null ? numericValue.toString(16).toUpperCase() : ""}
              activeBase={numericMode}
              rawValue={numericRaw}
              onChange={(v) => setNumericFrom(16, v)}
              prefix="0x"
            />
            <BaseField
              label="Octal (base 8)"
              base={8}
              value={numericValue !== null ? numericValue.toString(8) : ""}
              activeBase={numericMode}
              rawValue={numericRaw}
              onChange={(v) => setNumericFrom(8, v)}
              prefix="0o"
            />
            <BaseField
              label="Binary (base 2)"
              base={2}
              value={numericValue !== null ? numericValue.toString(2) : ""}
              activeBase={numericMode}
              rawValue={numericRaw}
              onChange={(v) => setNumericFrom(2, v)}
              prefix="0b"
            />
          </div>
        </Card>

        <Card title="SHA hashes">
          <p className="mb-3 text-sm text-gray-500">
            UTF-8 bytes of the input are hashed with the browser&rsquo;s
            Web Crypto API.
          </p>
          <textarea
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
          />
          <div className="mt-3 flex flex-col gap-2">
            {(["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const).map((algo) => (
              <div key={algo} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {algo}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(hashes[algo] ?? "")}
                    className="text-[11px] font-semibold text-eng-navy hover:underline"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-gray-800">
                  {hashes[algo] ?? "…"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* =====================================================
          UNIX TIMESTAMP
          ===================================================== */}
      <div className="mt-6">
        <Card title="Unix timestamp converter">
          <div className="grid gap-3 lg:grid-cols-4">
            <Field
              label="Unix seconds"
              value={String(tsSec)}
              onChange={(v) => {
                const n = Number(v);
                if (isFinite(n)) setTsSec(Math.trunc(n));
              }}
            />
            <Field
              label="Unix milliseconds"
              value={String(tsSec * 1000)}
              onChange={(v) => {
                const n = Number(v);
                if (isFinite(n)) setTsSec(Math.trunc(n / 1000));
              }}
            />
            <Field
              label="ISO 8601 (UTC)"
              value={isFinite(tsDate.getTime()) ? tsDate.toISOString() : ""}
              onChange={(v) => {
                const t = Date.parse(v);
                if (!isNaN(t)) setTsSec(Math.trunc(t / 1000));
              }}
            />
            <Field
              label="Local"
              value={isFinite(tsDate.getTime()) ? tsDate.toString() : ""}
              onChange={(v) => {
                const t = Date.parse(v);
                if (!isNaN(t)) setTsSec(Math.trunc(t / 1000));
              }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTsSec(Math.floor(Date.now() / 1000))}
              className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
            >
              Use current time
            </button>
            <button
              type="button"
              onClick={() => setTsSec(0)}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
            >
              Epoch (0)
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
      />
    </label>
  );
}

function StatChip({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "warn";
}) {
  const cls =
    tone === "warn"
      ? "bg-eng-amber/15 text-eng-rust"
      : "bg-gray-100 text-gray-700";
  return (
    <span className={"inline-flex items-baseline gap-1 rounded-full px-3 py-1 text-xs font-medium " + cls}>
      <span className="font-semibold">{value.toLocaleString()}</span>
      <span className="text-[11px] uppercase tracking-wide opacity-70">{label}</span>
    </span>
  );
}

const CATEGORY_STYLE: Record<CharCategory, string> = {
  control: "bg-eng-rust/15 text-eng-rust",
  format: "bg-eng-amber/20 text-eng-rust",
  whitespace: "bg-gray-100 text-gray-600",
  letter: "bg-eng-navy/10 text-eng-navy",
  digit: "bg-emerald-100 text-emerald-700",
  punctuation: "bg-slate-100 text-slate-700",
  symbol: "bg-violet-100 text-violet-700",
  other: "bg-gray-100 text-gray-500",
};

function CategoryBadge({ cat }: { cat: CharCategory }) {
  return (
    <span
      className={
        "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide " +
        CATEGORY_STYLE[cat]
      }
    >
      {cat}
    </span>
  );
}

function BaseField({
  label,
  base,
  value,
  activeBase,
  rawValue,
  onChange,
  prefix,
}: {
  label: string;
  base: 10 | 2 | 8 | 16;
  value: string;
  activeBase: 10 | 2 | 8 | 16;
  rawValue: string;
  onChange: (v: string) => void;
  prefix?: string;
}) {
  // Show the user's raw input in the active field; derived value in others.
  const display = activeBase === base ? rawValue : value;
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </span>
      <div className="mt-1 flex items-stretch overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-eng-navy focus-within:ring-2 focus-within:ring-eng-navy/20">
        {prefix && (
          <span className="flex items-center bg-gray-50 px-2 font-mono text-xs text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={display}
          onChange={(e) => onChange(e.target.value)}
          className="w-full flex-1 bg-transparent px-3 py-2 font-mono text-sm focus:outline-none"
        />
      </div>
    </label>
  );
}
