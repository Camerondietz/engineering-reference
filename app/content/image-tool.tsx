"use client";

// app/content/image-tool.tsx
//
// In-browser image tool. Load any image the browser can render (PNG,
// JPEG, WebP, GIF, BMP, SVG, ICO), preview it, resize, convert
// between formats, build a multi-resolution ICO (favicon), and
// generate a base64 data URI. All processing runs locally.

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

// ============================================================
// Helpers
// ============================================================

interface LoadedImage {
  url: string;        // object URL or data URL
  img: HTMLImageElement;
  fileName: string;
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
  svgText?: string;
}

function loadImageFromFile(file: File): Promise<LoadedImage> {
  return new Promise(async (resolve, reject) => {
    const isSvg = file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
    let svgText: string | undefined;
    let url: string;
    if (isSvg) {
      svgText = await file.text();
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      url = URL.createObjectURL(blob);
    } else {
      url = URL.createObjectURL(file);
    }
    const img = new Image();
    img.onload = () => {
      resolve({
        url,
        img,
        fileName: file.name,
        fileType: file.type || (isSvg ? "image/svg+xml" : "unknown"),
        fileSize: file.size,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        svgText,
      });
    };
    img.onerror = () => reject(new Error("Could not load that file as an image."));
    img.src = url;
  });
}

function drawTo(canvas: HTMLCanvasElement, img: HTMLImageElement, w: number, h: number) {
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Conversion failed"))),
      mime,
      quality,
    );
  });
}

function formatBytes(n: number): string {
  if (!isFinite(n)) return "-";
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(2) + " MB";
}

// --- ICO encoder (PNG-in-ICO; widely supported by browsers / OSes) ---
async function buildIco(img: HTMLImageElement, sizes: number[]): Promise<Blob> {
  const usableSizes = [...new Set(sizes.filter((s) => s > 0 && s <= 256))].sort((a, b) => a - b);
  if (usableSizes.length === 0) throw new Error("Pick at least one ICO size");

  const pngs: Uint8Array[] = [];
  const canvas = document.createElement("canvas");
  for (const s of usableSizes) {
    drawTo(canvas, img, s, s);
    const blob = await canvasToBlob(canvas, "image/png");
    const buf = await blob.arrayBuffer();
    pngs.push(new Uint8Array(buf));
  }

  const HEADER = 6;
  const ENTRY = 16;
  const dirSize = HEADER + ENTRY * usableSizes.length;
  const total = dirSize + pngs.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  const dv = new DataView(out.buffer);
  // ICONDIR
  dv.setUint16(0, 0, true);                 // reserved
  dv.setUint16(2, 1, true);                 // type = 1 (icon)
  dv.setUint16(4, usableSizes.length, true); // count

  let offset = dirSize;
  for (let i = 0; i < usableSizes.length; i++) {
    const eo = HEADER + i * ENTRY;
    const s = usableSizes[i];
    dv.setUint8(eo + 0, s >= 256 ? 0 : s);   // width  (0 = 256)
    dv.setUint8(eo + 1, s >= 256 ? 0 : s);   // height (0 = 256)
    dv.setUint8(eo + 2, 0);                   // palette count
    dv.setUint8(eo + 3, 0);                   // reserved
    dv.setUint16(eo + 4, 1, true);            // color planes
    dv.setUint16(eo + 6, 32, true);           // bits per pixel
    dv.setUint32(eo + 8, pngs[i].length, true); // bytes in image
    dv.setUint32(eo + 12, offset, true);      // offset
    out.set(pngs[i], offset);
    offset += pngs[i].length;
  }
  return new Blob([out], { type: "image/vnd.microsoft.icon" });
}

// Basic SVG minifier (whitespace, comments, redundant attributes).
function minifySvg(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/\sxmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s+\/>/g, "/>")
    .trim();
}

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

// ============================================================
// Page
// ============================================================

const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];
type OutFmt = "png" | "jpeg" | "webp" | "ico";

