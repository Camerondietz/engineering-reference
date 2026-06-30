"use client";

// app/content/business-card-tool.tsx
//
// Capture business cards via the camera (or upload), fill in the
// fields, and build up a running list. Each card can be downloaded
// as a vCard or used to open a LinkedIn search. The list exports as
// CSV (download or clipboard).

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

// ============================================================
// Types
// ============================================================

interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  address: string;
  notes: string;
  addedAt: string; // ISO date
}

const EMPTY: Contact = {
  id: "",
  name: "",
  title: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  linkedin: "",
  address: "",
  notes: "",
  addedAt: "",
};

const STORAGE_KEY = "engref:business-card-tool:v1";
const uid = () => Math.random().toString(36).slice(2, 9);

// ============================================================
// vCard + CSV
// ============================================================

function escapeVcard(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\r?\n/g, "\\n");
}

function toVcard(c: Contact): string {
  const nameParts = c.name.trim().split(/\s+/);
  const first = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] || "";
  const last = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:" + escapeVcard(c.name),
    "N:" + escapeVcard(last) + ";" + escapeVcard(first) + ";;;",
  ];
  if (c.company) lines.push("ORG:" + escapeVcard(c.company));
  if (c.title) lines.push("TITLE:" + escapeVcard(c.title));
  if (c.phone) lines.push("TEL;TYPE=WORK,VOICE:" + escapeVcard(c.phone));
  if (c.email) lines.push("EMAIL;TYPE=WORK:" + escapeVcard(c.email));
  if (c.website) lines.push("URL:" + escapeVcard(c.website));
  if (c.linkedin) lines.push("URL;TYPE=linkedin:" + escapeVcard(c.linkedin));
  if (c.address) lines.push("ADR;TYPE=WORK:;;" + escapeVcard(c.address) + ";;;;");
  if (c.notes) lines.push("NOTE:" + escapeVcard(c.notes));
  if (c.addedAt) lines.push("REV:" + c.addedAt);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

const CSV_HEADERS: (keyof Contact)[] = [
  "name", "title", "company", "phone", "email",
  "website", "linkedin", "address", "notes", "addedAt",
];

