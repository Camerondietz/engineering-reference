"use client";

// app/content/business-card-tool.tsx
//
// Capture business cards via the camera (or upload), extract text
// with Tesseract.js OCR (loaded on-demand from CDN, then cached
// offline), auto-populate a detailed contact form, and build up a
// running list. Each card can be downloaded as a vCard or used to
// open a LinkedIn search. The list exports as CSV with database-
// friendly one-value-per-column layout.

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

// ============================================================
// Types
// ============================================================

interface Contact {
  id: string;
  // Name (broken out for databases)
  prefix: string;      // Mr., Ms., Dr., etc.
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;      // Jr., PhD, PE, etc.
  // Position
  title: string;
  department: string;
  company: string;
  // Phones
  workPhone: string;
  mobilePhone: string;
  fax: string;
  // Digital
  email: string;
  emailSecondary: string;
  website: string;
  linkedin: string;
  twitter: string;
  // Address
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  // Misc
  notes: string;
  addedAt: string; // ISO date
}

const EMPTY: Contact = {
  id: "",
  prefix: "",
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  title: "",
  department: "",
  company: "",
  workPhone: "",
  mobilePhone: "",
  fax: "",
  email: "",
  emailSecondary: "",
  website: "",
  linkedin: "",
  twitter: "",
  street1: "",
  street2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  notes: "",
  addedAt: "",
};

const STORAGE_KEY = "engref:business-card-tool:v2";
const uid = () => Math.random().toString(36).slice(2, 9);

// ============================================================
// Tesseract loader (CDN, on-demand, cached by the browser)
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TesseractGlobal = any;

const TESSERACT_URL = "https://unpkg.com/tesseract.js@5/dist/tesseract.min.js";

function loadTesseract(): Promise<TesseractGlobal> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  const w = window as unknown as { Tesseract?: TesseractGlobal };
  if (w.Tesseract) return Promise.resolve(w.Tesseract);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-tesseract=\"true\"]",
    );
    if (existing) {
      existing.addEventListener("load", () =>
        w.Tesseract ? resolve(w.Tesseract) : reject(new Error("Tesseract failed to attach")),
      );
      existing.addEventListener("error", () => reject(new Error("Tesseract load error")));
      return;
    }
    const s = document.createElement("script");
    s.src = TESSERACT_URL;
    s.async = true;
    s.dataset.tesseract = "true";
    s.onload = () =>
      w.Tesseract ? resolve(w.Tesseract) : reject(new Error("Tesseract failed to attach"));
    s.onerror = () => reject(new Error("Could not load Tesseract from CDN"));
    document.head.appendChild(s);
  });
}

// ============================================================
// vCard + CSV
// ============================================================

