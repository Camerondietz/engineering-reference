"use client";

// app/content/email-tool.tsx
//
// All-in-one email composer with optional vendor mode powered by a CSV
// upload. CSV is parsed entirely in the browser and persisted to
// localStorage — nothing leaves the user's machine.

import { useEffect, useMemo, useRef, useState } from "react";

// ------------------------------------------------------------
// Types & constants
// ------------------------------------------------------------

type VendorRow = Record<string, string>;

const KNOWN_COLUMNS = [
  "ID",
  "Vendor Name",
  "Vendor ID",
  "Quote",
  "Purchase",
  "Contact",
  "AlternateContact",
  "Phone",
  "Website",
  "Street",
  "PostalCode",
  "City",
  "Vendor Header",
  "Vendor Info",
  "Country",
  "Quote Method",
  "State",
  "Ship",
  "Order Method",
  "Order Min",
  "AcctF",
] as const;

const STORAGE_KEY_VENDORS = "engref:email-tool:vendors:v1";
const STORAGE_KEY_SIG = "engref:email-tool:signature:v1";

const QUICK_GREETINGS = [
  "Good morning,",
  "Good afternoon,",
  "Good evening,",
  "Hello,",
  "Hi there,",
  "Thank you,",
  "Thanks,",
  "Best regards,",
  "Kind regards,",
  "Sincerely,",
  "Talk soon,",
  "Following up —",
];

const QUICK_SNIPPETS: { label: string; body: string }[] = [
  {
    label: "Acknowledge receipt",
    body: "Confirming receipt — thank you. I will review and follow up shortly.",
  },
  {
    label: "Friendly follow-up",
    body:
      "Just following up on the message below. Please let me know if you need anything from my end to move this forward.",
  },
  {
    label: "Request quote",
    body:
      "Could you please send a quote with your MOQ and any available price breaks?",
  },
  {
    label: "Request lead time",
    body:
      "Could you confirm the current lead time and earliest available ship date?",
  },
  {
    label: "Request datasheet",
    body:
      "Could you please send the latest datasheet and any RoHS / REACH documentation?",
  },
  {
    label: "Schedule a call",
    body:
      "Are you available for a brief call this week? I have time on the days/times listed below — let me know what works.",
  },
  {
    label: "Out of office",
    body:
      "I am currently out of the office and will respond when I return. For urgent items, please contact ___.",
  },
  {
    label: "Thanks & next steps",
    body:
      "Thanks for the information. Next steps on my side:\n  • \n  • \nI'll circle back once those are complete.",
  },
];

const SUBJECT_PRESETS: string[] = [
  "Quick question",
  "Following up",
  "RFQ — [Part / Project]",
  "PO confirmation",
  "Meeting request",
  "Updated drawing for review",
];

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function timeOfDayGreeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(d: Date = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

// Tiny CSV parser that handles quoted fields, escaped quotes ("") and
// CRLF / LF line endings. Returns an array of objects keyed by header.
function parseCsv(text: string): VendorRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(cell);
        cell = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += c;
      }
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((v) => v && v.trim() !== ""))
    .map((r) => {
      const obj: VendorRow = {};
      headers.forEach((h, i) => {
        const v = (r[i] ?? "").trim();
        if (v !== "") obj[h] = v;
      });
      return obj;
    });
}

function buildMailto(opts: {
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  body?: string;
}): string {
  const { to = "", cc, bcc, subject, body } = opts;
  const params: string[] = [];
  const enc = (s: string) => encodeURIComponent(s).replace(/%20/g, "%20");
  if (cc) params.push(`cc=${enc(cc)}`);
  if (bcc) params.push(`bcc=${enc(bcc)}`);
  if (subject) params.push(`subject=${enc(subject)}`);
  if (body) params.push(`body=${enc(body)}`);
  return `mailto:${encodeURIComponent(to)}${
    params.length ? "?" + params.join("&") : ""
  }`;
}

type TemplateKind = "contact" | "simple-quote" | "full-quote" | "po";

