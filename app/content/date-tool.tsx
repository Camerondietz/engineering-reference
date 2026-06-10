"use client";

// app/content/date-calculator.tsx
//
// Logistics / lead-time date calculator. Adds and subtracts days or
// weeks (calendar, business, or business + US federal holidays),
// computes differences, plans a multi-stage timeline either forward
// from a start date or backward from a required delivery, and shows
// info / nearby holidays for any date.

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ============================================================
// Date helpers
// ============================================================

const MS_PER_DAY = 86_400_000;

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISODate(s: string): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + Math.round(n));
  return r;
}

function diffCalendarDays(a: Date, b: Date): number {
  // Local-midnight delta, immune to DST.
  const am = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bm = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bm - am) / MS_PER_DAY);
}

function formatNice(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function dayOfWeek(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.round((d.getTime() - start.getTime()) / MS_PER_DAY);
}

function isoWeek(d: Date): { week: number; weekYear: number } {
  const tmp = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const firstThu = new Date(tmp.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      (tmp.getTime() - firstThu.getTime()) / MS_PER_DAY / 7 +
        ((firstThu.getDay() + 6) % 7) / 7 -
        ((tmp.getDay() + 6) % 7) / 7,
    );
  return { week, weekYear: tmp.getFullYear() };
}

function quarterOf(d: Date): number {
  return Math.floor(d.getMonth() / 3) + 1;
}

// ============================================================
// US federal holidays
// ============================================================

function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const d = new Date(year, month, 1);
  while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
  d.setDate(d.getDate() + (n - 1) * 7);
  return d;
}

function lastWeekday(year: number, month: number, weekday: number): Date {
  const d = new Date(year, month + 1, 0);
  while (d.getDay() !== weekday) d.setDate(d.getDate() - 1);
  return d;
}

function observed(d: Date): Date {
  const dow = d.getDay();
  if (dow === 6) return addDays(d, -1);
  if (dow === 0) return addDays(d, 1);
  return d;
}

interface Holiday {
  date: Date;
  observed: Date;
  name: string;
}

function usHolidays(year: number): Holiday[] {
  const base: { date: Date; name: string }[] = [
    { date: new Date(year, 0, 1), name: "New Year's Day" },
    { date: nthWeekday(year, 0, 1, 3), name: "MLK Jr. Day" },
    { date: nthWeekday(year, 1, 1, 3), name: "Presidents' Day" },
    { date: lastWeekday(year, 4, 1), name: "Memorial Day" },
    { date: new Date(year, 5, 19), name: "Juneteenth" },
    { date: new Date(year, 6, 4), name: "Independence Day" },
    { date: nthWeekday(year, 8, 1, 1), name: "Labor Day" },
    { date: nthWeekday(year, 9, 1, 2), name: "Columbus / Indigenous Peoples' Day" },
    { date: new Date(year, 10, 11), name: "Veterans Day" },
    { date: nthWeekday(year, 10, 4, 4), name: "Thanksgiving Day" },
    { date: new Date(year, 11, 25), name: "Christmas Day" },
  ];
  return base.map((h) => ({ ...h, observed: observed(h.date) }));
}

function holidaysSetFor(years: number[]): Set<string> {
  const set = new Set<string>();
  for (const y of years) {
    for (const h of usHolidays(y)) {
      set.add(toISODate(h.observed));
    }
  }
  return set;
}