function csvEscape(v: string): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function toCsv(rows: Contact[]): string {
  const header = CSV_HEADERS.map((h) => csvEscape(h)).join(",");
  const lines = rows.map((r) =>
    CSV_HEADERS.map((h) => csvEscape(r[h])).join(","),
  );
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

function linkedinSearchUrl(c: Pick<Contact, "name" | "company">): string {
  const q = [c.name, c.company].filter(Boolean).join(" ");
  return "https://www.linkedin.com/search/results/people/?keywords=" + encodeURIComponent(q);
}

// ============================================================
// Page
// ============================================================

export default function BusinessCardToolPage() {
  const [draft, setDraft] = useState<Contact>({ ...EMPTY });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [mounted, setMounted] = useState(false);

  // Camera
  const [photo, setPhoto] = useState<string | null>(null); // data URL of captured photo
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate from localStorage
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch { /* */ }
  }, [contacts, mounted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
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
      // Attach to video element next paint
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
    setPhoto(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
  }
  function retake() {
    setPhoto(null);
    startCamera();
  }
  function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(f);
  }

  function patchDraft(p: Partial<Contact>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function addContact() {
    if (!draft.name.trim() && !draft.email.trim() && !draft.phone.trim()) {
      alert("Add at least a name, email, or phone.");
      return;
    }
    const c: Contact = {
      ...draft,
      id: uid(),
      addedAt: new Date().toISOString(),
    };
    setContacts((cs) => [...cs, c]);
    setDraft({ ...EMPTY });
    setPhoto(null);
  }

  function downloadVcard(c: Contact) {
    const blob = new Blob([toVcard(c)], { type: "text/vcard;charset=utf-8" });
    const safe = c.name.replace(/[^\w\-]+/g, "_") || "contact";
    downloadBlob(blob, safe + ".vcf");
  }

  function openLinkedin(c: Pick<Contact, "name" | "company">) {
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
          Take a photo of a card for reference, fill in the contact
          fields, and build a running list. Each card can be saved as a
          vCard or used to open a LinkedIn search. The full list exports
          as CSV. Everything stays in your browser.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* ====================================================
            CAPTURE
            ==================================================== */}
        <Card title="1. Capture">
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-900 aspect-[4/3]">
            {photo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={photo} alt="Captured" className="absolute inset-0 h-full w-full object-contain" />
            ) : cameraOn ? (
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-300">
                {cameraError
                  ? cameraError
                  : "Click Start camera, or upload a photo."}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {!cameraOn && !photo && (
              <button
                type="button"
                onClick={startCamera}
                className="rounded-full bg-eng-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-eng-blue"
              >
                Start camera
              </button>
            )}
            {cameraOn && (
              <>
                <button
                  type="button"
                  onClick={snap}
                  className="rounded-full bg-eng-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-eng-blue"
                >
                  Snap photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 hover:border-eng-rust hover:text-eng-rust"
                >
                  Stop
                </button>
              </>
            )}
            {photo && (
              <button
                type="button"
                onClick={retake}
                className="rounded-full bg-eng-navy/10 px-4 py-1.5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
              >
                Retake
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-eng-navy/10 px-4 py-1.5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
            >
              Upload photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onUpload}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-[11px] text-gray-500">
            On a phone, "Upload photo" usually opens the camera directly.
            The photo is only kept in this session — it isn&rsquo;t saved
            to your device or uploaded anywhere.
          </p>
        </Card>

        {/* ====================================================
            FORM
            ==================================================== */}
        <Card title="2. Card details">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" value={draft.name} onChange={(v) => patchDraft({ name: v })} placeholder="Jane Doe" />
            <Field label="Title" value={draft.title} onChange={(v) => patchDraft({ title: v })} placeholder="Engineering Manager" />
            <Field label="Company" value={draft.company} onChange={(v) => patchDraft({ company: v })} className="sm:col-span-2" placeholder="Acme Industrial" />
            <Field label="Phone" value={draft.phone} onChange={(v) => patchDraft({ phone: v })} placeholder="+1 555 555 0100" />
            <Field label="Email" value={draft.email} onChange={(v) => patchDraft({ email: v })} placeholder="jane@acme.com" />
            <Field label="Website" value={draft.website} onChange={(v) => patchDraft({ website: v })} placeholder="https://acme.com" />
            <Field label="LinkedIn URL" value={draft.linkedin} onChange={(v) => patchDraft({ linkedin: v })} placeholder="https://linkedin.com/in/..." />
            <Field label="Address" value={draft.address} onChange={(v) => patchDraft({ address: v })} className="sm:col-span-2" placeholder="123 Main St, Austin TX 78701" />
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Notes
              </span>
              <textarea
                value={draft.notes}
                onChange={(e) => patchDraft({ notes: e.target.value })}
                rows={2}
                placeholder="Met at conference, follow up re: PLC upgrade..."
                className={inputCls + " mt-1"}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addContact}
              className="rounded-full bg-eng-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-eng-blue"
            >
              Add to list
            </button>
            <button
              type="button"
              onClick={() => {
                const tmp: Contact = { ...draft, id: "tmp", addedAt: new Date().toISOString() };
                downloadVcard(tmp);
              }}
              disabled={!draft.name && !draft.email && !draft.phone}
              className="rounded-full bg-eng-navy/10 px-4 py-1.5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              Download vCard
            </button>
            <button
              type="button"
              onClick={() => openLinkedin(draft)}
              disabled={!draft.name}
              className="rounded-full bg-eng-navy/10 px-4 py-1.5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              Search on LinkedIn
            </button>
            <button
              type="button"
              onClick={() => { setDraft({ ...EMPTY }); setPhoto(null); }}
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
            <button
              type="button"
              onClick={copyCsv}
              disabled={contacts.length === 0}
              className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              Copy CSV
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={contacts.length === 0}
              className="rounded-full bg-eng-navy px-3 py-1 text-xs font-semibold text-white hover:bg-eng-blue disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Download CSV
            </button>
            <button
              type="button"
              onClick={downloadAllVcards}
              disabled={contacts.length === 0}
              className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              Download all vCards
            </button>
            <button
              type="button"
              onClick={clearList}
              disabled={contacts.length === 0}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-500 hover:border-eng-rust hover:text-eng-rust disabled:cursor-not-allowed"
            >
              Clear list
            </button>
          </div>
        </div>

        {contacts.length === 0 ? (
          <p className="mt-4 rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
            No cards yet. Capture or upload a photo, fill in the details
            above, and click "Add to list."
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Title</th>
                  <th className="px-2 py-2">Company</th>
                  <th className="px-2 py-2">Phone</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 align-top">
                    <td className="px-2 py-2 font-semibold text-gray-900">{c.name || "-"}</td>
                    <td className="px-2 py-2 text-gray-700">{c.title || "-"}</td>
                    <td className="px-2 py-2 text-gray-700">{c.company || "-"}</td>
                    <td className="px-2 py-2 font-mono text-xs text-gray-700">
                      {c.phone ? (
                        <a className="text-eng-navy hover:underline" href={"tel:" + c.phone.replace(/[^+\d]/g, "")}>
                          {c.phone}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-gray-700">
                      {c.email ? (
                        <a className="text-eng-navy hover:underline" href={"mailto:" + c.email}>
                          {c.email}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => downloadVcard(c)}
                          className="rounded-full bg-eng-navy/10 px-2 py-0.5 text-[10px] font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
                        >
                          vCard
                        </button>
                        <button
                          type="button"
                          onClick={() => openLinkedin(c)}
                          className="rounded-full bg-eng-navy/10 px-2 py-0.5 text-[10px] font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
                        >
                          LinkedIn
                        </button>
                        {c.linkedin && (
                          <a
                            href={c.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-eng-navy/10 px-2 py-0.5 text-[10px] font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
                          >
                            Profile
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => removeContact(c.id)}
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-gray-400 hover:text-eng-rust"
                          aria-label="Remove"
                        >
                          x
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
