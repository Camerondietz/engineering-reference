"use client";

// app/content/pricing-tool.tsx
//
// Excel-style pricing tool. Top: quick margin check. Below: one or
// more cost cards (BOM lines), each with its own price-break table,
// lot charge (enforces a per-unit minimum), fixed fee and percent
// fee. Pricing block applies margin / markup / cost+ across the
// aggregated tiers. Sell output table is copyable in the
// "qty - qty = $price" format. Tab and Enter navigate the grid.

import { useMemo, useRef, useState, type ReactNode, type KeyboardEvent } from "react";

// ============================================================
// Types
// ============================================================

interface PriceBreak {
  id: string;
  qty: number;
  unitCost: number;
}

interface CostCard {
  id: string;
  name: string;
  breaks: PriceBreak[];
  lotCharge: number;
  fixedFee: number;
  percentFee: number;
}

type PricingMode = "margin" | "markup" | "costPlus";
type RoundMode = "none" | "cent" | "nickel" | "dime" | "quarter";
type RoundDir = "up" | "nearest" | "down";

interface PricingParams {
  mode: PricingMode;
  marginPct: number;
  markupPct: number;
  baseCharge: number;
  rounding: RoundMode;
  roundDir: RoundDir;
}

// ============================================================
// Helpers
// ============================================================

const uid = () => Math.random().toString(36).slice(2, 9);

function currency(n: number, digits = 2): string {
  if (!isFinite(n)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: Math.max(digits, 4),
  }).format(n);
}

function fmtPct(n: number): string {
  if (!isFinite(n)) return "-";
  return (n * 100).toFixed(1) + "%";
}