function escapeVcard(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

function fullName(c: Contact): string {
  return [c.prefix, c.firstName, c.middleName, c.lastName, c.suffix]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ");
}

function toVcard(c: Contact): string {
  const fn = fullName(c) || c.company || "Unknown";
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:" + escapeVcard(fn),
    "N:" + escapeVcard(c.lastName) + ";" +
      escapeVcard(c.firstName) + ";" +
      escapeVcard(c.middleName) + ";" +
      escapeVcard(c.prefix) + ";" +
      escapeVcard(c.suffix),
  ];
  if (c.company) lines.push("ORG:" + escapeVcard(c.company + (c.department ? ";" + c.department : "")));
  if (c.title) lines.push("TITLE:" + escapeVcard(c.title));
  if (c.workPhone) lines.push("TEL;TYPE=WORK,VOICE:" + escapeVcard(c.workPhone));
  if (c.mobilePhone) lines.push("TEL;TYPE=CELL,VOICE:" + escapeVcard(c.mobilePhone));
  if (c.fax) lines.push("TEL;TYPE=WORK,FAX:" + escapeVcard(c.fax));
  if (c.email) lines.push("EMAIL;TYPE=WORK:" + escapeVcard(c.email));
  if (c.emailSecondary) lines.push("EMAIL;TYPE=HOME:" + escapeVcard(c.emailSecondary));
  if (c.website) lines.push("URL:" + escapeVcard(c.website));
  if (c.linkedin) lines.push("URL;TYPE=LinkedIn:" + escapeVcard(c.linkedin));
  if (c.twitter) lines.push("URL;TYPE=Twitter:" + escapeVcard(c.twitter));
  const hasAddr = c.street1 || c.street2 || c.city || c.state || c.postalCode || c.country;
  if (hasAddr) {
    lines.push(
      "ADR;TYPE=WORK:;" +
        escapeVcard(c.street2) + ";" +
        escapeVcard(c.street1) + ";" +
        escapeVcard(c.city) + ";" +
        escapeVcard(c.state) + ";" +
        escapeVcard(c.postalCode) + ";" +
        escapeVcard(c.country),
    );
  }
  if (c.notes) lines.push("NOTE:" + escapeVcard(c.notes));
  if (c.addedAt) lines.push("REV:" + c.addedAt);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

const CSV_HEADERS: (keyof Contact)[] = [
  "prefix", "firstName", "middleName", "lastName", "suffix",
  "title", "department", "company",
  "workPhone", "mobilePhone", "fax",
  "email", "emailSecondary", "website", "linkedin", "twitter",
  "street1", "street2", "city", "state", "postalCode", "country",
  "notes", "addedAt",
];

function csvEscape(v: string): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function toCsv(rows: Contact[]): string {
  const header = CSV_HEADERS.map((h) => csvEscape(h)).join(",");
  const lines = rows.map((r) => CSV_HEADERS.map((h) => csvEscape(r[h])).join(","));
  return [header, ...lines].join("\n");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function linkedinSearchUrl(c: Pick<Contact, "firstName" | "lastName" | "company">): string {
  const q = [c.firstName, c.lastName, c.company].filter(Boolean).join(" ");
  return "https://www.linkedin.com/search/results/people/?keywords=" + encodeURIComponent(q);
}

// ============================================================
// OCR text -> field parser (best-effort heuristics)
// ============================================================

const COMPANY_SUFFIX_RE =
  /\b(inc\.?|incorporated|llc|l\.?l\.?c\.?|corp\.?|corporation|ltd\.?|limited|co\.?|company|gmbh|s\.?a\.?|s\.?r\.?l\.?|plc|holdings|group|solutions|systems|technologies|tech|industries|engineering|manufacturing)\b/i;

const US_STATE_ABBR = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
]);

