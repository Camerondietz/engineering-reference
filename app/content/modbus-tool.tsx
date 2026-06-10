"use client";

// app/content/modbus-tool.tsx
//
// Modbus reference & decoder: address translator (Modicon convention
// ↔ raw register), function code reference, and a register value
// decoder that interprets one or two registers as int16, uint16,
// int32, uint32, or IEEE-754 float, with selectable word & byte order.

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// Address translator
// ============================================================

type Table = "coil" | "discrete" | "input" | "holding";

const TABLES: { id: Table; label: string; piPrefix: string; piRange: [number, number]; rawHint: string }[] = [
  { id: "coil",     label: "Coils (R/W)",            piPrefix: "0", piRange: [1, 65536], rawHint: "FC 01 read, FC 05/15 write" },
  { id: "discrete", label: "Discrete inputs (R)",    piPrefix: "1", piRange: [10001, 75536], rawHint: "FC 02 read only" },
  { id: "input",    label: "Input registers (R)",    piPrefix: "3", piRange: [30001, 95536], rawHint: "FC 04 read only" },
  { id: "holding",  label: "Holding registers (R/W)", piPrefix: "4", piRange: [40001, 105536], rawHint: "FC 03 read, FC 06/16 write" },
];

function piToRaw(table: Table, pi: number): number | null {
  const t = TABLES.find((x) => x.id === table)!;
  const base = Number(t.piPrefix) * 10000 + 1;
  // Some PLCs use 5-digit (e.g. 400001) — handle both 5- and 6-digit.
  const raw = pi - base;
  if (raw < 0 || raw > 65535) return null;
  return raw;
}

function rawToPi(table: Table, raw: number): number {
  const t = TABLES.find((x) => x.id === table)!;
  return Number(t.piPrefix) * 10000 + 1 + raw;
}

// ============================================================
// Function codes
// ============================================================

const FCS: { code: number; name: string; description: string }[] = [
  { code: 1,  name: "Read Coils",                  description: "Read 1–2000 contiguous coil status bits." },
  { code: 2,  name: "Read Discrete Inputs",        description: "Read 1–2000 contiguous discrete input bits." },
  { code: 3,  name: "Read Holding Registers",      description: "Read 1–125 contiguous 16-bit holding registers." },
  { code: 4,  name: "Read Input Registers",        description: "Read 1–125 contiguous 16-bit input registers." },
  { code: 5,  name: "Write Single Coil",           description: "Set a single coil to ON (0xFF00) or OFF (0x0000)." },
  { code: 6,  name: "Write Single Register",       description: "Write one 16-bit holding register." },
  { code: 7,  name: "Read Exception Status",       description: "Serial only — vendor-specific status byte." },
  { code: 8,  name: "Diagnostics",                 description: "Serial only — loopback / counters." },
  { code: 11, name: "Get Comm Event Counter",      description: "Serial only." },
  { code: 12, name: "Get Comm Event Log",          description: "Serial only." },
  { code: 15, name: "Write Multiple Coils",        description: "Write 1–1968 contiguous coil bits." },
  { code: 16, name: "Write Multiple Registers",    description: "Write 1–123 contiguous holding registers." },
  { code: 17, name: "Report Server ID",            description: "Vendor-specific identifier." },
  { code: 20, name: "Read File Record",            description: "Access extended file-style memory." },
  { code: 21, name: "Write File Record",           description: "Write extended file-style memory." },
  { code: 22, name: "Mask Write Register",         description: "Apply AND / OR masks to a single register." },
  { code: 23, name: "Read/Write Multiple Registers", description: "Atomic read-then-write." },
  { code: 24, name: "Read FIFO Queue",             description: "Read a FIFO of 16-bit values." },
  { code: 43, name: "Encapsulated Interface (MEI)", description: "Device identification (sub-code 14)." },
];

// Exception codes
const EXCEPTIONS: { code: number; name: string; meaning: string }[] = [
  { code: 0x01, name: "Illegal Function",            meaning: "Function code not supported by the server." },
  { code: 0x02, name: "Illegal Data Address",        meaning: "Address (or address+count) is not allowed." },
  { code: 0x03, name: "Illegal Data Value",          meaning: "Value in the request data field is out of range." },
  { code: 0x04, name: "Server Device Failure",       meaning: "Unrecoverable error during request execution." },
  { code: 0x05, name: "Acknowledge",                 meaning: "Request accepted, processing will take a long time." },
  { code: 0x06, name: "Server Device Busy",          meaning: "Server is busy processing a long-duration command." },
  { code: 0x08, name: "Memory Parity Error",         meaning: "Server detected a parity error reading memory." },
  { code: 0x0A, name: "Gateway Path Unavailable",    meaning: "Gateway couldn't allocate a path to forward the request." },
  { code: 0x0B, name: "Gateway Target No Response",  meaning: "No response from the downstream target device." },
];

// ============================================================
// Register decoder
// ============================================================

type WordOrder = "BE" | "LE";   // big-endian = high word first (Modbus default for 32-bit)
type ByteOrder = "BE" | "LE";   // big-endian = high byte first within a word (Modbus default)

