"use client";

// app/content/qr-tool.tsx
//
// QR code generator — encodes any text or URL into a standard QR code
// per ISO/IEC 18004. Pure client-side: builds the matrix in the
// browser using a compact Reed-Solomon + masking implementation
// adapted from Project Nayuki's public-domain reference (byte mode).

import { useMemo, useState, useEffect, useRef, type ReactNode } from "react";

// ============================================================
// QR ENCODER — based on Project Nayuki's QR code generator
// (public domain). Trimmed to byte mode for general text/URLs.
// ============================================================

// Error-correction level indices
const ECL = { L: 0, M: 1, Q: 2, H: 3 } as const;
type EcLevel = keyof typeof ECL;
const ECL_FORMAT = [1, 0, 3, 2]; // L=01, M=00, Q=11, H=10

// Number of ECC codewords per block, indexed [ecLevel][version]
// (index 0 of the inner array is a sentinel)
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  // L
  [-1,  7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 28, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  // M
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  // Q
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  // H
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];

// Number of error correction blocks, indexed [ecLevel][version]
const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  // L
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25, 25],
  // M
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  // Q
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  // H
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

const MIN_VERSION = 1;
const MAX_VERSION = 40;
const PENALTY_N1 = 3, PENALTY_N2 = 3, PENALTY_N3 = 40, PENALTY_N4 = 10;

// --- Galois field arithmetic ---
function gfMul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = ((z << 1) ^ ((z >>> 7) * 0x11d)) & 0xff;
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function rsComputeDivisor(degree: number): Uint8Array {
  const result = new Uint8Array(degree);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return result;
}

function rsComputeRemainder(data: Uint8Array, divisor: Uint8Array): Uint8Array {
  const result = new Uint8Array(divisor.length);
  for (const b of data) {
    const factor = b ^ result[0];
    result.copyWithin(0, 1);
    result[result.length - 1] = 0;
    for (let i = 0; i < result.length; i++) {
      result[i] ^= gfMul(divisor[i], factor);
    }
  }
  return result;
}

// --- Capacity ---
function getNumRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}
function getNumDataCodewords(ver: number, ecl: EcLevel): number {
  return Math.floor(getNumRawDataModules(ver) / 8)
    - ECC_CODEWORDS_PER_BLOCK[ECL[ecl]][ver]
    * NUM_ERROR_CORRECTION_BLOCKS[ECL[ecl]][ver];
}

// --- Alignment pattern positions ---
function getAlignmentPatternPositions(ver: number): number[] {
  if (ver === 1) return [];
  const numAlign = Math.floor(ver / 7) + 2;
  const step = ver === 32
    ? 26
    : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result: number[] = [];
  for (let i = 0, pos = ver * 4 + 10; i < numAlign - 1; i++, pos -= step) {
    result.unshift(pos);
  }
  result.unshift(6);
  return result;
}

// --- Bit buffer ---
class BitBuffer {
  bits: number[] = [];
  appendBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) this.bits.push((val >>> i) & 1);
  }
}

// ============================================================
// Build the QR matrix
// ============================================================

type Mat = boolean[][];

function newMatrix(size: number, fill = false): Mat {
  const m: Mat = [];
  for (let i = 0; i < size; i++) m.push(new Array(size).fill(fill));
  return m;
}
function setFunctionModule(matrix: Mat, isFunc: Mat, x: number, y: number, on: boolean) {
  matrix[y][x] = on;
  isFunc[y][x] = true;
}

function drawFinderPattern(matrix: Mat, isFunc: Mat, x: number, y: number) {
  const size = matrix.length;
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || xx >= size || yy < 0 || yy >= size) continue;
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      setFunctionModule(matrix, isFunc, xx, yy, dist !== 2 && dist !== 4);
    }
  }
}
function drawAlignmentPattern(matrix: Mat, isFunc: Mat, x: number, y: number) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      setFunctionModule(matrix, isFunc, x + dx, y + dy, dist !== 1);
    }
  }
}