function buildVendorTemplate(
  kind: TemplateKind,
  vendor: VendorRow,
  signature: string,
): { to: string; subject: string; body: string } {
  const greeting = timeOfDayGreeting();
  const today = formatDate();
  const vendorName = vendor["Vendor Name"] || "Vendor";
  const contact = vendor["Contact"] || "";
  const quote = vendor["Quote"] || "";
  const purchase = vendor["Purchase"] || "";
  const sigBlock = signature ? `\n\n${signature}` : "";

  switch (kind) {
    case "contact":
      return {
        to: contact,
        subject: `${vendorName} ${today}`,
        body: `${greeting},\n\n${sigBlock}`,
      };
    case "simple-quote":
      return {
        to: quote || contact,
        subject: `${vendorName} New RFQ ${today}`,
        body:
          `${greeting},\n\n` +
          `Can you please quote the following with your MOQ and all available price breaks?\n\n` +
          `Part: \nDesc: \n${sigBlock}`,
      };
    case "full-quote":
      return {
        to: quote || contact,
        subject: `${vendorName} ${today}`,
        body:
          `${greeting},\n\n` +
          `Can you please quote the following with your MOQ and all available price breaks? ` +
          `(Please include all of the requested information for this first time quote, needed for part qualification.)\n\n` +
          `Part: \n` +
          `Desc: \n` +
          `Price: ?\n` +
          `MOQ: ?\n` +
          `COO: ?\n` +
          `Standard MFR LT: ?\n` +
          `HTS: ?\n` +
          `ECCN: ?\n` +
          `RoHS / REACH Compliant: Yes or No\n\n` +
          `All surcharges, tariff, credit, and other additional fees if applicable must be included in the quote.\n${sigBlock}`,
      };
    case "po":
      return {
        to: purchase || contact,
        subject: `${vendorName} New PO ${today}`,
        body:
          `${greeting},\n\n` +
          `Attached is new purchase order # . Please review and confirm with best possible ship date.\n${sigBlock}`,
      };
  }
}

// ------------------------------------------------------------
// Page
// ------------------------------------------------------------