function parseOcrText(text: string): Partial<Contact> {
  const raw = text.replace(/\r/g, "");
  const linesAll = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const out: Partial<Contact> = {};

  // --- Emails ---
  const emails = [...raw.matchAll(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g)].map((m) => m[0]);
  if (emails[0]) out.email = emails[0];
  if (emails[1]) out.emailSecondary = emails[1];

  // --- URLs ---
  const urls = [
    ...raw.matchAll(/\b(?:https?:\/\/|www\.)[^\s<>"',]+/gi),
  ].map((m) => m[0].replace(/[.,;]+$/, ""));
  for (const u of urls) {
    const l = u.toLowerCase();
    if (l.includes("linkedin.com")) { if (!out.linkedin) out.linkedin = u; }
    else if (l.includes("twitter.com") || l.includes("x.com")) { if (!out.twitter) out.twitter = u; }
    else if (!out.website) out.website = u;
  }

  // --- Phones, per line so we can spot type prefixes ---
  const phoneCandidateRe = /(\+?\d[\d\s.\-()]{7,}\d)/;
  for (const line of linesAll) {
    const m = line.match(phoneCandidateRe);
    if (!m) continue;
    const number = m[1].trim();
    const lower = line.toLowerCase();
    const isMobile =
      /\b(mobile|cell|cellular|mob\.?|c)\s*[:.\-]/i.test(line) ||
      /\bm\s*[:.\-]/i.test(line);
    const isFax = /\b(fax|f)\s*[:.\-]/i.test(line);
    if (isFax) { if (!out.fax) out.fax = number; }
    else if (isMobile) { if (!out.mobilePhone) out.mobilePhone = number; }
    else if (!out.workPhone) out.workPhone = number;
    // If workPhone is filled and no mobile yet, second unlabelled phone goes to mobile.
    else if (!out.mobilePhone && !lower.includes(out.workPhone)) out.mobilePhone = number;
  }

  // --- Company ---
  const companyLine = linesAll.find((l) => COMPANY_SUFFIX_RE.test(l));
  if (companyLine) out.company = companyLine;

  // --- Address ---
  // Zip code
  const zip = raw.match(/\b(\d{5})(?:[- ]?\d{4})?\b/);
  if (zip) out.postalCode = zip[0];
  // Look for a "City, ST ZIP" line
  const cityStateZip = raw.match(/\b([A-Za-z .'-]+),\s*([A-Z]{2})\s+(\d{5}(?:[- ]?\d{4})?)/);
  if (cityStateZip) {
    out.city = cityStateZip[1].trim();
    if (US_STATE_ABBR.has(cityStateZip[2])) out.state = cityStateZip[2];
    out.postalCode = cityStateZip[3];
  }
  // Street: line starting with a number
  const streetLine = linesAll.find((l) => /^\d+\s+\S+/.test(l) && l.length <= 60);
  if (streetLine) out.street1 = streetLine;

  // --- Name / title guessing ---
  // Filter out lines that were already claimed by emails/urls/phones/company/address.
  const claimed = new Set<string>();
  for (const e of emails) claimed.add(findLineContaining(linesAll, e));
  for (const u of urls) claimed.add(findLineContaining(linesAll, u));
  if (companyLine) claimed.add(companyLine);
  if (streetLine) claimed.add(streetLine);
  if (cityStateZip) claimed.add(cityStateZip[0]);
  const remaining = linesAll.filter((l) => {
    if (claimed.has(l)) return false;
    if (phoneCandidateRe.test(l)) return false;
    return true;
  });
  // Heuristic: first "clean" line is the name.
  const nameLine = remaining.find((l) => /^[A-Za-zÀ-ÖØ-öø-ÿ.'\-\s]+$/.test(l) && l.length <= 40);
  if (nameLine) {
    const parts = nameLine.split(/\s+/);
    // Detect leading prefix / trailing suffix.
    const prefixes = new Set(["Mr", "Mr.", "Mrs", "Mrs.", "Ms", "Ms.", "Dr", "Dr.", "Prof", "Prof."]);
    const suffixes = new Set(["Jr", "Jr.", "Sr", "Sr.", "II", "III", "IV", "PhD", "P.E.", "PE", "MBA", "CPA"]);
    if (parts.length > 0 && prefixes.has(parts[0])) out.prefix = parts.shift() as string;
    if (parts.length > 1 && suffixes.has(parts[parts.length - 1])) out.suffix = parts.pop() as string;
    if (parts.length >= 2) {
      out.firstName = parts[0];
      out.lastName = parts[parts.length - 1];
      if (parts.length >= 3) out.middleName = parts.slice(1, -1).join(" ");
    } else if (parts.length === 1) {
      out.firstName = parts[0];
    }
  }
  // Second clean line is often the title.
  const titleLine = remaining.find(
    (l) => l !== nameLine && /[A-Za-z]/.test(l) && !COMPANY_SUFFIX_RE.test(l) && l.length <= 60,
  );
  if (titleLine) out.title = titleLine;

  return out;
}

function findLineContaining(lines: string[], token: string): string {
  return lines.find((l) => l.includes(token)) ?? "";
}

// ============================================================
// Page
// ============================================================

export default function BusinessCardToolPage() {
  const [draft, setDraft] = useState<Contact>({ ...EMPTY });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [mounted, setMounted] = useState(false);

  // Camera
  const [photo, setPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OCR
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string>("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Hydrate
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setContacts(parsed);
      }
    } catch { /* */ }
  }, []);
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts)); } catch { /* */ }
  }, [contacts, mounted]);
  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); };
  }, [stream]);

  async function startCamera() {
    setCameraError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setStream(s);
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (e) {
      setCameraError(
        e instanceof Error
          ? e.message
          : "Camera not available. Use the file upload option instead.",
      );
      setCameraOn(false);
    }
  }
  function stopCamera() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOn(false);
  }
  function snap() {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL("image/jpeg", 0.9));
    setOcrText("");
    setOcrError(null);
    stopCamera();
  }
  function retake() {
    setPhoto(null);
    setOcrText("");
    setOcrError(null);
    startCamera();
  }
  function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      setOcrText("");
      setOcrError(null);
    };
    reader.readAsDataURL(f);
  }

  async function runOcr() {
    if (!photo) return;
    setOcrBusy(true);
    setOcrError(null);
    setOcrStatus("loading engine");
    setOcrProgress(0);
    setOcrText("");
    try {
      const Tesseract = await loadTesseract();
      const result = await Tesseract.recognize(photo, "eng", {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger: (m: any) => {
          if (m?.status) setOcrStatus(String(m.status));
          if (typeof m?.progress === "number") setOcrProgress(m.progress);
        },
      });
      const text = String(result?.data?.text || "");
      setOcrText(text);
      const parsed = parseOcrText(text);
      setDraft((d) => ({ ...d, ...Object.fromEntries(
        Object.entries(parsed).filter(([, v]) => v && String(v).length > 0),
      ) }));
    } catch (e) {
      setOcrError(e instanceof Error ? e.message : String(e));
    } finally {
      setOcrBusy(false);
      setOcrStatus("");
    }
  }

  function reparse() {
    if (!ocrText) return;
    const parsed = parseOcrText(ocrText);
    setDraft((d) => ({ ...d, ...Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v && String(v).length > 0),
    ) }));
  }

  function patchDraft(p: Partial<Contact>) { setDraft((d) => ({ ...d, ...p })); }

  function addContact() {
    const hasSomething =
      draft.firstName || draft.lastName || draft.email || draft.workPhone || draft.mobilePhone || draft.company;
    if (!hasSomething) {
      alert("Add at least a name, email, phone, or company.");
      return;
    }
    const c: Contact = { ...draft, id: uid(), addedAt: new Date().toISOString() };
    setContacts((cs) => [...cs, c]);
    setDraft({ ...EMPTY });
    setPhoto(null);
    setOcrText("");
  }

  function downloadVcard(c: Contact) {
    const blob = new Blob([toVcard(c)], { type: "text/vcard;charset=utf-8" });
    const safe = (fullName(c) || c.company || "contact").replace(/[^\w\-]+/g, "_");
    downloadBlob(blob, safe + ".vcf");
  }
  function openLinkedin(c: Contact) {
    window.open(linkedinSearchUrl(c), "_blank", "noopener,noreferrer");
  }
  function removeContact(id: string) {
    setContacts((cs) => cs.filter((c) => c.id !== id));
  }
  function clearList() {
    if (!confirm("Remove all saved business cards from this device?")) return;
    setContacts([]);
  }
  function copyCsv() {
    try { navigator.clipboard?.writeText(toCsv(contacts)); } catch { /* */ }
  }
  function downloadCsv() {
    const blob = new Blob([toCsv(contacts)], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, "business-cards-" + new Date().toISOString().slice(0, 10) + ".csv");
  }
  function downloadAllVcards() {
    const all = contacts.map(toVcard).join("\r\n");
    const blob = new Blob([all], { type: "text/vcard;charset=utf-8" });
    downloadBlob(blob, "contacts-" + new Date().toISOString().slice(0, 10) + ".vcf");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Business Card Scanner
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Snap or upload a business card, extract the text with in-browser
          OCR, review and edit the parsed fields, and build a running list.
          Each card downloads as a vCard or opens a LinkedIn search; the
          full list exports as a database-friendly CSV.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* ====================================================
            CAPTURE + OCR
            ==================================================== */}
        <Card title="1. Capture">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-900">
            {photo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={photo} alt="Captured" className="absolute inset-0 h-full w-full object-contain" />
            ) : cameraOn ? (
              <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-gray-300">
                {cameraError ? cameraError : "Click Start camera, or upload a photo."}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {!cameraOn && !photo && (
              <button type="button" onClick={startCamera} className="rounded-full bg-eng-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-eng-blue">
                Start camera
              </button>
            )}
            {cameraOn && (
              <>
                <button type="button" onClick={snap} className="rounded-full bg-eng-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-eng-blue">
                  Snap photo
                </button>
                <button type="button" onClick={stopCamera} className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 hover:border-eng-rust hover:text-eng-rust">
                  Stop
                </button>
              </>
            )}
            {photo && (
              <button type="button" onClick={retake} className="rounded-full bg-eng-navy/10 px-4 py-1.5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white">
                Retake
              </button>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full bg-eng-navy/10 px-4 py-1.5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white">
              Upload photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onUpload} className="hidden" />
          </div>

          {/* OCR row */}
          {photo && (
            <div className="mt-4 rounded-xl border border-dashed border-eng-navy/40 bg-eng-navy/5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-eng-navy">
                    Extract text from card
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Runs Tesseract.js in your browser. First use downloads
                    ~10 MB of engine + English data (cached after that).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={runOcr}
                  disabled={ocrBusy}
                  className="rounded-full bg-eng-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-eng-blue disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {ocrBusy ? "Working..." : ocrText ? "Re-run OCR" : "Scan card"}
                </button>
              </div>

              {ocrBusy && (
                <div className="mt-3">
                  <p className="text-[11px] text-gray-600">{ocrStatus}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-eng-navy transition-all"
                      style={{ width: Math.round(ocrProgress * 100) + "%" }}
                    />
                  </div>
                </div>
              )}

              {ocrError && (
                <p className="mt-2 rounded-lg bg-eng-rust/10 px-3 py-2 text-xs text-eng-rust">
                  {ocrError}
                </p>
              )}

              {ocrText && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-[11px] font-semibold text-gray-700">
                    Recognized text
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); reparse(); }}
                      className="ml-2 rounded-full bg-eng-amber/20 px-2 py-0.5 text-[10px] font-semibold text-eng-rust hover:bg-eng-amber/40"
                    >
                      Re-apply to form
                    </button>
                  </summary>
                  <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-white p-2 font-mono text-[11px] text-gray-800">
                    {ocrText}
                  </pre>
                </details>
              )}
            </div>
          )}
        </Card>

        {/* ====================================================
            FORM
            ==================================================== */}
        <Card title="2. Card details">
          <FormSection title="Name">
            <div className="grid gap-3 sm:grid-cols-[6rem_1fr_1fr_1fr_6rem]">
              <Field label="Prefix" value={draft.prefix} onChange={(v) => patchDraft({ prefix: v })} placeholder="Dr." />
              <Field label="First" value={draft.firstName} onChange={(v) => patchDraft({ firstName: v })} placeholder="Jane" />
              <Field label="Middle" value={draft.middleName} onChange={(v) => patchDraft({ middleName: v })} />
              <Field label="Last" value={draft.lastName} onChange={(v) => patchDraft({ lastName: v })} placeholder="Doe" />
              <Field label="Suffix" value={draft.suffix} onChange={(v) => patchDraft({ suffix: v })} placeholder="PE" />
            </div>
          </FormSection>

          <FormSection title="Position">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Title" value={draft.title} onChange={(v) => patchDraft({ title: v })} placeholder="Engineering Manager" />
              <Field label="Department" value={draft.department} onChange={(v) => patchDraft({ department: v })} />
              <Field label="Company" value={draft.company} onChange={(v) => patchDraft({ company: v })} placeholder="Acme Industrial" />
            </div>
          </FormSection>

          <FormSection title="Phones, email, web">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Work phone" value={draft.workPhone} onChange={(v) => patchDraft({ workPhone: v })} placeholder="+1 555 555 0100" />
              <Field label="Mobile" value={draft.mobilePhone} onChange={(v) => patchDraft({ mobilePhone: v })} />
              <Field label="Fax" value={draft.fax} onChange={(v) => patchDraft({ fax: v })} />
              <Field label="Email" value={draft.email} onChange={(v) => patchDraft({ email: v })} placeholder="jane@acme.com" />
              <Field label="Email (alt)" value={draft.emailSecondary} onChange={(v) => patchDraft({ emailSecondary: v })} />
              <Field label="Website" value={draft.website} onChange={(v) => patchDraft({ website: v })} placeholder="https://acme.com" />
            </div>
          </FormSection>

          <FormSection title="Social">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="LinkedIn URL" value={draft.linkedin} onChange={(v) => patchDraft({ linkedin: v })} />
              <Field label="Twitter / X" value={draft.twitter} onChange={(v) => patchDraft({ twitter: v })} />
            </div>
          </FormSection>

          <FormSection title="Address">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Street 1" value={draft.street1} onChange={(v) => patchDraft({ street1: v })} placeholder="123 Main St" />
              <Field label="Street 2" value={draft.street2} onChange={(v) => patchDraft({ street2: v })} placeholder="Suite 400" />
              <Field label="City" value={draft.city} onChange={(v) => patchDraft({ city: v })} placeholder="Austin" />
              <Field label="State / region" value={draft.state} onChange={(v) => patchDraft({ state: v })} placeholder="TX" />
              <Field label="Postal code" value={draft.postalCode} onChange={(v) => patchDraft({ postalCode: v })} placeholder="78701" />
              <Field label="Country" value={draft.country} onChange={(v) => patchDraft({ country: v })} placeholder="USA" />
            </div>
          </FormSection>

          <FormSection title="Notes">
            <textarea
              value={draft.notes}
              onChange={(e) => patchDraft({ notes: e.target.value })}
              rows={2}
              placeholder="Met at conference, follow up re: PLC upgrade..."
              className={inputCls}
            />
          </FormSection>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={addContact} className="rounded-full bg-eng-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-eng-blue">
              Add to list
            </button>
            <button
              type="button"
              onClick={() => downloadVcard({ ...draft, id: "tmp", addedAt: new Date().toISOString() })}
              disabled={!draft.firstName && !draft.lastName && !draft.email && !draft.workPhone && !draft.mobilePhone}
              className="rounded-full bg-eng-navy/10 px-4 py-1.5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              Download vCard
            </button>
            <button
              type="button"
              onClick={() => openLinkedin(draft)}
              disabled={!draft.firstName && !draft.lastName}
              className="rounded-full bg-eng-navy/10 px-4 py-1.5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              Search on LinkedIn
            </button>
            <button
              type="button"
              onClick={() => { setDraft({ ...EMPTY }); setPhoto(null); setOcrText(""); }}
              className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 hover:border-eng-rust hover:text-eng-rust"
            >
              Clear form
            </button>
          </div>
        </Card>
      </div>

      {/* ====================================================
          LIST
          ==================================================== */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            3. Saved cards ({contacts.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyCsv} disabled={contacts.length === 0}
              className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400">
              Copy CSV
            </button>
            <button type="button" onClick={downloadCsv} disabled={contacts.length === 0}
              className="rounded-full bg-eng-navy px-3 py-1 text-xs font-semibold text-white hover:bg-eng-blue disabled:cursor-not-allowed disabled:bg-gray-300">
              Download CSV
            </button>
            <button type="button" onClick={downloadAllVcards} disabled={contacts.length === 0}
              className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400">
              Download all vCards
            </button>
            <button type="button" onClick={clearList} disabled={contacts.length === 0}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-500 hover:border-eng-rust hover:text-eng-rust disabled:cursor-not-allowed">
              Clear list
            </button>
          </div>
        </div>

        {contacts.length === 0 ? (
          <p className="mt-4 rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
            No cards yet. Capture or upload a photo, run OCR, review the
            parsed fields, and click &quot;Add to list.&quot;
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Title / Company</th>
                  <th className="px-2 py-2">Phone</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">City / State</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 align-top">
                    <td className="px-2 py-2">
                      <div className="font-semibold text-gray-900">{fullName(c) || "-"}</div>
                    </td>
                    <td className="px-2 py-2 text-gray-700">
                      <div>{c.title || "-"}</div>
                      <div className="text-xs text-gray-500">{c.company || ""}</div>
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-gray-700">
                      {c.workPhone && (
                        <div>
                          <span className="text-[10px] text-gray-400">W </span>
                          <a className="text-eng-navy hover:underline" href={"tel:" + c.workPhone.replace(/[^+\d]/g, "")}>{c.workPhone}</a>
                        </div>
                      )}
                      {c.mobilePhone && (
                        <div>
                          <span className="text-[10px] text-gray-400">M </span>
                          <a className="text-eng-navy hover:underline" href={"tel:" + c.mobilePhone.replace(/[^+\d]/g, "")}>{c.mobilePhone}</a>
                        </div>
                      )}
                      {!c.workPhone && !c.mobilePhone && "-"}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-gray-700">
                      {c.email ? (
                        <a className="text-eng-navy hover:underline" href={"mailto:" + c.email}>{c.email}</a>
                      ) : "-"}
                      {c.emailSecondary && (
                        <div>
                          <a className="text-eng-navy hover:underline" href={"mailto:" + c.emailSecondary}>{c.emailSecondary}</a>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-700">
                      {[c.city, c.state].filter(Boolean).join(", ") || "-"}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button type="button" onClick={() => downloadVcard(c)}
                          className="rounded-full bg-eng-navy/10 px-2 py-0.5 text-[10px] font-semibold text-eng-navy hover:bg-eng-navy hover:text-white">
                          vCard
                        </button>
                        <button type="button" onClick={() => openLinkedin(c)}
                          className="rounded-full bg-eng-navy/10 px-2 py-0.5 text-[10px] font-semibold text-eng-navy hover:bg-eng-navy hover:text-white">
                          LinkedIn
                        </button>
                        {c.linkedin && (
                          <a href={c.linkedin} target="_blank" rel="noreferrer"
                            className="rounded-full bg-eng-navy/10 px-2 py-0.5 text-[10px] font-semibold text-eng-navy hover:bg-eng-navy hover:text-white">
                            Profile
                          </a>
                        )}
                        <button type="button" onClick={() => removeContact(c.id)}
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-gray-400 hover:text-eng-rust" aria-label="Remove">
                          x
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-gray-500">
              CSV export includes all {CSV_HEADERS.length} columns (prefix,
              first, middle, last, suffix, title, department, company,
              phones, emails, web, socials, full address, notes, addedAt).
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-eng-navy">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={"block " + (className || "")}>
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " mt-1"}
      />
    </label>
  );
}