function parseRegWord(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  // Hex with 0x or trailing h, otherwise decimal.
  let n: number;
  if (/^0x[0-9a-fA-F]+$/.test(t)) n = parseInt(t.slice(2), 16);
  else if (/^[0-9a-fA-F]+h$/i.test(t)) n = parseInt(t.slice(0, -1), 16);
  else if (/^-?\d+$/.test(t)) n = Number(t);
  else if (/^[0-9a-fA-F]{1,4}$/.test(t) && /[a-fA-F]/.test(t)) n = parseInt(t, 16);
  else n = Number(t);
  if (!isFinite(n)) return null;
  if (n < -32768 || n > 0xffff) return null;
  return n & 0xffff;
}

function applyByteOrder(word: number, order: ByteOrder): number {
  if (order === "BE") return word & 0xffff;
  // Swap bytes within the 16-bit word
  return (((word & 0xff) << 8) | ((word >>> 8) & 0xff)) & 0xffff;
}

function combine32(hi: number, lo: number, word: WordOrder, byte: ByteOrder): number {
  const h = applyByteOrder(hi, byte);
  const l = applyByteOrder(lo, byte);
  if (word === "BE") return ((h << 16) | l) >>> 0;
  return ((l << 16) | h) >>> 0;
}

function asInt16(u: number): number {
  return u & 0x8000 ? u - 0x10000 : u;
}
function asInt32(u: number): number {
  return u & 0x80000000 ? u - 0x100000000 : u;
}
function asFloat32(u: number): number {
  const buf = new ArrayBuffer(4);
  new Uint32Array(buf)[0] = u >>> 0;
  return new Float32Array(buf)[0];
}

// ============================================================
// Page
// ============================================================