function drawFunctionPatterns(matrix: Mat, isFunc: Mat, ver: number) {
  const size = matrix.length;
  // Timing
  for (let i = 0; i < size; i++) {
    setFunctionModule(matrix, isFunc, 6, i, i % 2 === 0);
    setFunctionModule(matrix, isFunc, i, 6, i % 2 === 0);
  }
  // Finder patterns (with separators)
  drawFinderPattern(matrix, isFunc, 3, 3);
  drawFinderPattern(matrix, isFunc, size - 4, 3);
  drawFinderPattern(matrix, isFunc, 3, size - 4);
  // Alignment patterns
  const aps = getAlignmentPatternPositions(ver);
  const n = aps.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // Skip overlap with finder patterns
      if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
      drawAlignmentPattern(matrix, isFunc, aps[i], aps[j]);
    }
  }
  // Reserve format info (drawn separately with chosen mask)
  drawFormatBits(matrix, isFunc, "L", 0); // placeholder; overwritten later
  // Version info (ver >= 7)
  drawVersionBits(matrix, isFunc, ver);
}

function calcFormatBits(ecl: EcLevel, mask: number): number {
  const data = (ECL_FORMAT[ECL[ecl]] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  return bits & 0x7fff;
}

function drawFormatBits(matrix: Mat, isFunc: Mat, ecl: EcLevel, mask: number) {
  const size = matrix.length;
  const bits = calcFormatBits(ecl, mask);
  // First copy
  for (let i = 0; i <= 5; i++) setFunctionModule(matrix, isFunc, 8, i, ((bits >>> i) & 1) !== 0);
  setFunctionModule(matrix, isFunc, 8, 7, ((bits >>> 6) & 1) !== 0);
  setFunctionModule(matrix, isFunc, 8, 8, ((bits >>> 7) & 1) !== 0);
  setFunctionModule(matrix, isFunc, 7, 8, ((bits >>> 8) & 1) !== 0);
  for (let i = 9; i < 15; i++) setFunctionModule(matrix, isFunc, 14 - i, 8, ((bits >>> i) & 1) !== 0);
  // Second copy
  for (let i = 0; i < 8; i++) setFunctionModule(matrix, isFunc, size - 1 - i, 8, ((bits >>> i) & 1) !== 0);
  for (let i = 8; i < 15; i++) setFunctionModule(matrix, isFunc, 8, size - 15 + i, ((bits >>> i) & 1) !== 0);
  setFunctionModule(matrix, isFunc, 8, size - 8, true); // dark module
}

function drawVersionBits(matrix: Mat, isFunc: Mat, ver: number) {
  if (ver < 7) return;
  let rem = ver;
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  const bits = (ver << 12) | rem;
  const size = matrix.length;
  for (let i = 0; i < 18; i++) {
    const bit = ((bits >>> i) & 1) !== 0;
    const a = size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    setFunctionModule(matrix, isFunc, a, b, bit);
    setFunctionModule(matrix, isFunc, b, a, bit);
  }
}

function drawCodewords(matrix: Mat, isFunc: Mat, data: Uint8Array) {
  const size = matrix.length;
  let i = 0; // bit index
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunc[y][x] && i < data.length * 8) {
          matrix[y][x] = ((data[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
          i++;
        }
      }
    }
  }
}

function applyMask(matrix: Mat, isFunc: Mat, mask: number) {
  const size = matrix.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFunc[y][x]) continue;
      let invert = false;
      switch (mask) {
        case 0: invert = (x + y) % 2 === 0; break;
        case 1: invert = y % 2 === 0; break;
        case 2: invert = x % 3 === 0; break;
        case 3: invert = (x + y) % 3 === 0; break;
        case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
        case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
        case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
        case 7: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
      }
      if (invert) matrix[y][x] = !matrix[y][x];
    }
  }
}

