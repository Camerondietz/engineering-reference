"use client";

// app/content/subnet-tool.tsx
//
// IPv4 subnet calculator for industrial / OT networking. Accepts
// CIDR or dotted netmask, shows network / broadcast / first / last
// host, wildcard, hex, host count, and a quick subnet split planner.

import { useMemo, useState, type ReactNode } from "react";

// ============================================================
// IP helpers
// ============================================================

function parseIp(s: string): number | null {
  const m = s.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  let v = 0;
  for (let i = 1; i <= 4; i++) {
    const o = Number(m[i]);
    if (o < 0 || o > 255) return null;
    v = (v << 8) | o;
  }
  return v >>> 0;
}
function formatIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join(".");
}
function maskFromCidr(c: number): number {
  if (c === 0) return 0;
  if (c >= 32) return 0xffffffff;
  return (0xffffffff << (32 - c)) >>> 0;
}
function cidrFromMask(m: number): number | null {
  let cidr = 0;
  let started = false;
  let zeros = 0;
  for (let i = 31; i >= 0; i--) {
    const bit = (m >>> i) & 1;
    if (bit) {
      if (zeros > 0) return null; // discontiguous
      cidr++;
    } else {
      zeros++;
    }
  }
  return cidr;
}
function ipClass(n: number): string {
  const first = (n >>> 24) & 0xff;
  if (first < 128) return "A";
  if (first < 192) return "B";
  if (first < 224) return "C";
  if (first < 240) return "D (multicast)";
  return "E (reserved)";
}
function isPrivate(n: number): boolean {
  const a = (n >>> 24) & 0xff;
  const b = (n >>> 16) & 0xff;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}
function isLoopback(n: number): boolean {
  return ((n >>> 24) & 0xff) === 127;
}
function isLinkLocal(n: number): boolean {
  return ((n >>> 24) & 0xff) === 169 && ((n >>> 16) & 0xff) === 254;
}
function toBinary(n: number): string {
  const s = n.toString(2).padStart(32, "0");
  return `${s.slice(0, 8)}.${s.slice(8, 16)}.${s.slice(16, 24)}.${s.slice(24)}`;
}
function toHex(n: number): string {
  return "0x" + n.toString(16).toUpperCase().padStart(8, "0");
}

// ============================================================
// Page
// ============================================================