export default function ModbusToolPage() {
  // Address translator
  const [table, setTable] = useState<Table>("holding");
  const [piAddr, setPiAddr] = useState(40001);
  const [rawAddr, setRawAddr] = useState(0);

  function onPiChange(v: number) {
    setPiAddr(v);
    const r = piToRaw(table, v);
    if (r !== null) setRawAddr(r);
  }
  function onRawChange(v: number) {
    setRawAddr(v);
    setPiAddr(rawToPi(table, v));
  }
  function onTableChange(t: Table) {
    setTable(t);
    setPiAddr(rawToPi(t, rawAddr));
  }

  // Register decoder
  const [regAStr, setRegAStr] = useState("0x4248"); // 50.0 float (hi)
  const [regBStr, setRegBStr] = useState("0x0000"); //       (lo)
  const [wordOrder, setWordOrder] = useState<WordOrder>("BE");
  const [byteOrder, setByteOrder] = useState<ByteOrder>("BE");

  const regA = parseRegWord(regAStr);
  const regB = parseRegWord(regBStr);

  const decoded = useMemo(() => {
    if (regA === null) return null;
    const a = applyByteOrder(regA, byteOrder);
    const aInt = asInt16(a);
    const aUint = a;
    let bUint: number | null = null;
    let bInt: number | null = null;
    let combined: number | null = null;
    let combinedInt: number | null = null;
    let asFloat: number | null = null;
    if (regB !== null) {
      const b = applyByteOrder(regB, byteOrder);
      bUint = b;
      bInt = asInt16(b);
      combined = combine32(regA, regB, wordOrder, byteOrder);
      combinedInt = asInt32(combined);
      asFloat = asFloat32(combined);
    }
    return { aInt, aUint, bInt, bUint, combined, combinedInt, asFloat };
  }, [regA, regB, wordOrder, byteOrder]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Modbus Reference &amp; Decoder
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Translate between the Modicon-style address (40001…) and the raw
          register number a Modbus master actually sends, look up function
          and exception codes, and decode 16- or 32-bit register payloads
          with selectable word &amp; byte order.
        </p>
      </header>

      {/* Address translator */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Address translator</h2>
        <p className="mt-1 text-sm text-gray-500">
          Modbus addresses are <strong>0-based</strong> on the wire but
          conventionally written 1-based with a table prefix (0xxxx, 1xxxx,
          3xxxx, 4xxxx).
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {TABLES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTableChange(t.id)}
              className={
                "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
                (table === t.id
                  ? "bg-eng-navy text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Modicon (1-based, prefixed)
            </span>
            <input
              type="number"
              value={piAddr}
              onChange={(e) => onPiChange(Number(e.target.value) || 0)}
              className={inputCls + " mt-1 font-mono"}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Raw register (0-based)
            </span>
            <input
              type="number"
              min={0}
              max={65535}
              value={rawAddr}
              onChange={(e) => onRawChange(Math.max(0, Math.min(65535, Number(e.target.value) || 0)))}
              className={inputCls + " mt-1 font-mono"}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-2 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-3">
          <Stat label="Raw (dec)" value={rawAddr.toString()} />
          <Stat label="Raw (hex)" value={"0x" + rawAddr.toString(16).toUpperCase().padStart(4, "0")} />
          <Stat label="Function codes" value={TABLES.find((t) => t.id === table)!.rawHint} />
        </div>
      </section>

      {/* Function codes */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Function codes">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-2 py-1.5">FC</th>
                  <th className="px-2 py-1.5">Hex</th>
                  <th className="px-2 py-1.5">Name</th>
                </tr>
              </thead>
              <tbody>
                {FCS.map((f) => (
                  <tr key={f.code} className="border-t border-gray-100">
                    <td className="px-2 py-1.5 font-mono text-xs">{f.code}</td>
                    <td className="px-2 py-1.5 font-mono text-xs text-gray-500">
                      0x{f.code.toString(16).toUpperCase().padStart(2, "0")}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="font-semibold text-gray-800">{f.name}</div>
                      <div className="text-xs text-gray-500">{f.description}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Exception codes">
          <p className="mb-2 text-xs text-gray-500">
            A server returns the function code OR&rsquo;d with 0x80 plus one
            of these exception bytes.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-2 py-1.5">Code</th>
                  <th className="px-2 py-1.5">Name</th>
                </tr>
              </thead>
              <tbody>
                {EXCEPTIONS.map((x) => (
                  <tr key={x.code} className="border-t border-gray-100">
                    <td className="px-2 py-1.5 font-mono text-xs">
                      0x{x.code.toString(16).toUpperCase().padStart(2, "0")}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="font-semibold text-gray-800">{x.name}</div>
                      <div className="text-xs text-gray-500">{x.meaning}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Register decoder */}
      <section className="mt-6">
        <Card title="Register value decoder">
          <p className="mb-3 text-sm text-gray-500">
            Enter one or two 16-bit register values (decimal, or hex with{" "}
            <code>0x</code> prefix). Toggle word and byte order to match
            how your PLC packs 32-bit values.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Register A (high word)
              </span>
              <input
                value={regAStr}
                onChange={(e) => setRegAStr(e.target.value)}
                placeholder="0x4248 or 16968"
                className={inputCls + " mt-1 font-mono"}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Register B (low word) — optional for 32-bit
              </span>
              <input
                value={regBStr}
                onChange={(e) => setRegBStr(e.target.value)}
                placeholder="0x0000"
                className={inputCls + " mt-1 font-mono"}
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Word order
              </span>
              <Seg active={wordOrder === "BE"} onClick={() => setWordOrder("BE")}>
                Big-endian (ABCD, default)
              </Seg>
              <Seg active={wordOrder === "LE"} onClick={() => setWordOrder("LE")}>
                Little-endian (CDAB)
              </Seg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Byte order
              </span>
              <Seg active={byteOrder === "BE"} onClick={() => setByteOrder("BE")}>
                BE (default)
              </Seg>
              <Seg active={byteOrder === "LE"} onClick={() => setByteOrder("LE")}>
                LE (byte-swap)
              </Seg>
            </div>
          </div>

          {decoded && (
            <div className="mt-5 grid gap-2 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
              <Stat label="A as UINT16" value={decoded.aUint.toString()} />
              <Stat label="A as INT16" value={decoded.aInt.toString()} />
              <Stat label="A in hex" value={"0x" + decoded.aUint.toString(16).toUpperCase().padStart(4, "0")} />
              <Stat label="A in binary" value={decoded.aUint.toString(2).padStart(16, "0").replace(/(.{4})/g, "$1 ").trim()} />
              {regB !== null && decoded.combined !== null && (
                <>
                  <Stat label="B as UINT16" value={decoded.bUint!.toString()} />
                  <Stat label="B as INT16" value={decoded.bInt!.toString()} />
                  <Stat label="Combined UINT32" value={decoded.combined.toString()} highlight />
                  <Stat label="Combined INT32" value={decoded.combinedInt!.toString()} highlight />
                  <Stat label="Combined hex" value={"0x" + decoded.combined.toString(16).toUpperCase().padStart(8, "0")} />
                  <Stat label="IEEE-754 float" value={isFinite(decoded.asFloat!) ? decoded.asFloat!.toPrecision(8) : "NaN/Inf"} highlight />
                </>
              )}
            </div>
          )}

          <details className="mt-4 rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-600">
            <summary className="cursor-pointer font-semibold text-gray-700">
              Word / byte order cheat sheet
            </summary>
            <ul className="mt-2 list-disc pl-5">
              <li><strong>ABCD</strong> (word BE, byte BE) — Modbus standard for 32-bit values.</li>
              <li><strong>CDAB</strong> (word LE, byte BE) — common in older Schneider PLCs.</li>
              <li><strong>BADC</strong> (word BE, byte LE) — byte-swap within each word.</li>
              <li><strong>DCBA</strong> (word LE, byte LE) — full little-endian.</li>
            </ul>
          </details>
        </Card>
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

function Seg({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-3 py-1 text-xs font-semibold transition " +
        (active
          ? "bg-eng-navy text-white shadow-sm"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200")
      }
    >
      {children}
    </button>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between gap-3 rounded-lg px-3 py-2 " +
        (highlight ? "bg-eng-navy text-white" : "bg-white")
      }
    >
      <span className={"text-xs font-semibold uppercase tracking-wide " + (highlight ? "text-white/70" : "text-gray-500")}>
        {label}
      </span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