function getPenalty(matrix: Mat): number {
  const size = matrix.length;
  let result = 0;
  // N1: runs of 5+ same modules per row & column
  for (let y = 0; y < size; y++) {
    let runColor = false, runLen = 0;
    for (let x = 0; x < size; x++) {
      if (matrix[y][x] === runColor) {
        runLen++;
        if (runLen === 5) result += PENALTY_N1;
        else if (runLen > 5) result++;
      } else { runColor = matrix[y][x]; runLen = 1; }
    }
  }
  for (let x = 0; x < size; x++) {
    let runColor = false, runLen = 0;
    for (let y = 0; y < size; y++) {
      if (matrix[y][x] === runColor) {
        runLen++;
        if (runLen === 5) result += PENALTY_N1;
        else if (runLen > 5) result++;
      } else { runColor = matrix[y][x]; runLen = 1; }
    }
  }
  // N2: 2×2 blocks
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const c = matrix[y][x];
      if (c === matrix[y][x + 1] && c === matrix[y + 1][x] && c === matrix[y + 1][x + 1]) {
        result += PENALTY_N2;
      }
    }
  }
  // N3: finder-like 1:1:3:1:1 pattern
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size - 10; x++) {
      const r = matrix[y];
      if (
        r[x] && !r[x + 1] && r[x + 2] && r[x + 3] && r[x + 4] && !r[x + 5] && r[x + 6] &&
        ((x >= 4 && !r[x - 1] && !r[x - 2] && !r[x - 3] && !r[x - 4]) ||
         (x <= size - 11 && !r[x + 7] && !r[x + 8] && !r[x + 9] && !r[x + 10]))
      ) result += PENALTY_N3;
    }
  }
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size - 10; y++) {
      const col = (yy: number) => matrix[yy][x];
      if (
        col(y) && !col(y + 1) && col(y + 2) && col(y + 3) && col(y + 4) && !col(y + 5) && col(y + 6) &&
        ((y >= 4 && !col(y - 1) && !col(y - 2) && !col(y - 3) && !col(y - 4)) ||
         (y <= size - 11 && !col(y + 7) && !col(y + 8) && !col(y + 9) && !col(y + 10)))
      ) result += PENALTY_N3;
    }
  }
  // N4: dark module ratio
  let dark = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (matrix[y][x]) dark++;
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  result += k * PENALTY_N4;
  return result;
}

function addEccAndInterleave(data: Uint8Array, ver: number, ecl: EcLevel): Uint8Array {
  if (data.length !== getNumDataCodewords(ver, ecl)) throw new Error("data length mismatch");
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ECL[ecl]][ver];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ECL[ecl]][ver];
  const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);
  const divisor = rsComputeDivisor(blockEccLen);

  const blocks: Uint8Array[] = [];
  let k = 0;
  for (let i = 0; i < numBlocks; i++) {
    const datLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
    const dat = data.slice(k, k + datLen);
    k += datLen;
    const ecc = rsComputeRemainder(dat, divisor);
    const block = new Uint8Array(shortBlockLen + 1);
    block.set(dat, 0);
    if (i < numShortBlocks) {
      // leave gap at position datLen for short blocks
      block.set(ecc, dat.length + 1);
      // We'll handle the gap during interleaving.
    } else {
      block.set(ecc, dat.length);
    }
    blocks.push(block);
  }

  // Interleave
  const result: number[] = [];
  for (let i = 0; i < shortBlockLen + 1; i++) {
    for (let j = 0; j < numBlocks; j++) {
      // For short blocks, skip the gap at the last data codeword position.
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
        result.push(blocks[j][i]);
      }
    }
  }
  return new Uint8Array(result);
}