export default function SubnetToolPage() {
  const [ip, setIp] = useState("192.168.1.100");
  const [cidr, setCidr] = useState(24);
  const [maskInput, setMaskInput] = useState("255.255.255.0");
  const [splitInto, setSplitInto] = useState(4);

  const ipNum = parseIp(ip);
  const mask = maskFromCidr(cidr);
  const wildcard = (~mask) >>> 0;
  const network = ipNum !== null ? (ipNum & mask) >>> 0 : null;
  const broadcast = network !== null ? (network | wildcard) >>> 0 : null;
  const totalAddresses = cidr === 32 ? 1 : Math.pow(2, 32 - cidr);
  const usableHosts =
    cidr === 32 ? 1 : cidr === 31 ? 2 : Math.max(0, totalAddresses - 2);
  const firstHost = network !== null && cidr < 31 ? (network + 1) >>> 0 : network;
  const lastHost =
    broadcast !== null && cidr < 31 ? (broadcast - 1) >>> 0 : broadcast;

  // Sync mask field when CIDR changes.
  useMemo(() => setMaskInput(formatIp(mask)), [mask]);

  function applyMaskInput() {
    const m = parseIp(maskInput);
    if (m === null) return;
    const c = cidrFromMask(m);
    if (c !== null) setCidr(c);
  }

  // Split planner
  const splitBits = Math.ceil(Math.log2(Math.max(1, splitInto)));
  const newCidr = Math.min(32, cidr + splitBits);
  const subnetSize = newCidr === 32 ? 1 : Math.pow(2, 32 - newCidr);
  const subnetCount = newCidr === 32 ? 1 : Math.pow(2, splitBits);
  const splitSubnets = useMemo(() => {
    if (network === null) return [];
    const rows: { net: number; bcast: number }[] = [];
    for (let i = 0; i < subnetCount && i < 64; i++) {
      const net = (network + i * subnetSize) >>> 0;
      const bcast = (net + subnetSize - 1) >>> 0;
      rows.push({ net, bcast });
    }
    return rows;
  }, [network, subnetCount, subnetSize]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Subnet Calculator
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          IPv4 subnet planning for industrial networks — network /
          broadcast / host range, binary &amp; hex views, and a quick
          subnet-split planner.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_2fr]">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              IP address
            </span>
            <input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.100"
              className={inputCls + " mt-1 font-mono"}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              CIDR /n
            </span>
            <input
              type="number"
              min={0}
              max={32}
              value={cidr}
              onChange={(e) => setCidr(Math.max(0, Math.min(32, Number(e.target.value) || 0)))}
              className={inputCls + " mt-1 font-mono"}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Subnet mask
            </span>
            <input
              value={maskInput}
              onChange={(e) => setMaskInput(e.target.value)}
              onBlur={applyMaskInput}
              className={inputCls + " mt-1 font-mono"}
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {[8, 16, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCidr(c)}
              className={
                "rounded-full px-2.5 py-1 font-mono text-[11px] " +
                (cidr === c
                  ? "bg-eng-navy text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-eng-navy/10 hover:text-eng-navy")
              }
            >
              /{c}
            </button>
          ))}
        </div>
      </section>

      {ipNum === null ? (
        <p className="mt-6 rounded-lg bg-eng-rust/10 px-3 py-2 text-sm text-eng-rust">
          Enter a valid IPv4 address (e.g., 192.168.1.100).
        </p>
      ) : (
        <>
          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card title="Network">
              <Stat label="Network" value={formatIp(network!)} sub={`/${cidr}`} highlight />
              <Stat label="Broadcast" value={formatIp(broadcast!)} />
              <Stat label="First host" value={firstHost !== null ? formatIp(firstHost) : "—"} />
              <Stat label="Last host" value={lastHost !== null ? formatIp(lastHost) : "—"} />
            </Card>
            <Card title="Counts">
              <Stat label="Total addresses" value={totalAddresses.toLocaleString()} />
              <Stat label="Usable hosts" value={usableHosts.toLocaleString()} />
              <Stat label="Block size" value={`${(1 << (32 - cidr) >>> 0 || 1).toLocaleString()} per /${cidr}`} />
            </Card>
            <Card title="Classification">
              <Stat label="Class" value={ipClass(ipNum)} />
              <Stat label="Type" value={
                isLoopback(ipNum)
                  ? "Loopback"
                  : isLinkLocal(ipNum)
                    ? "Link-local"
                    : isPrivate(ipNum)
                      ? "Private (RFC 1918)"
                      : "Public"
              } />
              <Stat label="Subnet mask" value={formatIp(mask)} />
              <Stat label="Wildcard" value={formatIp(wildcard)} />
            </Card>
          </section>

          <section className="mt-6">
            <Card title="Representations">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-sm">
                  <tbody>
                    <Repr label="Dotted decimal" v={formatIp(ipNum)} />
                    <Repr label="Binary" v={toBinary(ipNum)} />
                    <Repr label="Hex" v={toHex(ipNum)} />
                    <Repr label="Decimal (32-bit)" v={ipNum.toString()} />
                    <Repr label="Mask binary" v={toBinary(mask)} />
                    <Repr label="Wildcard binary" v={toBinary(wildcard)} />
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          <section className="mt-6">
            <Card title="Split / VLSM planner">
              <p className="mb-3 text-sm text-gray-500">
                Carve <strong>{formatIp(network!)}/{cidr}</strong> into smaller
                equal blocks. Useful when planning VLANs or per-cell IP plans.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Number of subnets
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={64}
                    value={splitInto}
                    onChange={(e) => setSplitInto(Math.max(1, Math.min(64, Number(e.target.value) || 1)))}
                    className={inputCls + " mt-1 font-mono"}
                  />
                </label>
                <Stat label="New prefix" value={`/${newCidr}`} />
                <Stat label="Hosts per subnet" value={(newCidr >= 31 ? subnetSize : Math.max(0, subnetSize - 2)).toLocaleString()} />
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-sm">
                  <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-2 py-2">#</th>
                      <th className="px-2 py-2">Network</th>
                      <th className="px-2 py-2">First host</th>
                      <th className="px-2 py-2">Last host</th>
                      <th className="px-2 py-2">Broadcast</th>
                    </tr>
                  </thead>
                  <tbody>
                    {splitSubnets.map((s, i) => (
                      <tr key={i} className="border-t border-gray-100 font-mono">
                        <td className="px-2 py-1 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-2 py-1">{formatIp(s.net)}/{newCidr}</td>
                        <td className="px-2 py-1">{newCidr < 31 ? formatIp((s.net + 1) >>> 0) : "—"}</td>
                        <td className="px-2 py-1">{newCidr < 31 ? formatIp((s.bcast - 1) >>> 0) : "—"}</td>
                        <td className="px-2 py-1">{newCidr < 31 ? formatIp(s.bcast) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {subnetCount > 64 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Showing first 64 of {subnetCount.toLocaleString()} subnets.
                  </p>
                )}
              </div>
            </Card>
          </section>

          <section className="mt-6">
            <Card title="Common CIDR reference">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[32rem] text-sm">
                  <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-2 py-2">CIDR</th>
                      <th className="px-2 py-2">Mask</th>
                      <th className="px-2 py-2 text-right">Block</th>
                      <th className="px-2 py-2 text-right">Hosts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[24, 25, 26, 27, 28, 29, 30, 31, 32].map((c) => {
                      const m = maskFromCidr(c);
                      const block = c === 32 ? 1 : Math.pow(2, 32 - c);
                      const hosts = c === 32 ? 1 : c === 31 ? 2 : Math.max(0, block - 2);
                      return (
                        <tr key={c} className={"border-t border-gray-100 " + (c === cidr ? "bg-eng-navy/5" : "")}>
                          <td className="px-2 py-1 font-mono font-semibold">/{c}</td>
                          <td className="px-2 py-1 font-mono">{formatIp(m)}</td>
                          <td className="px-2 py-1 text-right font-mono">{block.toLocaleString()}</td>
                          <td className="px-2 py-1 text-right font-mono">{hosts.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        </>
      )}
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
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </section>
  );
}

function Stat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between gap-3 rounded-lg px-3 py-2 " +
        (highlight ? "bg-eng-navy text-white" : "bg-gray-50 text-gray-700")
      }
    >
      <span className={"text-xs font-semibold uppercase tracking-wide " + (highlight ? "text-white/70" : "text-gray-500")}>
        {label}
      </span>
      <span className="text-right font-mono text-sm">
        {value}
        {sub && (
          <span className={"ml-2 text-[11px] " + (highlight ? "text-white/70" : "text-gray-500")}>
            {sub}
          </span>
        )}
      </span>
    </div>
  );
}

function Repr({ label, v }: { label: string; v: string }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="w-44 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </td>
      <td className="px-2 py-1.5">
        <code className="break-all font-mono text-sm text-gray-800">{v}</code>
      </td>
    </tr>
  );
}