function fmtNum(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

const ROUND_STEP: Record<RoundMode, number> = {
  none: 0,
  cent: 0.01,
  nickel: 0.05,
  dime: 0.10,
  quarter: 0.25,
};

function roundTo(v: number, mode: RoundMode, dir: RoundDir): number {
  const step = ROUND_STEP[mode];
  if (!step) return v;
  const fn = dir === "up" ? Math.ceil : dir === "down" ? Math.floor : Math.round;
  return fn(v / step) * step;
}

function sortBreaks(breaks: PriceBreak[]): PriceBreak[] {
  return [...breaks].sort((a, b) => a.qty - b.qty);
}

/** Per-card per-unit cost at order qty Q (applies lot, fixed, percent). */
function cardUnitCostAt(card: CostCard, Q: number): number {
  if (Q <= 0) return 0;
  const sorted = sortBreaks(card.breaks).filter((b) => b.qty > 0);
  if (sorted.length === 0) return 0;
  let tier = sorted[0];
  for (const t of sorted) {
    if (t.qty <= Q) tier = t;
    else break;
  }
  const base = tier.unitCost || 0;
  const lot = card.lotCharge > 0 ? Math.max(base, card.lotCharge / Q) : base;
  const fixed = lot + (card.fixedFee || 0) / Q;
  const percent = fixed * (1 + (card.percentFee || 0) / 100);
  return percent;
}

/** Aggregated qty breakpoints across every card's break list. */
function aggregatedQtys(cards: CostCard[]): number[] {
  const set = new Set<number>();
  for (const card of cards) {
    for (const br of card.breaks) {
      if (br.qty > 0) set.add(Math.round(br.qty));
    }
  }
  if (set.size === 0) set.add(1);
  return [...set].sort((a, b) => a - b);
}

function priceFromCost(cost: number, p: PricingParams): number {
  const base = cost + (p.baseCharge || 0);
  switch (p.mode) {
    case "margin": {
      const m = (p.marginPct || 0) / 100;
      if (m >= 1) return Infinity;
      return base / (1 - m);
    }
    case "markup":
      return base * (1 + (p.markupPct || 0) / 100);
    case "costPlus":
      return base;
  }
}

interface TierRow {
  minQty: number;
  maxQty: number | null;
  rangeLabel: string;
  unitCost: number;
  unitSell: number;
  margin: number;
}

function buildSellTable(cards: CostCard[], pricing: PricingParams): TierRow[] {
  const qtys = aggregatedQtys(cards);
  return qtys.map((q, i) => {
    const next = qtys[i + 1];
    const maxQty = next ? next - 1 : null;
    const rangeLabel = maxQty === null ? fmtNum(q) + "+" : fmtNum(q) + " - " + fmtNum(maxQty);
    const unitCost = cards.reduce((s, c) => s + cardUnitCostAt(c, q), 0);
    const rawSell = priceFromCost(unitCost, pricing);
    const unitSell = isFinite(rawSell) ? roundTo(rawSell, pricing.rounding, pricing.roundDir) : Infinity;
    const margin = unitSell > 0 ? (unitSell - unitCost) / unitSell : NaN;
    return { minQty: q, maxQty, rangeLabel, unitCost, unitSell, margin };
  });
}

/** Per-card copy block using the CARD's own break qtys. */
function cardCopyText(card: CostCard): string {
  const sorted = sortBreaks(card.breaks).filter((b) => b.qty > 0);
  if (sorted.length === 0) return "";
  return sorted
    .map((tier, i) => {
      const next = sorted[i + 1];
      const max = next ? next.qty - 1 : null;
      const label = max === null ? fmtNum(tier.qty) + "+" : fmtNum(tier.qty) + " - " + fmtNum(max);
      const cost = cardUnitCostAt(card, tier.qty);
      return label + " = " + currency(cost, 2);
    })
    .join("\n");
}

function sellCopyText(rows: TierRow[]): string {
  return rows.map((r) => r.rangeLabel + " = " + currency(r.unitSell, 2)).join("\n");
}

// ============================================================
// Defaults
// ============================================================

const DEFAULT_PRICING: PricingParams = {
  mode: "margin",
  marginPct: 30,
  markupPct: 40,
  baseCharge: 0,
  rounding: "cent",
  roundDir: "up",
};

const DEFAULT_CARDS: CostCard[] = [
  {
    id: "card-default",
    name: "Component 1",
    breaks: [
      { id: uid(), qty: 1, unitCost: 0.50 },
      { id: uid(), qty: 100, unitCost: 0.42 },
      { id: uid(), qty: 500, unitCost: 0.35 },
      { id: uid(), qty: 1000, unitCost: 0.30 },
    ],
    lotCharge: 0,
    fixedFee: 0,
    percentFee: 0,
  },
];

// ============================================================
// Page
// ============================================================

export default function PricingToolPage() {
  // Quick margin check (independent, top of page)
  const [qmCost, setQmCost] = useState(1);
  const [qmSell, setQmSell] = useState(1.5);
  const qmMargin = qmSell > 0 ? (qmSell - qmCost) / qmSell : NaN;
  const qmMarkup = qmCost > 0 ? (qmSell - qmCost) / qmCost : NaN;

  const [cards, setCards] = useState<CostCard[]>(DEFAULT_CARDS);
  const [pricing, setPricing] = useState<PricingParams>(DEFAULT_PRICING);

  // Refs keyed by cardId-rowIdx-col for Excel-style navigation.
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function setRef(cardId: string, rowIdx: number, col: "qty" | "cost") {
    return (el: HTMLInputElement | null) => {
      inputRefs.current[cardId + "-" + rowIdx + "-" + col] = el;
    };
  }
  function focusCell(cardId: string, rowIdx: number, col: "qty" | "cost") {
    const el = inputRefs.current[cardId + "-" + rowIdx + "-" + col];
    if (el) {
      el.focus();
      el.select();
    }
  }

  function addCard() {
    setCards((c) => [
      ...c,
      {
        id: uid(),
        name: "Component " + (c.length + 1),
        breaks: [{ id: uid(), qty: 1, unitCost: 0 }],
        lotCharge: 0,
        fixedFee: 0,
        percentFee: 0,
      },
    ]);
  }
  function removeCard(id: string) {
    setCards((c) => c.filter((x) => x.id !== id));
  }
  function patchCard(id: string, p: Partial<CostCard>) {
    setCards((c) => c.map((x) => (x.id === id ? { ...x, ...p } : x)));
  }
  function addBreakRow(cardId: string, focusNew?: { col: "qty" | "cost" }) {
    let newRowIdx = 0;
    setCards((c) =>
      c.map((card) => {
        if (card.id !== cardId) return card;
        const sorted = sortBreaks(card.breaks);
        const lastQty = sorted.length > 0 ? sorted[sorted.length - 1].qty : 0;
        const newQty = lastQty > 0 ? lastQty * 2 : 1;
        newRowIdx = card.breaks.length;
        return { ...card, breaks: [...card.breaks, { id: uid(), qty: newQty, unitCost: 0 }] };
      }),
    );
    if (focusNew) {
      requestAnimationFrame(() => focusCell(cardId, newRowIdx, focusNew.col));
    }
  }
  function removeBreak(cardId: string, breakId: string) {
    setCards((c) =>
      c.map((card) =>
        card.id === cardId ? { ...card, breaks: card.breaks.filter((b) => b.id !== breakId) } : card,
      ),
    );
  }
  function patchBreak(cardId: string, breakId: string, p: Partial<PriceBreak>) {
    setCards((c) =>
      c.map((card) =>
        card.id === cardId
          ? { ...card, breaks: card.breaks.map((b) => (b.id === breakId ? { ...b, ...p } : b)) }
          : card,
      ),
    );
  }

  function handleBreakKey(
    e: KeyboardEvent<HTMLInputElement>,
    cardId: string,
    rowIdx: number,
    col: "qty" | "cost",
    isLastRow: boolean,
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isLastRow) {
        addBreakRow(cardId, { col });
      } else {
        focusCell(cardId, rowIdx + 1, col);
      }
    } else if (e.key === "ArrowDown" && !isLastRow) {
      e.preventDefault();
      focusCell(cardId, rowIdx + 1, col);
    } else if (e.key === "ArrowUp" && rowIdx > 0) {
      e.preventDefault();
      focusCell(cardId, rowIdx - 1, col);
    }
  }

  function patchPricing(p: Partial<PricingParams>) {
    setPricing((x) => ({ ...x, ...p }));
  }

  const sellRows = useMemo(() => buildSellTable(cards, pricing), [cards, pricing]);

  function copy(t: string) {
    try { navigator.clipboard?.writeText(t); } catch { /* */ }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Pricing Tool
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Quick margin check, one or more cost cards with price breaks
          and fees, pricing strategy, and a sell-price table. Tab and
          Enter move you through the grid like a spreadsheet.
        </p>
      </header>

      {/* ========================================================
          1. QUICK MARGIN CHECK
          ======================================================== */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          1. Check current margin
        </h2>
        <div className="mt-3 grid items-end gap-3 sm:grid-cols-4">
          <NumField label="Cost ($)" value={qmCost} step="0.01" onChange={setQmCost} />
          <NumField label="Sell ($)" value={qmSell} step="0.01" onChange={setQmSell} />
          <Stat label="Margin" value={fmtPct(qmMargin)} highlight />
          <Stat label="Markup" value={fmtPct(qmMarkup)} />
        </div>
      </section>

      {/* ========================================================
          2. COST CARDS
          ======================================================== */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            2. Cost cards
          </h2>
          <button
            type="button"
            onClick={addCard}
            className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
          >
            + Add cost card
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-4">
          {cards.map((card, idx) => (
            <CostCardView
              key={card.id}
              card={card}
              index={idx}
              canRemove={cards.length > 1}
              onPatch={(p) => patchCard(card.id, p)}
              onRemove={() => removeCard(card.id)}
              onPatchBreak={(breakId, p) => patchBreak(card.id, breakId, p)}
              onRemoveBreak={(breakId) => removeBreak(card.id, breakId)}
              onAddBreak={() => addBreakRow(card.id)}
              setRef={(rowIdx, col) => setRef(card.id, rowIdx, col)}
              onKey={(e, rowIdx, col, isLast) => handleBreakKey(e, card.id, rowIdx, col, isLast)}
              onCopy={() => copy(cardCopyText(card))}
            />
          ))}
        </div>
      </section>

      {/* ========================================================
          3. PRICING
          ======================================================== */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          3. Pricing
        </h2>

        <div className="mt-3 flex flex-wrap gap-2">
          {([
            ["margin", "Margin %"],
            ["markup", "Markup %"],
            ["costPlus", "Cost + base"],
          ] as [PricingMode, string][]).map(([k, l]) => (
            <Seg key={k} active={pricing.mode === k} onClick={() => patchPricing({ mode: k })}>
              {l}
            </Seg>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          {pricing.mode === "margin" && (
            <NumField
              label="Margin %"
              value={pricing.marginPct}
              step="0.1"
              onChange={(v) => patchPricing({ marginPct: v })}
            />
          )}
          {pricing.mode === "markup" && (
            <NumField
              label="Markup %"
              value={pricing.markupPct}
              step="0.1"
              onChange={(v) => patchPricing({ markupPct: v })}
            />
          )}
          <NumField
            label="Base $ / unit"
            value={pricing.baseCharge}
            step="0.01"
            onChange={(v) => patchPricing({ baseCharge: v })}
          />
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Round to
            </span>
            <select
              className={inputCls + " mt-1"}
              value={pricing.rounding}
              onChange={(e) => patchPricing({ rounding: e.target.value as RoundMode })}
            >
              <option value="none">No rounding</option>
              <option value="cent">$0.01</option>
              <option value="nickel">$0.05</option>
              <option value="dime">$0.10</option>
              <option value="quarter">$0.25</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Direction
            </span>
            <select
              className={inputCls + " mt-1"}
              value={pricing.roundDir}
              onChange={(e) => patchPricing({ roundDir: e.target.value as RoundDir })}
            >
              <option value="up">Up</option>
              <option value="nearest">Nearest</option>
              <option value="down">Down</option>
            </select>
          </label>
        </div>
      </section>

      {/* ========================================================
          4. SELL OUTPUT
          ======================================================== */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            4. Sell
          </h2>
          <button
            type="button"
            onClick={() => copy(sellCopyText(sellRows))}
            disabled={sellRows.length === 0}
            className="rounded-full bg-eng-navy px-3 py-1 text-xs font-semibold text-white hover:bg-eng-blue disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Copy sell
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-2 py-2">Qty</th>
                <th className="px-2 py-2 text-right">Unit cost</th>
                <th className="px-2 py-2 text-right">Unit sell</th>
                <th className="px-2 py-2 text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              {sellRows.map((r) => (
                <tr key={r.minQty} className="border-t border-gray-100">
                  <td className="px-2 py-1.5 font-mono text-xs">{r.rangeLabel}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{currency(r.unitCost, 4)}</td>
                  <td className="px-2 py-1.5 text-right font-mono font-semibold text-eng-navy">
                    {currency(r.unitSell)}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <MarginPill m={r.margin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// Cost-card sub-component
// ============================================================

function CostCardView({
  card,
  index,
  canRemove,
  onPatch,
  onRemove,
  onPatchBreak,
  onRemoveBreak,
  onAddBreak,
  setRef,
  onKey,
  onCopy,
}: {
  card: CostCard;
  index: number;
  canRemove: boolean;
  onPatch: (p: Partial<CostCard>) => void;
  onRemove: () => void;
  onPatchBreak: (id: string, p: Partial<PriceBreak>) => void;
  onRemoveBreak: (id: string) => void;
  onAddBreak: () => void;
  setRef: (rowIdx: number, col: "qty" | "cost") => (el: HTMLInputElement | null) => void;
  onKey: (e: KeyboardEvent<HTMLInputElement>, rowIdx: number, col: "qty" | "cost", isLast: boolean) => void;
  onCopy: () => void;
}) {
  const lastRowIdx = card.breaks.length - 1;
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-eng-navy px-2 py-0.5 text-[10px] font-bold text-white">
          {index + 1}
        </span>
        <input
          className={inputCls + " max-w-xs flex-1"}
          value={card.name}
          onChange={(e) => onPatch({ name: e.target.value })}
          placeholder="Component name"
        />
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full bg-eng-navy/10 px-3 py-1 text-xs font-semibold text-eng-navy hover:bg-eng-navy hover:text-white"
        >
          Copy costs
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto text-gray-400 hover:text-eng-rust"
            aria-label="Remove cost card"
          >
            x
          </button>
        )}
      </div>

      {/* Price-break table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[24rem] text-sm">
          <thead className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="w-12 px-2 py-1.5">#</th>
              <th className="px-2 py-1.5">Min qty</th>
              <th className="px-2 py-1.5">Unit cost ($)</th>
              <th className="w-8 px-2 py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {card.breaks.map((b, rowIdx) => (
              <tr key={b.id} className="border-t border-gray-200">
                <td className="px-2 py-1 font-mono text-[11px] text-gray-400">{rowIdx + 1}</td>
                <td className="px-2 py-1">
                  <input
                    ref={setRef(rowIdx, "qty")}
                    type="number"
                    min={1}
                    step={1}
                    value={b.qty}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => onPatchBreak(b.id, { qty: Number(e.target.value) || 0 })}
                    onKeyDown={(e) => onKey(e, rowIdx, "qty", rowIdx === lastRowIdx)}
                    className={inputCls + " font-mono"}
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    ref={setRef(rowIdx, "cost")}
                    type="number"
                    step="0.0001"
                    value={b.unitCost}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => onPatchBreak(b.id, { unitCost: Number(e.target.value) || 0 })}
                    onKeyDown={(e) => onKey(e, rowIdx, "cost", rowIdx === lastRowIdx)}
                    className={inputCls + " font-mono"}
                  />
                </td>
                <td className="px-2 py-1 text-right">
                  <button
                    type="button"
                    onClick={() => onRemoveBreak(b.id)}
                    className="text-gray-400 hover:text-eng-rust"
                    aria-label="Remove row"
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onAddBreak}
        className="mt-2 rounded-full border border-dashed border-gray-300 bg-white px-3 py-0.5 text-[11px] font-semibold text-gray-600 hover:border-eng-navy hover:text-eng-navy"
      >
        + Add break row (or press Enter on the last row)
      </button>

      {/* Lot / fixed / percent */}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <NumField
          label="Lot charge ($)"
          value={card.lotCharge}
          step="0.01"
          onChange={(v) => onPatch({ lotCharge: v })}
          hint="Per tier: uses max(unit cost, lot / qty)"
        />
        <NumField
          label="Fixed fee ($ per order)"
          value={card.fixedFee}
          step="0.01"
          onChange={(v) => onPatch({ fixedFee: v })}
          hint="Divided across the order qty"
        />
        <NumField
          label="Percent fee (%)"
          value={card.percentFee}
          step="0.1"
          onChange={(v) => onPatch({ percentFee: v })}
          hint="Applied to the per-unit cost"
        />
      </div>
    </div>
  );
}

// ============================================================
// Small components
// ============================================================

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-eng-navy focus:outline-none focus:ring-2 focus:ring-eng-navy/20";

function NumField({
  label,
  value,
  onChange,
  step,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: string;
  hint?: string;
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
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={inputCls + " mt-1 font-mono"}
      />
      {hint && <span className="mt-0.5 block text-[10px] text-gray-500">{hint}</span>}
    </label>
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
        "flex flex-col rounded-lg px-3 py-2 " +
        (highlight ? "bg-eng-navy text-white" : "bg-gray-50 text-gray-700")
      }
    >
      <span className={"text-[10px] font-semibold uppercase tracking-wide " + (highlight ? "text-white/70" : "text-gray-500")}>
        {label}
      </span>
      <span className="mt-0.5 font-mono text-lg font-semibold">{value}</span>
    </div>
  );
}

function MarginPill({ m }: { m: number }) {
  if (!isFinite(m)) return <span className="text-gray-400">-</span>;
  const tone =
    m >= 0.35
      ? "bg-emerald-100 text-emerald-700"
      : m >= 0.2
        ? "bg-eng-amber/20 text-eng-rust"
        : m >= 0.1
          ? "bg-orange-100 text-orange-700"
          : "bg-eng-rust/10 text-eng-rust";
  return (
    <span className={"inline-block rounded-full px-2 py-0.5 text-xs font-semibold " + tone}>
      {fmtPct(m)}
    </span>
  );
}