function encodeByteMode(data: Uint8Array, ecl: EcLevel): { matrix: Mat; ver: number; mask: number } {
  // Find smallest version that fits.
  let ver = MIN_VERSION;
  for (; ver <= MAX_VERSION; ver++) {
    const capBits = getNumDataCodewords(ver, ecl) * 8;
    const cci = ver < 10 ? 8 : 16;
    const needed = 4 + cci + 8 * data.length;
    if (needed <= capBits) break;
  }
  if (ver > MAX_VERSION) throw new Error("Data too long for QR code");

  // Build bit stream
  const bb = new BitBuffer();
  bb.appendBits(0b0100, 4); // byte mode
  bb.appendBits(data.length, ver < 10 ? 8 : 16);
  for (const b of data) bb.appendBits(b, 8);

  const capBits = getNumDataCodewords(ver, ecl) * 8;
  bb.appendBits(0, Math.min(4, capBits - bb.bits.length));
  bb.appendBits(0, (8 - (bb.bits.length % 8)) % 8);
  for (let pad = 0xec; bb.bits.length < capBits; pad ^= 0xec ^ 0x11) {
    bb.appendBits(pad, 8);
  }

  const codewords = new Uint8Array(bb.bits.length / 8);
  for (let i = 0; i < bb.bits.length; i++) {
    codewords[i >>> 3] |= bb.bits[i] << (7 - (i & 7));
  }

  const allCodewords = addEccAndInterleave(codewords, ver, ecl);

  const size = ver * 4 + 17;
  const matrix = newMatrix(size);
  const isFunc = newMatrix(size);
  drawFunctionPatterns(matrix, isFunc, ver);
  drawCodewords(matrix, isFunc, allCodewords);

  // Pick best mask
  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let m = 0; m < 8; m++) {
    applyMask(matrix, isFunc, m);
    drawFormatBits(matrix, isFunc, ecl, m);
    const p = getPenalty(matrix);
    if (p < bestPenalty) { bestPenalty = p; bestMask = m; }
    applyMask(matrix, isFunc, m); // un-apply (XOR twice)
  }
  applyMask(matrix, isFunc, bestMask);
  drawFormatBits(matrix, isFunc, ecl, bestMask);

  return { matrix, ver, mask: bestMask };
}

function encodeText(text: string, ecl: EcLevel) {
  return encodeByteMode(new TextEncoder().encode(text), ecl);
}

// ============================================================
// SVG rendering
// ============================================================

function matrixToSvgPath(matrix: Mat): string {
  let path = "";
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x]) path += `M${x} ${y}h1v1h-1z`;
    }
  }
  return path;
}

// ============================================================
// Page
// ============================================================

const PRESETS: { label: string; build: () => string }[] = [
  { label: "URL", build: () => "https://example.com" },
  { label: "Email", build: () => "mailto:hello@example.com?subject=Hello" },
  { label: "Phone", build: () => "tel:+15555550100" },
  { label: "SMS", build: () => "sms:+15555550100?body=Hi" },
  { label: "Wi-Fi", build: () => "WIFI:T:WPA;S:MyNetwork;P:secret123;;" },
  { label: "Plant location", build: () => "geo:30.2672,-97.7431?q=Asset+Tag+12345" },
  { label: "vCard", build: () =>
    "BEGIN:VCARD\nVERSION:3.0\nN:Doe;Jane;;;\nFN:Jane Doe\nORG:Engineering\nTEL:+15555550100\nEMAIL:jane@example.com\nEND:VCARD" },
];