export default function ImageToolPage() {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert settings
  const [outFmt, setOutFmt] = useState<OutFmt>("png");
  const [outW, setOutW] = useState(256);
  const [outH, setOutH] = useState(256);
  const [lockAspect, setLockAspect] = useState(true);
  const [quality, setQuality] = useState(0.92);
  const [icoSizes, setIcoSizes] = useState<number[]>([16, 32, 48, 64, 128, 256]);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputDataUri, setOutputDataUri] = useState<string>("");

  // Drop handling
  const dropRef = useRef<HTMLLabelElement>(null);

  // Data-URI panel
  const [dataInUri, setDataInUri] = useState("");

  useEffect(() => {
    return () => {
      if (loaded?.url.startsWith("blob:")) URL.revokeObjectURL(loaded.url);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [loaded, outputUrl]);

  function syncDimsFromLoaded(li: LoadedImage) {
    setOutW(li.width);
    setOutH(li.height);
    if (outFmt === "ico") {
      const cap = Math.min(li.width, li.height, 256);
      setOutW(cap);
      setOutH(cap);
    }
  }

  async function handleFiles(files: FileList | null) {
    setError(null);
    setOutputBlob(null);
    setOutputUrl(null);
    setOutputDataUri("");
    if (!files || files.length === 0) return;
    try {
      const li = await loadImageFromFile(files[0]);
      if (loaded?.url.startsWith("blob:")) URL.revokeObjectURL(loaded.url);
      setLoaded(li);
      syncDimsFromLoaded(li);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function onWidthChange(v: number) {
    setOutW(v);
    if (lockAspect && loaded) {
      setOutH(Math.max(1, Math.round((v * loaded.height) / loaded.width)));
    }
  }
  function onHeightChange(v: number) {
    setOutH(v);
    if (lockAspect && loaded) {
      setOutW(Math.max(1, Math.round((v * loaded.width) / loaded.height)));
    }
  }
  function toggleIcoSize(s: number) {
    setIcoSizes((arr) =>
      arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s].sort((a, b) => a - b),
    );
  }

  async function convert() {
    if (!loaded) return;
    setError(null);
    try {
      let blob: Blob;
      if (outFmt === "ico") {
        blob = await buildIco(loaded.img, icoSizes);
      } else {
        const canvas = document.createElement("canvas");
        drawTo(canvas, loaded.img, outW, outH);
        const mime = outFmt === "png" ? "image/png" : outFmt === "jpeg" ? "image/jpeg" : "image/webp";
        blob = await canvasToBlob(canvas, mime, mime === "image/png" ? undefined : quality);
      }
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(blob);
      setOutputBlob(blob);
      setOutputUrl(url);
      setOutputDataUri("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function downloadOutput() {
    if (!outputBlob || !loaded) return;
    const ext = outFmt === "ico" ? "ico" : outFmt === "jpeg" ? "jpg" : outFmt;
    downloadBlob(outputBlob, baseName(loaded.fileName) + "." + ext);
  }

  async function copyDataUri() {
    if (!outputBlob) return;
    const uri = await blobToDataUri(outputBlob);
    setOutputDataUri(uri);
    try { navigator.clipboard?.writeText(uri); } catch { /* */ }
  }

  // --- SVG actions ---
  function minifyCurrentSvg() {
    if (!loaded?.svgText) return;
    const min = minifySvg(loaded.svgText);
    setLoaded({ ...loaded, svgText: min });
  }
  function copySvg() {
    if (loaded?.svgText) {
      try { navigator.clipboard?.writeText(loaded.svgText); } catch { /* */ }
    }
  }

  // --- Data URI decode ---
  const [dataPreviewUrl, setDataPreviewUrl] = useState<string>("");
  useEffect(() => {
    setDataPreviewUrl(dataInUri.trim().startsWith("data:image/") ? dataInUri.trim() : "");
  }, [dataInUri]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Image Tool
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Drop an image, resize, convert between PNG, JPEG, WebP, and a
          multi-resolution ICO (favicon). Plus SVG source view +
          minify, and image-to-data-URI converter. Everything runs
          locally in the browser.
        </p>
      </header>

      {/* Drop zone */}
      <Card title="1. Load image">
        <label
          ref={dropRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="block cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-eng-navy hover:bg-eng-navy/5"
        >
          <input
            type="file"
            accept="image/*,.svg,.ico"
            onChange={onFileChange}
            className="hidden"
          />
          <p className="text-sm font-semibold text-gray-700">
            Drop an image here or click to choose
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supports PNG, JPEG, WebP, GIF, BMP, SVG, ICO
          </p>
        </label>

        {error && (
          <p className="mt-3 rounded-lg bg-eng-rust/10 px-3 py-2 text-sm text-eng-rust">
            {error}
          </p>
        )}

        {loaded && (
          <div className="mt-4 grid gap-4 sm:grid-cols-[12rem_1fr]">
            <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-[repeating-conic-gradient(#f3f4f6_0deg_25%,#fff_25%_50%)] [background-size:16px_16px] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={loaded.url} alt="" className="max-h-44 max-w-full object-contain" />
            </div>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 self-center text-sm">
              <dt className="text-gray-500">File</dt>
              <dd className="break-all font-mono text-gray-800">{loaded.fileName}</dd>
              <dt className="text-gray-500">Type</dt>
              <dd className="font-mono text-gray-800">{loaded.fileType || "unknown"}</dd>
              <dt className="text-gray-500">Size</dt>
              <dd className="font-mono text-gray-800">{formatBytes(loaded.fileSize)}</dd>
              <dt className="text-gray-500">Dimensions</dt>
              <dd className="font-mono text-gray-800">{loaded.width} x {loaded.height} px</dd>
            </dl>
          </div>
        )}
      </Card>

      {/* Convert */}
      {loaded && (
        <Card title="2. Convert & resize">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Output format
              </span>
              <select
                value={outFmt}
                onChange={(e) => setOutFmt(e.target.value as OutFmt)}
                className={inputCls + " mt-1"}
              >
                <option value="png">PNG (lossless, transparent)</option>
                <option value="jpeg">JPEG (lossy, no alpha)</option>
                <option value="webp">WebP (lossy, supports alpha)</option>
                <option value="ico">ICO (favicon, multi-size)</option>
              </select>
            </label>

            {outFmt !== "ico" && (
              <>
                <NumField label="Width (px)" value={outW} step="1" onChange={onWidthChange} />
                <NumField label="Height (px)" value={outH} step="1" onChange={onHeightChange} />
                <label className="flex items-end gap-2 pb-1">
                  <input
                    type="checkbox"
                    checked={lockAspect}
                    onChange={(e) => setLockAspect(e.target.checked)}
                  />
                  <span className="text-xs font-medium text-gray-700">Lock aspect ratio</span>
                </label>
              </>
            )}

            {(outFmt === "jpeg" || outFmt === "webp") && (
              <label className="block sm:col-span-2 lg:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Quality ({Math.round(quality * 100)}%)
                </span>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.01}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </label>
            )}
          </div>

          {outFmt === "ico" && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Sizes (square)
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ICO_SIZES.map((s) => (
                  <label
                    key={s}
                    className={
                      "cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold " +
                      (icoSizes.includes(s)
                        ? "border-eng-navy bg-eng-navy text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-eng-navy hover:text-eng-navy")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={icoSizes.includes(s)}
                      onChange={() => toggleIcoSize(s)}
                      className="sr-only"
                    />
                    {s}x{s}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                Sizes are scaled from the source image. ICO is built with
                PNG-encoded frames (supported by all modern browsers and
                Windows).
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={convert}
              className="rounded-full bg-eng-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-eng-blue"
            >
              Convert
            </button>
            {outputBlob && (
              <>
                <button
                  type="button"
                  onClick={downloadOutput}
                  className="rounded-full bg-eng-navy/10 px-4 py-1.5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={copyDataUri}
                  className="rounded-full bg-eng-navy/10 px-4 py-1.5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
                >
                  Copy as data URI
                </button>
                <span className="self-center text-xs text-gray-500">
                  {formatBytes(outputBlob.size)}
                </span>
              </>
            )}
          </div>

          {outputUrl && (
            <div className="mt-4 grid gap-4 sm:grid-cols-[12rem_1fr]">
              <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-[repeating-conic-gradient(#f3f4f6_0deg_25%,#fff_25%_50%)] [background-size:16px_16px] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={outputUrl} alt="Output" className="max-h-44 max-w-full object-contain" />
              </div>
              <div>
                {outputDataUri && (
                  <textarea
                    readOnly
                    value={outputDataUri}
                    rows={6}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full break-all rounded-lg border border-gray-300 bg-gray-50 p-2 font-mono text-[10px] text-gray-800"
                  />
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* SVG source */}
      {loaded?.svgText !== undefined && (
        <Card title="3. SVG source">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={minifyCurrentSvg}
              className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
            >
              Minify
            </button>
            <button
              type="button"
              onClick={copySvg}
              className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
            >
              Copy source
            </button>
            <span className="self-center text-xs text-gray-500">
              {formatBytes(new Blob([loaded.svgText]).size)}
            </span>
          </div>
          <textarea
            readOnly
            value={loaded.svgText}
            rows={8}
            className="mt-3 w-full rounded-lg border border-gray-300 bg-gray-50 p-2 font-mono text-[11px] text-gray-800"
          />
        </Card>
      )}

      {/* Data URI panel */}
      <Card title="Data URI inspector">
        <p className="mb-2 text-xs text-gray-500">
          Paste a <code>data:image/...;base64,...</code> string to preview it,
          or convert a loaded image to a data URI in the Convert section above.
        </p>
        <textarea
          value={dataInUri}
          onChange={(e) => setDataInUri(e.target.value)}
          rows={4}
          placeholder="data:image/png;base64,iVBORw0KGgoAAAA..."
          className="w-full break-all rounded-lg border border-gray-300 bg-white p-2 font-mono text-[11px] text-gray-800"
        />
        {dataPreviewUrl && (
          <div className="mt-3 flex items-center justify-center rounded-xl border border-gray-200 bg-[repeating-conic-gradient(#f3f4f6_0deg_25%,#fff_25%_50%)] [background-size:16px_16px] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataPreviewUrl} alt="Decoded" className="max-h-60 max-w-full object-contain" />
          </div>
        )}
      </Card>
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
    <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function NumField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={inputCls + " mt-1 font-mono"}
      />
    </label>
  );
}