export default function EmailToolPage() {
  // --- composer state ---
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [signature, setSignature] = useState("");

  // --- vendor mode state ---
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedFile, setParsedFile] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- hydration guard (time-sensitive values must come from the client) ---
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const sig = localStorage.getItem(STORAGE_KEY_SIG);
      if (sig) setSignature(sig);
      const cached = localStorage.getItem(STORAGE_KEY_VENDORS);
      if (cached) {
        const parsed = JSON.parse(cached) as { vendors: VendorRow[]; file?: string };
        if (Array.isArray(parsed.vendors)) {
          setVendors(parsed.vendors);
          if (parsed.file) setParsedFile(parsed.file);
        }
      }
    } catch {
      /* localStorage unavailable or malformed — ignore */
    }
  }, []);

  // Persist signature.
  useEffect(() => {
    if (!mounted) return;
    try {
      if (signature) localStorage.setItem(STORAGE_KEY_SIG, signature);
      else localStorage.removeItem(STORAGE_KEY_SIG);
    } catch { /* */ }
  }, [signature, mounted]);

  // Persist vendors (so a reload doesn't force re-upload).
  useEffect(() => {
    if (!mounted) return;
    try {
      if (vendors.length > 0) {
        localStorage.setItem(
          STORAGE_KEY_VENDORS,
          JSON.stringify({ vendors, file: parsedFile }),
        );
      } else {
        localStorage.removeItem(STORAGE_KEY_VENDORS);
      }
    } catch { /* */ }
  }, [vendors, parsedFile, mounted]);

  // --- derived: alphabetical groups ---
  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorted = [...vendors].sort((a, b) =>
      (a["Vendor Name"] || "").localeCompare(b["Vendor Name"] || "", undefined, {
        sensitivity: "base",
      }),
    );
    if (!q) return sorted;
    return sorted.filter((v) => {
      const haystack = [
        v["Vendor Name"],
        v["Vendor ID"],
        v["City"],
        v["State"],
        v["Country"],
        v["Contact"],
        v["Quote"],
        v["Purchase"],
        v["Website"],
        v["Vendor Header"],
        v["Vendor Info"],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [vendors, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, VendorRow[]>();
    for (const v of filteredVendors) {
      const name = (v["Vendor Name"] || "").trim();
      const first = name ? name.charAt(0).toUpperCase() : "#";
      const letter = /[A-Z]/.test(first) ? first : "#";
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(v);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredVendors]);

  const availableLetters = useMemo(() => grouped.map(([l]) => l), [grouped]);

  function jumpToLetter(letter: string) {
    const el = document.getElementById(`letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // --- CSV upload ---
  function handleFile(file: File) {
    setParseError(null);
    const reader = new FileReader();
    reader.onerror = () => setParseError("Could not read the file.");
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const rows = parseCsv(text);
        if (rows.length === 0) {
          setParseError("No data rows found in the file.");
          return;
        }
        setVendors(rows);
        setParsedFile(file.name);
      } catch (e) {
        setParseError(
          e instanceof Error ? e.message : "Failed to parse the CSV.",
        );
      }
    };
    reader.readAsText(file);
  }

  function clearVendors() {
    if (!confirm("Clear loaded vendors and stored data?")) return;
    setVendors([]);
    setParsedFile(null);
    setSearch("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // --- composer helpers ---
  function insertAtCursor(textareaId: string, snippet: string) {
    const el = document.getElementById(textareaId) as HTMLTextAreaElement | null;
    if (!el) {
      setBody((b) => (b ? `${b}\n${snippet}` : snippet));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + snippet + el.value.slice(end);
    setBody(next);
    // Restore cursor just after inserted text on the next tick.
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function openComposerMailto() {
    const url = buildMailto({
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject: subject || undefined,
      body: signature && !body.includes(signature)
        ? `${body}${body ? "\n\n" : ""}${signature}`
        : body || undefined,
    });
    window.location.href = url;
  }

  function copyToClipboard(text: string) {
    try {
      navigator.clipboard?.writeText(text);
    } catch { /* */ }
  }

  function openVendorTemplate(kind: TemplateKind, vendor: VendorRow) {
    const { to, subject, body } = buildVendorTemplate(kind, vendor, signature);
    window.location.href = buildMailto({ to, subject, body });
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Automated Email Tool
        </h1>
        <p className="mt-3 max-w-3xl text-gray-600">
          A browser-based composer with quick greetings, subject and body
          snippets, a saveable signature, and an optional vendor mode driven
          by a CSV upload. Everything runs locally — nothing is uploaded.
        </p>
      </header>

      {/* ---------- BASE TOOLS ---------- */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Composer (spans 2) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">Composer</h2>
          <p className="mt-1 text-sm text-gray-500">
            Build an email, then open it in your default mail client.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="To" value={to} onChange={setTo} placeholder="name@example.com" />
            <Field label="Cc" value={cc} onChange={setCc} placeholder="optional" />
            <Field label="Bcc" value={bcc} onChange={setBcc} placeholder="optional" />
            <Field label="Subject" value={subject} onChange={setSubject} placeholder="Subject line" />
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-gray-700">Body</span>
            <textarea
              id="composer-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Write your message…"
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 font-mono text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openComposerMailto}
              className="rounded-full bg-eng-navy px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-eng-blue"
            >
              Open in mail client
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(body)}
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:border-eng-navy hover:text-eng-navy"
            >
              Copy body
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(subject)}
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:border-eng-navy hover:text-eng-navy"
            >
              Copy subject
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Clear all composer fields?")) {
                  setTo("");
                  setCc("");
                  setBcc("");
                  setSubject("");
                  setBody("");
                }
              }}
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-500 hover:border-eng-rust hover:text-eng-rust"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Quick inserts */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Quick inserts</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tap to insert at the cursor in the body field.
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Greetings
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_GREETINGS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => insertAtCursor("composer-body", g + "\n\n")}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
                >
                  {g}
                </button>
              ))}
            </div>
            {mounted && (
              <p className="mt-2 text-xs text-gray-500">
                Current time-of-day greeting:{" "}
                <strong className="text-eng-navy">{timeOfDayGreeting()}</strong>
              </p>
            )}
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Subject presets
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUBJECT_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Body snippets
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {QUICK_SNIPPETS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => insertAtCursor("composer-body", s.body + "\n\n")}
                  className="text-left rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 hover:border-eng-navy hover:bg-gray-50"
                  title={s.body}
                >
                  <span className="font-semibold text-gray-900">{s.label}</span>
                  <br />
                  <span className="line-clamp-2 text-gray-500">{s.body}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Insert helpers
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => insertAtCursor("composer-body", formatDate())}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
              >
                Today&apos;s date
              </button>
              <button
                type="button"
                onClick={() => insertAtCursor("composer-body", new Date().toISOString())}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
              >
                ISO timestamp
              </button>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Signature (saved locally)
            </p>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows={4}
              placeholder={"Your Name\nTitle | Company\n555-555-5555"}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 font-mono text-xs shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Appended to vendor templates and to the composer when you click
              &ldquo;Open in mail client.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ---------- RECIPIENT LIST BUILDER ---------- */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Recipient list cleaner</h2>
        <p className="mt-1 text-sm text-gray-500">
          Paste a messy list of email addresses (commas, semicolons, newlines,
          spaces — it doesn&rsquo;t matter). Get a deduplicated, comma-separated
          string back, ready to drop into the To / Cc / Bcc fields.
        </p>
        <RecipientCleaner />
      </section>

      {/* ---------- VENDOR MODE ---------- */}
      <section className="mt-10">
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-rust">
                Optional · Vendor mode
              </p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">
                Upload a vendor CSV to unlock per-vendor templates
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-gray-600">
                Drop a CSV with the column names below. Anything missing is
                ignored. The list shows up alphabetically with letter jumps,
                and each vendor gets four one-click email templates that fill
                in the right recipient, greeting, subject and body.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <label className="cursor-pointer rounded-full bg-eng-navy px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-eng-blue">
                Choose CSV…
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
              {vendors.length > 0 && (
                <button
                  type="button"
                  onClick={clearVendors}
                  className="text-xs font-semibold text-eng-rust hover:underline"
                >
                  Clear loaded data
                </button>
              )}
            </div>
          </div>

          <details className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700">
              Expected column headers (case-sensitive)
            </summary>
            <div className="mt-3 grid gap-1 text-xs text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
              {KNOWN_COLUMNS.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-eng-amber" />
                  <code className="font-mono text-gray-800">{c}</code>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Quote / Purchase / Contact / AlternateContact are expected to be
              email addresses. &ldquo;Old Address&rdquo; is ignored if present.
              Empty cells are simply skipped.
            </p>
          </details>

          {parseError && (
            <p className="mt-3 rounded-lg bg-eng-rust/10 px-3 py-2 text-sm text-eng-rust">
              {parseError}
            </p>
          )}
          {parsedFile && vendors.length > 0 && (
            <p className="mt-3 text-sm text-gray-600">
              Loaded <strong>{vendors.length}</strong> vendor
              {vendors.length === 1 ? "" : "s"} from{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                {parsedFile}
              </code>
              .
            </p>
          )}
        </div>

        {vendors.length > 0 && (
          <>
            {/* Search + letter jump */}
            <div className="sticky top-16 z-10 mt-6 rounded-2xl border border-gray-200 bg-white/90 p-3 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vendors — name, ID, city, contact…"
                  className="w-full flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
                />
                <div className="text-xs text-gray-500">
                  {filteredVendors.length} of {vendors.length}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((L) => {
                  const has = availableLetters.includes(L);
                  return (
                    <button
                      key={L}
                      type="button"
                      disabled={!has}
                      onClick={() => jumpToLetter(L)}
                      className={
                        "h-7 w-7 rounded text-xs font-semibold " +
                        (has
                          ? "bg-eng-navy/5 text-eng-navy hover:bg-eng-navy hover:text-white"
                          : "cursor-not-allowed text-gray-300")
                      }
                    >
                      {L}
                    </button>
                  );
                })}
                {availableLetters.includes("#") && (
                  <button
                    type="button"
                    onClick={() => jumpToLetter("#")}
                    className="h-7 w-7 rounded bg-eng-navy/5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
                  >
                    #
                  </button>
                )}
              </div>
            </div>

            {/* Vendor groups */}
            <div className="mt-6 flex flex-col gap-8">
              {grouped.map(([letter, list]) => (
                <div key={letter} id={`letter-${letter}`} className="scroll-mt-44">
                  <h3 className="border-b border-gray-200 pb-2 text-2xl font-bold text-eng-navy">
                    {letter}
                  </h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {list.map((v, i) => (
                      <VendorCard
                        key={(v["Vendor ID"] || v["ID"] || v["Vendor Name"] || "") + ":" + i}
                        vendor={v}
                        onOpenTemplate={openVendorTemplate}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {grouped.length === 0 && (
                <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                  No vendors match &ldquo;{search}&rdquo;.
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

// ------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
      />
    </label>
  );
}

function RecipientCleaner() {
  const [raw, setRaw] = useState("");
  const cleaned = useMemo(() => {
    const tokens = raw
      .split(/[\s,;]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && /@/.test(t));
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of tokens) {
      const key = t.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(t);
      }
    }
    return out;
  }, [raw]);

  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={4}
        placeholder="Paste addresses here…"
        className="rounded-xl border border-gray-300 bg-white p-3 font-mono text-xs shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
      />
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-xs">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {cleaned.length} unique
          </span>
          <button
            type="button"
            disabled={cleaned.length === 0}
            onClick={() => navigator.clipboard?.writeText(cleaned.join(", "))}
            className="text-[11px] font-semibold text-eng-navy hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
          >
            Copy
          </button>
        </div>
        <div className="break-words text-gray-700">
          {cleaned.length > 0 ? cleaned.join(", ") : (
            <span className="text-gray-400">Cleaned list appears here…</span>
          )}
        </div>
      </div>
    </div>
  );
}

function VendorCard({
  vendor,
  onOpenTemplate,
}: {
  vendor: VendorRow;
  onOpenTemplate: (kind: TemplateKind, v: VendorRow) => void;
}) {
  const name = vendor["Vendor Name"] || "(unnamed vendor)";
  const id = vendor["Vendor ID"] || vendor["ID"];
  const header = vendor["Vendor Header"];
  const info = vendor["Vendor Info"];

  // Show all the non-empty fields the user gave us, in a sensible order.
  const displayOrder: string[] = [
    "Vendor ID",
    "ID",
    "Contact",
    "Quote",
    "Purchase",
    "AlternateContact",
    "Phone",
    "Website",
    "Street",
    "City",
    "State",
    "PostalCode",
    "Country",
    "Quote Method",
    "Order Method",
    "Order Min",
    "Ship",
    "AcctF",
  ];
  const seen = new Set(displayOrder.concat(["Vendor Name", "Vendor Header", "Vendor Info", "Old Address"]));
  const extras = Object.keys(vendor).filter((k) => !seen.has(k));
  const fields = [...displayOrder, ...extras]
    .map((k) => [k, vendor[k]] as const)
    .filter(([, v]) => v && v.trim() !== "");

  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-eng-navy/40 hover:shadow-md">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-lg font-semibold text-gray-900">{name}</h4>
          {id && (
            <p className="mt-0.5 font-mono text-xs text-gray-500">{id}</p>
          )}
        </div>
        {vendor["Website"] && (
          <a
            href={
              vendor["Website"].startsWith("http")
                ? vendor["Website"]
                : `https://${vendor["Website"]}`
            }
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs font-semibold text-eng-navy hover:underline"
          >
            Website ↗
          </a>
        )}
      </header>

      {(header || info) && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
          {header && <p className="font-semibold text-gray-900">{header}</p>}
          {info && <p className="mt-1 whitespace-pre-wrap text-gray-600">{info}</p>}
        </div>
      )}

      {fields.length > 0 && (
        <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs">
          {fields.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-semibold text-gray-500">{k}</dt>
              <dd className="break-all text-gray-800">
                {/^(Contact|Quote|Purchase|AlternateContact)$/.test(k) ? (
                  <a className="text-eng-navy hover:underline" href={`mailto:${v}`}>
                    {v}
                  </a>
                ) : k === "Phone" ? (
                  <a className="text-eng-navy hover:underline" href={`tel:${v.replace(/[^+\d]/g, "")}`}>
                    {v}
                  </a>
                ) : (
                  v
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-auto grid grid-cols-2 gap-2 pt-4 sm:grid-cols-4">
        <TemplateButton
          label="Contact"
          tooltip="Simple contact email (uses Contact)"
          tone="navy"
          onClick={() => onOpenTemplate("contact", vendor)}
        />
        <TemplateButton
          label="Simple RFQ"
          tooltip="Simple quote request (Quote → Contact)"
          tone="amber"
          onClick={() => onOpenTemplate("simple-quote", vendor)}
        />
        <TemplateButton
          label="Full RFQ"
          tooltip="Full first-time quote request (Quote → Contact)"
          tone="amber"
          onClick={() => onOpenTemplate("full-quote", vendor)}
        />
        <TemplateButton
          label="New PO"
          tooltip="Purchase order email (Purchase → Contact)"
          tone="rust"
          onClick={() => onOpenTemplate("po", vendor)}
        />
      </div>
    </article>
  );
}

function TemplateButton({
  label,
  tooltip,
  tone,
  onClick,
}: {
  label: string;
  tooltip?: string;
  tone: "navy" | "amber" | "rust";
  onClick: () => void;
}) {
  const toneCls =
    tone === "navy"
      ? "bg-eng-navy text-white hover:bg-eng-blue"
      : tone === "amber"
        ? "bg-eng-amber/15 text-eng-rust hover:bg-eng-amber/30"
        : "bg-eng-rust/10 text-eng-rust hover:bg-eng-rust/20";
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className={
        "rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition " +
        toneCls
      }
    >
      {label}
    </button>
  );
}