export default function QrToolPage() {
  const [text, setText] = useState("https://example.com");
  const [ecl, setEcl] = useState<EcLevel>("M");
  const [scale, setScale] = useState(10);
  const [margin, setMargin] = useState(4);
  const [dark, setDark] = useState("#0F3460");
  const [light, setLight] = useState("#FFFFFF");

  const svgRef = useRef<SVGSVGElement>(null);

  const result = useMemo(() => {
    if (text.length === 0) return null;
    try {
      return encodeText(text, ecl);
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, [text, ecl]);

  const path = result && "matrix" in result ? matrixToSvgPath(result.matrix) : "";
  const size = result && "matrix" in result ? result.matrix.length : 0;
  const viewBox = `${-margin} ${-margin} ${size + margin * 2} ${size + margin * 2}`;
  const pixelSize = (size + margin * 2) * scale;

  function downloadSvg() {
    if (!result || !("matrix" in result)) return;
    const svgText = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" shape-rendering="crispEdges"><rect x="${-margin}" y="${-margin}" width="${size + margin * 2}" height="${size + margin * 2}" fill="${light}"/><path d="${path}" fill="${dark}"/></svg>`;
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPng() {
    if (!result || !("matrix" in result) || !svgRef.current) return;
    const svgEl = svgRef.current;
    const xml = new XMLSerializer().serializeToString(svgEl);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelSize;
      canvas.height = pixelSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "qrcode.png";
        a.click();
        URL.revokeObjectURL(url);
      });
    };
    img.src = "data:image/svg+xml;base64," + svg64;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          QR Code Generator
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Generate scannable QR codes for URLs, asset tags, Wi-Fi creds,
          contacts, or any text. Pure client-side — your data never
          leaves the browser.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Inputs */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Content
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setText(p.build())}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Error correction level
              </span>
              <select
                value={ecl}
                onChange={(e) => setEcl(e.target.value as EcLevel)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-eng-navy focus:outline-none"
              >
                <option value="L">L — Low (~7% recovery)</option>
                <option value="M">M — Medium (~15%) [recommended]</option>
                <option value="Q">Q — Quartile (~25%)</option>
                <option value="H">H — High (~30%)</option>
              </select>
            </label>
            <NumField label="Quiet-zone margin (modules)" value={margin} step="1" onChange={setMargin} />
            <NumField label="Pixels per module" value={scale} step="1" onChange={setScale} />
            <div className="grid grid-cols-2 gap-2">
              <ColorField label="Dark" value={dark} onChange={setDark} />
              <ColorField label="Light" value={light} onChange={setLight} />
            </div>
          </div>

          {result && "error" in result ? (
            <p className="mt-3 rounded-lg bg-eng-rust/10 px-3 py-2 text-sm text-eng-rust">
              {result.error}
            </p>
          ) : result && "matrix" in result ? (
            <p className="mt-3 text-xs text-gray-500">
              Version <strong className="text-eng-navy">{result.ver}</strong>{" "}
              · size {size}×{size} modules · mask pattern {result.mask}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadSvg}
              disabled={!result || "error" in result}
              className="rounded-full bg-eng-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-eng-blue disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Download SVG
            </button>
            <button
              type="button"
              onClick={downloadPng}
              disabled={!result || "error" in result}
              className="rounded-full bg-eng-navy/10 px-4 py-1.5 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              Download PNG
            </button>
          </div>
        </section>

        {/* Output */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <div className="mt-4 flex items-center justify-center rounded-xl bg-gray-100 p-6">
            {result && "matrix" in result ? (
              <svg
                ref={svgRef}
                viewBox={viewBox}
                width={Math.min(pixelSize, 320)}
                height={Math.min(pixelSize, 320)}
                shapeRendering="crispEdges"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x={-margin}
                  y={-margin}
                  width={size + margin * 2}
                  height={size + margin * 2}
                  fill={light}
                />
                <path d={path} fill={dark} />
              </svg>
            ) : (
              <p className="text-sm text-gray-500">Enter content to generate</p>
            )}
          </div>

          <details className="mt-4 rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-600">
            <summary className="cursor-pointer font-semibold text-gray-700">
              Encoding tips
            </summary>
            <ul className="mt-2 list-disc pl-5">
              <li>Pick higher EC levels (Q/H) for codes that will be printed,
                  laminated, or might get dirty (asset tags, outdoor labels).</li>
              <li>Wi-Fi format: <code>WIFI:T:WPA;S:&lt;ssid&gt;;P:&lt;password&gt;;;</code></li>
              <li>Geo format: <code>geo:lat,lng?q=label</code></li>
              <li>vCard 3.0 is supported by all modern phone cameras.</li>
              <li>Keep total content short for the smallest, cleanest code.
                  Each EC step + each extra character bumps the version up.</li>
            </ul>
          </details>
        </section>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

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
        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white p-1"
      />
    </label>
  );
}