function isWeekend(d: Date): boolean {
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

function isWorkingDay(d: Date, holidays?: Set<string>): boolean {
  if (isWeekend(d)) return false;
  if (holidays && holidays.has(toISODate(d))) return false;
  return true;
}

function addWorkingDays(start: Date, count: number, holidays?: Set<string>): Date {
  const dir = count >= 0 ? 1 : -1;
  let remaining = Math.abs(Math.round(count));
  const d = new Date(start);
  while (remaining > 0) {
    d.setDate(d.getDate() + dir);
    if (isWorkingDay(d, holidays)) remaining--;
  }
  return d;
}

function workingDaysBetween(a: Date, b: Date, holidays?: Set<string>): number {
  if (a.getTime() === b.getTime()) return 0;
  const dir = a < b ? 1 : -1;
  let count = 0;
  const d = new Date(a < b ? a : b);
  const end = a < b ? b : a;
  while (d.getTime() < end.getTime()) {
    d.setDate(d.getDate() + 1);
    if (isWorkingDay(d, holidays)) count++;
  }
  return count * dir;
}

// Convert a duration in user's unit (days|weeks) to a number of
// calendar OR working days to add.
function durationToDays(amount: number, unit: "days" | "weeks", business: boolean): number {
  if (!isFinite(amount)) return 0;
  if (unit === "days") return amount;
  return business ? amount * 5 : amount * 7;
}

// ============================================================
// Types & defaults
// ============================================================

interface Stage {
  id: string;
  name: string;
  duration: number; // in current unit
}

interface State {
  unit: "days" | "weeks";
  business: boolean;
  skipHolidays: boolean;

  arithStart: string;
  arithDur: number;
  arithOp: "+" | "-";

  diffStart: string;
  diffEnd: string;

  plannerAnchor: "start" | "end";
  plannerDate: string;
  stages: Stage[];

  factsDate: string;
}

const STORAGE_KEY = "engref:date-calc:v1";

function todayISO(): string {
  return toISODate(new Date());
}

const DEFAULTS: State = {
  unit: "days",
  business: false,
  skipHolidays: false,
  arithStart: todayISO(),
  arithDur: 14,
  arithOp: "+",
  diffStart: todayISO(),
  diffEnd: toISODate(addDays(new Date(), 30)),
  plannerAnchor: "start",
  plannerDate: todayISO(),
  stages: [
    { id: "s1", name: "Engineering / drawings", duration: 1 },
    { id: "s2", name: "Procurement", duration: 2 },
    { id: "s3", name: "Fabrication", duration: 3 },
    { id: "s4", name: "Finishing & QA", duration: 1 },
    { id: "s5", name: "Shipping", duration: 1 },
  ],
  factsDate: todayISO(),
};

const uid = () => Math.random().toString(36).slice(2, 9);

// ============================================================
// Page
// ============================================================

export default function DateCalculatorPage() {
  const [s, setS] = useState<State>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setS((prev) => ({ ...prev, ...parsed }));
      }
    } catch { /* */ }
  }, []);
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* */ }
  }, [s, mounted]);

  function patch(p: Partial<State>) { setS((x) => ({ ...x, ...p })); }

  function patchStage(id: string, p: Partial<Stage>) {
    setS((x) => ({ ...x, stages: x.stages.map((st) => (st.id === id ? { ...st, ...p } : st)) }));
  }
  function addStage() {
    setS((x) => ({ ...x, stages: [...x.stages, { id: uid(), name: "New stage", duration: 1 }] }));
  }
  function removeStage(id: string) {
    setS((x) => ({ ...x, stages: x.stages.filter((st) => st.id !== id) }));
  }
  function moveStage(id: string, dir: -1 | 1) {
    setS((x) => {
      const idx = x.stages.findIndex((st) => st.id === id);
      if (idx < 0) return x;
      const next = idx + dir;
      if (next < 0 || next >= x.stages.length) return x;
      const stages = [...x.stages];
      [stages[idx], stages[next]] = [stages[next], stages[idx]];
      return { ...x, stages };
    });
  }

  // --- shared holiday set covering a wide range of years ---
  const holidays = useMemo(() => {
    if (!s.skipHolidays) return undefined;
    const thisYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = thisYear - 2; y <= thisYear + 5; y++) years.push(y);
    return holidaysSetFor(years);
  }, [s.skipHolidays]);

  const unitLabel = s.unit === "weeks" ? "weeks" : "days";
  const modeLabel = s.business
    ? s.skipHolidays
      ? "business days (no weekends, no US holidays)"
      : "business days (no weekends)"
    : "calendar days";

  // --- arithmetic ---
  const arithStartDate = parseISODate(s.arithStart);
  const arithResult = useMemo(() => {
    if (!arithStartDate) return null;
    const signed = (s.arithOp === "+" ? 1 : -1) * s.arithDur;
    const totalDays = durationToDays(signed, s.unit, s.business);
    if (s.business) return addWorkingDays(arithStartDate, totalDays, holidays);
    return addDays(arithStartDate, totalDays);
  }, [arithStartDate, s.arithDur, s.arithOp, s.unit, s.business, holidays]);

  // --- difference ---
  const diffStartDate = parseISODate(s.diffStart);
  const diffEndDate = parseISODate(s.diffEnd);
  const diff = useMemo(() => {
    if (!diffStartDate || !diffEndDate) return null;
    const cal = diffCalendarDays(diffStartDate, diffEndDate);
    const work = workingDaysBetween(diffStartDate, diffEndDate, holidays);
    return { cal, work };
  }, [diffStartDate, diffEndDate, holidays]);

  // --- planner ---
  const totalStageDays = useMemo(() => {
    return s.stages.reduce((acc, st) => acc + durationToDays(st.duration, s.unit, s.business), 0);
  }, [s.stages, s.unit, s.business]);

  const plannerAnchorDate = parseISODate(s.plannerDate);
  const plannerRows = useMemo(() => {
    if (!plannerAnchorDate) return [];
    const rows: { stage: Stage; start: Date; end: Date }[] = [];
    if (s.plannerAnchor === "start") {
      let cursor = plannerAnchorDate;
      for (const st of s.stages) {
        const days = durationToDays(st.duration, s.unit, s.business);
        const end = s.business
          ? addWorkingDays(cursor, days, holidays)
          : addDays(cursor, days);
        rows.push({ stage: st, start: cursor, end });
        cursor = end;
      }
    } else {
      // Walk backward; build rows then reverse.
      let cursor = plannerAnchorDate;
      const back: { stage: Stage; start: Date; end: Date }[] = [];
      for (let i = s.stages.length - 1; i >= 0; i--) {
        const st = s.stages[i];
        const days = durationToDays(st.duration, s.unit, s.business);
        const start = s.business
          ? addWorkingDays(cursor, -days, holidays)
          : addDays(cursor, -days);
        back.push({ stage: st, start, end: cursor });
        cursor = start;
      }
      rows.push(...back.reverse());
    }
    return rows;
  }, [plannerAnchorDate, s.plannerAnchor, s.stages, s.unit, s.business, holidays]);

  const plannerStart = plannerRows[0]?.start;
  const plannerEnd = plannerRows[plannerRows.length - 1]?.end;

  function copyPlannerTSV() {
    const lines: string[] = ["Stage\tStart\tEnd\tDuration"];
    for (const r of plannerRows) {
      lines.push(
        `${r.stage.name}\t${toISODate(r.start)}\t${toISODate(r.end)}\t${r.stage.duration} ${unitLabel}`,
      );
    }
    if (plannerStart && plannerEnd) {
      lines.push("");
      lines.push(`Total\t${toISODate(plannerStart)}\t${toISODate(plannerEnd)}\t${diffCalendarDays(plannerStart, plannerEnd)} cal days`);
    }
    try { navigator.clipboard?.writeText(lines.join("\n")); } catch { /* */ }
  }

  // --- facts ---
  const factsDate = parseISODate(s.factsDate);
  const facts = useMemo(() => {
    if (!factsDate) return null;
    const today = new Date();
    const todayStripped = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const fromToday = diffCalendarDays(todayStripped, factsDate);
    const workFromToday = workingDaysBetween(todayStripped, factsDate, holidays);
    const iso = isoWeek(factsDate);
    const year = factsDate.getFullYear();
    const upcomingHolidays = [...usHolidays(year), ...usHolidays(year + 1)]
      .filter((h) => h.observed.getTime() >= todayStripped.getTime())
      .sort((a, b) => a.observed.getTime() - b.observed.getTime())
      .slice(0, 6);
    return {
      iso,
      doy: dayOfYear(factsDate),
      quarter: quarterOf(factsDate),
      fromToday,
      workFromToday,
      upcomingHolidays,
      isToday: fromToday === 0,
      isWeekend: isWeekend(factsDate),
      isHoliday:
        holidays?.has(toISODate(factsDate)) ||
        usHolidays(factsDate.getFullYear()).some(
          (h) => toISODate(h.observed) === toISODate(factsDate),
        ),
    };
  }, [factsDate, holidays]);

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
          Date Calculator
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Lead-time math for logistics and planning. Days or weeks, calendar
          or business days, with optional US federal holiday skipping —
          across simple arithmetic, date differences, and a multi-stage
          timeline planner.
        </p>
      </header>

      {/* ====================================================
          GLOBAL OPTIONS
          ==================================================== */}
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Unit
            </span>
            <Seg
              active={s.unit === "days"}
              onClick={() => patch({ unit: "days" })}
            >
              Days
            </Seg>
            <Seg
              active={s.unit === "weeks"}
              onClick={() => patch({ unit: "weeks" })}
            >
              Weeks
            </Seg>

            <span className="ml-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Mode
            </span>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={s.business}
                onChange={(e) => patch({ business: e.target.checked })}
              />
              Business days only
            </label>
            <label
              className={
                "inline-flex items-center gap-2 text-xs font-medium " +
                (s.business
                  ? "cursor-pointer text-gray-700"
                  : "cursor-not-allowed text-gray-400")
              }
            >
              <input
                type="checkbox"
                disabled={!s.business}
                checked={s.skipHolidays}
                onChange={(e) => patch({ skipHolidays: e.target.checked })}
              />
              Skip US federal holidays
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Active mode: <strong className="text-eng-navy">{modeLabel}</strong>
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ====================================================
            DATE ARITHMETIC
            ==================================================== */}
        <Card title="Date arithmetic">
          <p className="mb-3 text-sm text-gray-500">
            <strong>Start date</strong> {s.arithOp === "+" ? "+" : "−"} a duration ={" "}
            <strong>result date</strong>.
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
            <DateField
              label="Start"
              value={s.arithStart}
              onChange={(v) => patch({ arithStart: v })}
            />
            <div className="flex items-end pb-1">
              <Seg
                active={s.arithOp === "+"}
                onClick={() => patch({ arithOp: "+" })}
                small
              >
                +
              </Seg>
              <Seg
                active={s.arithOp === "-"}
                onClick={() => patch({ arithOp: "-" })}
                small
              >
                −
              </Seg>
            </div>
            <Field
              label={`Duration (${unitLabel})`}
              type="number"
              step={s.unit === "weeks" ? "0.5" : "1"}
              value={s.arithDur}
              onChange={(v) => patch({ arithDur: Number(v) || 0 })}
            />
            <TodayButton onClick={() => patch({ arithStart: todayISO() })} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[1, 2, 3, 5, 7, 10, 14, 30, 60, 90].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => patch({ arithDur: s.unit === "weeks" ? Math.max(1, Math.round(n / 7)) : n })}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
              >
                {s.unit === "weeks" ? `${Math.max(1, Math.round(n / 7))} w` : `${n} d`}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            {arithResult ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Result
                </p>
                <p className="mt-1 text-2xl font-semibold text-eng-navy">
                  {formatNice(arithResult)}
                </p>
                <p className="mt-1 font-mono text-xs text-gray-500">
                  {toISODate(arithResult)} · {modeLabel}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Enter a valid start date.</p>
            )}
          </div>
        </Card>

        {/* ====================================================
            DATE DIFFERENCE
            ==================================================== */}
        <Card title="Days between two dates">
          <p className="mb-3 text-sm text-gray-500">
            Calendar and business-day counts between any two dates.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <DateField
                label="Start"
                value={s.diffStart}
                onChange={(v) => patch({ diffStart: v })}
              />
              <TodayButton onClick={() => patch({ diffStart: todayISO() })} small />
            </div>
            <div>
              <DateField
                label="End"
                value={s.diffEnd}
                onChange={(v) => patch({ diffEnd: v })}
              />
              <TodayButton onClick={() => patch({ diffEnd: todayISO() })} small />
            </div>
          </div>

          <div className="mt-4 grid gap-2 rounded-xl bg-gray-50 p-4 text-sm">
            <Row label="Calendar days">
              <Mono>
                {diff
                  ? `${diff.cal} ${Math.abs(diff.cal) === 1 ? "day" : "days"} ${
                      diff.cal === 0 ? "" : diff.cal > 0 ? "(forward)" : "(backward)"
                    }`
                  : "—"}
              </Mono>
            </Row>
            <Row label="Calendar weeks">
              <Mono>{diff ? (diff.cal / 7).toFixed(2) : "—"}</Mono>
            </Row>
            <Row label={s.skipHolidays ? "Business days (skip US holidays)" : "Business days"}>
              <Mono>{diff ? `${diff.work}` : "—"}</Mono>
            </Row>
            <Row label="Months (rough)">
              <Mono>{diff ? (diff.cal / 30.4375).toFixed(2) : "—"}</Mono>
            </Row>
          </div>
        </Card>
      </div>

      {/* ====================================================
          MULTI-STAGE PLANNER
          ==================================================== */}
      <div className="mt-6">
        <Card title="Multi-stage lead-time planner">
          <p className="mb-3 text-sm text-gray-500">
            Build up a timeline of sequential stages. Anchor the schedule to
            either a <strong>start</strong> date (work forward) or a required{" "}
            <strong>end</strong> date (work backward).
          </p>

          <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Anchor
              </span>
              <div className="mt-1 flex">
                <Seg
                  active={s.plannerAnchor === "start"}
                  onClick={() => patch({ plannerAnchor: "start" })}
                >
                  Start date
                </Seg>
                <Seg
                  active={s.plannerAnchor === "end"}
                  onClick={() => patch({ plannerAnchor: "end" })}
                >
                  End date
                </Seg>
              </div>
            </div>
            <DateField
              label={s.plannerAnchor === "start" ? "Start of first stage" : "Required completion"}
              value={s.plannerDate}
              onChange={(v) => patch({ plannerDate: v })}
            />
            <div className="flex items-end gap-2">
              <TodayButton onClick={() => patch({ plannerDate: todayISO() })} />
              <button
                type="button"
                onClick={copyPlannerTSV}
                disabled={plannerRows.length === 0}
                className="rounded-full bg-eng-navy px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-eng-blue disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Copy schedule
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-10 px-2 py-2"></th>
                  <th className="px-2 py-2">Stage</th>
                  <th className="px-2 py-2 text-right">Duration ({unitLabel})</th>
                  <th className="px-2 py-2">Start</th>
                  <th className="px-2 py-2">End</th>
                  <th className="w-12 px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {s.stages.map((st, i) => {
                  const row = plannerRows[i];
                  return (
                    <tr key={st.id} className="border-t border-gray-100">
                      <td className="px-2 py-2">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveStage(st.id, -1)}
                            disabled={i === 0}
                            className="text-xs text-gray-400 hover:text-eng-navy disabled:opacity-30"
                            aria-label="Move up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStage(st.id, 1)}
                            disabled={i === s.stages.length - 1}
                            className="text-xs text-gray-400 hover:text-eng-navy disabled:opacity-30"
                            aria-label="Move down"
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          className={inputCls}
                          value={st.name}
                          onChange={(e) => patchStage(st.id, { name: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <input
                          type="number"
                          step={s.unit === "weeks" ? "0.5" : "1"}
                          min={0}
                          value={st.duration}
                          onChange={(e) => patchStage(st.id, { duration: Number(e.target.value) || 0 })}
                          className={inputCls + " text-right"}
                        />
                      </td>
                      <td className="px-2 py-2 font-mono text-xs">
                        {row ? (
                          <>
                            <div>{toISODate(row.start)}</div>
                            <div className="text-[10px] text-gray-400">
                              {dayOfWeek(row.start)}
                            </div>
                          </>
                        ) : "—"}
                      </td>
                      <td className="px-2 py-2 font-mono text-xs">
                        {row ? (
                          <>
                            <div className="text-eng-navy">{toISODate(row.end)}</div>
                            <div className="text-[10px] text-gray-400">
                              {dayOfWeek(row.end)}
                            </div>
                          </>
                        ) : "—"}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeStage(st.id)}
                          className="text-gray-400 hover:text-eng-rust"
                          aria-label="Remove stage"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {s.stages.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-2 py-6 text-center text-sm text-gray-500">
                      No stages yet. Add one to start planning.
                    </td>
                  </tr>
                )}
              </tbody>
              {plannerStart && plannerEnd && (
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50 text-sm">
                    <td></td>
                    <td className="px-2 py-2 font-semibold text-gray-700">Total</td>
                    <td className="px-2 py-2 text-right font-mono">
                      {s.stages.reduce((acc, st) => acc + st.duration, 0).toFixed(s.unit === "weeks" ? 1 : 0)} {unitLabel}
                    </td>
                    <td className="px-2 py-2 font-mono text-xs">{toISODate(plannerStart)}</td>
                    <td className="px-2 py-2 font-mono text-xs text-eng-navy">{toISODate(plannerEnd)}</td>
                    <td></td>
                  </tr>
                  <tr className="bg-gray-50 text-xs text-gray-500">
                    <td></td>
                    <td colSpan={4} className="px-2 pb-2">
                      Span: {diffCalendarDays(plannerStart, plannerEnd)} calendar days
                      {s.business
                        ? ` · ${workingDaysBetween(plannerStart, plannerEnd, holidays)} business days`
                        : ""}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addStage}
              className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-eng-navy hover:text-eng-navy"
            >
              + Add stage
            </button>
            <button
              type="button"
              onClick={() =>
                setS((x) => ({
                  ...x,
                  stages: [
                    { id: uid(), name: "Engineering / drawings", duration: x.unit === "weeks" ? 1 : 5 },
                    { id: uid(), name: "Procurement", duration: x.unit === "weeks" ? 2 : 10 },
                    { id: uid(), name: "Fabrication", duration: x.unit === "weeks" ? 3 : 15 },
                    { id: uid(), name: "Finishing & QA", duration: x.unit === "weeks" ? 1 : 5 },
                    { id: uid(), name: "Shipping", duration: x.unit === "weeks" ? 1 : 5 },
                  ],
                }))
              }
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
            >
              Reset to typical 8-week plan
            </button>
            <button
              type="button"
              onClick={() => setS((x) => ({ ...x, stages: [] }))}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-eng-rust/10 hover:text-eng-rust"
            >
              Clear stages
            </button>
          </div>

          {/* Visualization */}
          {plannerStart && plannerEnd && plannerRows.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Timeline
              </p>
              <PlannerChart
                rows={plannerRows}
                start={plannerStart}
                end={plannerEnd}
              />
            </div>
          )}
        </Card>
      </div>

      {/* ====================================================
          DATE FACTS
          ==================================================== */}
      <div className="mt-6">
        <Card title="Date facts">
          <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
            <DateField
              label="Date"
              value={s.factsDate}
              onChange={(v) => patch({ factsDate: v })}
            />
            <div className="flex items-end gap-2">
              <TodayButton onClick={() => patch({ factsDate: todayISO() })} />
              <button
                type="button"
                onClick={() => patch({ factsDate: toISODate(addDays(new Date(), 30)) })}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
              >
                +30 days
              </button>
              <button
                type="button"
                onClick={() => patch({ factsDate: toISODate(addDays(new Date(), 90)) })}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
              >
                +90 days
              </button>
            </div>
          </div>

          {facts && factsDate && (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  About this date
                </p>
                <p className="mt-1 text-xl font-semibold text-eng-navy">
                  {formatNice(factsDate)}
                </p>
                <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-gray-500">Day of week</dt>
                  <dd className="font-mono text-gray-800">{dayOfWeek(factsDate)}</dd>
                  <dt className="text-gray-500">ISO week</dt>
                  <dd className="font-mono text-gray-800">
                    {facts.iso.weekYear}-W{String(facts.iso.week).padStart(2, "0")}
                  </dd>
                  <dt className="text-gray-500">Day of year</dt>
                  <dd className="font-mono text-gray-800">
                    {facts.doy} / {new Date(factsDate.getFullYear(), 11, 31).getMonth() === 11 ? (
                      (new Date(factsDate.getFullYear(), 1, 29).getMonth() === 1 ? 366 : 365)
                    ) : 365}
                  </dd>
                  <dt className="text-gray-500">Quarter</dt>
                  <dd className="font-mono text-gray-800">Q{facts.quarter} {factsDate.getFullYear()}</dd>
                  <dt className="text-gray-500">From today</dt>
                  <dd className="font-mono text-gray-800">
                    {facts.isToday
                      ? "Today"
                      : `${facts.fromToday > 0 ? "+" : ""}${facts.fromToday} cal day${
                          Math.abs(facts.fromToday) === 1 ? "" : "s"
                        }`}
                    {!facts.isToday && (
                      <span className="ml-2 text-gray-500">
                        ({facts.workFromToday > 0 ? "+" : ""}{facts.workFromToday} business)
                      </span>
                    )}
                  </dd>
                  <dt className="text-gray-500">Status</dt>
                  <dd>
                    {facts.isHoliday && <Pill tone="amber">US holiday</Pill>}
                    {facts.isWeekend && <Pill tone="gray">Weekend</Pill>}
                    {!facts.isHoliday && !facts.isWeekend && <Pill tone="navy">Working day</Pill>}
                  </dd>
                </dl>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Upcoming US federal holidays
                </p>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                  {facts.upcomingHolidays.map((h) => {
                    const d = diffCalendarDays(new Date(), h.observed);
                    return (
                      <li
                        key={h.name + toISODate(h.observed)}
                        className="flex items-baseline justify-between gap-3 border-b border-gray-200 pb-1 last:border-0"
                      >
                        <span className="text-gray-800">{h.name}</span>
                        <span className="text-right font-mono text-xs text-gray-600">
                          {formatNice(h.observed)}
                          <div className="text-[10px] text-gray-400">in {d} days</div>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>
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
  type = "text",
  step,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </span>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " mt-1"}
      />
    </label>
  );
}

function DateField({
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
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " mt-1"}
      />
    </label>
  );
}

function TodayButton({ onClick, small = false }: { onClick: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full bg-eng-navy/10 font-semibold text-eng-navy hover:bg-eng-navy hover:text-white " +
        (small ? "mt-1 px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs")
      }
    >
      Today
    </button>
  );
}

function Seg({
  active,
  onClick,
  children,
  small = false,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full font-semibold transition " +
        (small ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-xs") +
        " " +
        (active
          ? "bg-eng-navy text-white shadow-sm"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200")
      }
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-gray-900">{children}</span>;
}

function Pill({ tone, children }: { tone: "amber" | "navy" | "gray"; children: ReactNode }) {
  const cls =
    tone === "amber"
      ? "bg-eng-amber/20 text-eng-rust"
      : tone === "navy"
        ? "bg-eng-navy/10 text-eng-navy"
        : "bg-gray-100 text-gray-600";
  return (
    <span className={"inline-block rounded-full px-2 py-0.5 text-xs font-semibold " + cls}>
      {children}
    </span>
  );
}

function PlannerChart({
  rows,
  start,
  end,
}: {
  rows: { stage: Stage; start: Date; end: Date }[];
  start: Date;
  end: Date;
}) {
  const span = Math.max(1, diffCalendarDays(start, end));
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      {rows.map((r, i) => {
        const offset = diffCalendarDays(start, r.start);
        const length = Math.max(1, diffCalendarDays(r.start, r.end));
        const leftPct = (offset / span) * 100;
        const widthPct = Math.max(1, (length / span) * 100);
        const tone = i % 2 === 0 ? "bg-eng-navy" : "bg-eng-amber";
        return (
          <div key={r.stage.id} className="mb-1 flex items-center gap-3">
            <span className="w-40 shrink-0 truncate text-xs text-gray-700">
              {r.stage.name}
            </span>
            <div className="relative h-5 flex-1 rounded bg-white">
              <div
                className={"absolute top-0 bottom-0 rounded " + tone}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                title={`${r.stage.name}: ${toISODate(r.start)} → ${toISODate(r.end)} (${length} cal days)`}
              />
            </div>
            <span className="w-24 shrink-0 text-right font-mono text-[10px] text-gray-500">
              {length} d
            </span>
          </div>
        );
      })}
      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        <span>{toISODate(start)}</span>
        <span>{span} calendar days</span>
        <span>{toISODate(end)}</span>
      </div>
    </div>
  );
}
