"use client";

// app/content/time-calculator.tsx
//
// Small set of focused time utilities for managers and employees:
// decimal ↔ HH:MM conversion, clock-out predictor against a weekly
// goal, duration between two times, time arithmetic, a weekly
// timesheet, and a simple gross-pay calculator with overtime.

import { useEffect, useMemo, useState } from "react";

// ============================================================
// Storage / constants
// ============================================================

const STORAGE_KEY = "engref:time-calc:v1";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

// ============================================================
// Helpers
// ============================================================

function decimalToHM(hours: number): { h: number; m: number; neg: boolean } {
  if (!isFinite(hours)) return { h: 0, m: 0, neg: false };
  const neg = hours < 0;
  const total = Math.round(Math.abs(hours) * 60);
  return { h: Math.floor(total / 60), m: total % 60, neg };
}

function formatHMLetters(hours: number): string {
  const { h, m, neg } = decimalToHM(hours);
  return `${neg ? "-" : ""}${h}h ${String(m).padStart(2, "0")}m`;
}

function formatHMColon(hours: number): string {
  const { h, m, neg } = decimalToHM(hours);
  return `${neg ? "-" : ""}${h}:${String(m).padStart(2, "0")}`;
}

function formatHMS(hours: number): string {
  if (!isFinite(hours)) return "—";
  const neg = hours < 0;
  const total = Math.round(Math.abs(hours) * 3600);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${neg ? "-" : ""}${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Parse anything reasonable: "4.7", "4:42", "4:42:30", "4h 42m", "1 hour 30 minutes". */
function parseDuration(input: string): number {
  if (!input) return NaN;
  const s = input.trim();
  if (!s) return NaN;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  const colon = s.match(/^(-?)(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
  if (colon) {
    const sign = colon[1] === "-" ? -1 : 1;
    const h = Number(colon[2]);
    const m = Number(colon[3]);
    const sec = Number(colon[4] || 0);
    return sign * (h + m / 60 + sec / 3600);
  }
  const hMatch = s.match(/(-?\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?/i);
  const mMatch = s.match(/(-?\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?/i);
  if (hMatch || mMatch) {
    const h = hMatch ? Number(hMatch[1]) : 0;
    const m = mMatch ? Number(mMatch[1]) : 0;
    return h + m / 60;
  }
  return NaN;
}

/** Parse clock time → minutes since midnight; accepts "08:30", "8:30 AM", "8:30am". */
function parseClockMinutes(s: string): number | null {
  if (!s) return null;
  const trim = s.trim();
  const m24 = trim.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = Number(m24[1]);
    const mm = Number(m24[2]);
    if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
    return h * 60 + mm;
  }
  const m12 = trim.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (m12) {
    let h = Number(m12[1]);
    const mm = Number(m12[2]);
    const isPm = m12[3].toLowerCase() === "pm";
    if (h === 12) h = isPm ? 12 : 0;
    else if (isPm) h += 12;
    return h * 60 + mm;
  }
  return null;
}

function formatClock24(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function formatClock12(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  let h = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(mm).padStart(2, "0")} ${ap}`;
}

function nowMinutes(d: Date = new Date()): number {
  return d.getHours() * 60 + d.getMinutes();
}

// ============================================================
// Types
// ============================================================

interface DayEntry {
  start: string; // "HH:MM"
  end: string;
  breakMin: number;
}

interface State {
  weeklyGoal: number;
  hoursWorked: number;
  clockIn: string;
  breakMin: number;
  durStart: string;
  durEnd: string;
  durBreak: number;
  arithBase: string;
  arithOp: "+" | "-";
  arithDur: string;
  timesheet: DayEntry[];
  payRate: number;
  payHours: number;
  otThreshold: number;
  otMultiplier: number;
}

const DEFAULT_STATE: State = {
  weeklyGoal: 40,
  hoursWorked: 0,
  clockIn: "08:00",
  breakMin: 30,
  durStart: "08:00",
  durEnd: "17:00",
  durBreak: 30,
  arithBase: "08:00",
  arithOp: "+",
  arithDur: "7:30",
  timesheet: WEEKDAYS.map(() => ({ start: "", end: "", breakMin: 0 })),
  payRate: 25,
  payHours: 40,
  otThreshold: 40,
  otMultiplier: 1.5,
};

// ============================================================
// Page
// ============================================================

export default function TimeCalculatorPage() {
  const [s, setS] = useState<State>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);
  const [nowTick, setNowTick] = useState(() => new Date());

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setS((prev) => ({ ...prev, ...parsed }));
      }
    } catch { /* */ }
    const i = setInterval(() => setNowTick(new Date()), 30_000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* */ }
  }, [s, mounted]);

  function patch(p: Partial<State>) { setS((x) => ({ ...x, ...p })); }
  function patchDay(i: number, p: Partial<DayEntry>) {
    setS((x) => ({
      ...x,
      timesheet: x.timesheet.map((d, idx) => (idx === i ? { ...d, ...p } : d)),
    }));
  }

  // ---- decimal ↔ HM converter state (independent, with live conversion) ----
  const [decIn, setDecIn] = useState("4.7");
  const [hmIn, setHmIn] = useState("4:42");
  const decimalParsed = useMemo(() => Number(decIn), [decIn]);
  const hmParsed = useMemo(() => parseDuration(hmIn), [hmIn]);

  function onDecimalChange(v: string) {
    setDecIn(v);
    const n = Number(v);
    if (isFinite(n)) setHmIn(formatHMColon(n));
  }
  function onHmChange(v: string) {
    setHmIn(v);
    const n = parseDuration(v);
    if (isFinite(n)) setDecIn(n.toFixed(4).replace(/\.?0+$/, ""));
  }

  // ---- weekly clock-out predictor ----
  const remaining = Math.max(0, s.weeklyGoal - s.hoursWorked);
  const clockInMin = parseClockMinutes(s.clockIn);
  const remainingMin = remaining * 60;
  const clockOutMin =
    clockInMin !== null && isFinite(remainingMin)
      ? clockInMin + remainingMin + (s.breakMin || 0)
      : null;
  const goalMet = s.hoursWorked >= s.weeklyGoal;

  // Hours so far today if clocked in
  const liveHoursToday =
    clockInMin !== null
      ? Math.max(0, (nowMinutes(nowTick) - clockInMin - (s.breakMin || 0)) / 60)
      : 0;

  // ---- duration between two times ----
  const durStartMin = parseClockMinutes(s.durStart);
  const durEndMin = parseClockMinutes(s.durEnd);
  let durRawMin: number | null = null;
  if (durStartMin !== null && durEndMin !== null) {
    let diff = durEndMin - durStartMin;
    if (diff < 0) diff += 1440; // overnight
    durRawMin = diff;
  }
  const durNetHours = durRawMin !== null ? Math.max(0, (durRawMin - (s.durBreak || 0)) / 60) : NaN;

  // ---- time arithmetic ----
  const arithBaseMin = parseClockMinutes(s.arithBase);
  const arithDurH = parseDuration(s.arithDur);
  const arithResultMin =
    arithBaseMin !== null && isFinite(arithDurH)
      ? arithBaseMin + (s.arithOp === "+" ? 1 : -1) * arithDurH * 60
      : null;

  // ---- timesheet ----
  const dailyTotals = s.timesheet.map((d) => {
    const a = parseClockMinutes(d.start);
    const b = parseClockMinutes(d.end);
    if (a === null || b === null) return 0;
    let diff = b - a;
    if (diff < 0) diff += 1440;
    return Math.max(0, (diff - (d.breakMin || 0)) / 60);
  });
  const weekTotal = dailyTotals.reduce((acc, n) => acc + n, 0);
  const weekVsGoal = weekTotal - s.weeklyGoal;
  const weekOT = Math.max(0, weekTotal - s.otThreshold);

  // ---- pay ----
  const otHoursPay = Math.max(0, s.payHours - s.otThreshold);
  const regHoursPay = Math.min(s.payHours, s.otThreshold);
  const regPay = regHoursPay * s.payRate;
  const otPay = otHoursPay * s.payRate * s.otMultiplier;
  const totalPay = regPay + otPay;

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
            Tool
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Time Calculator
          </h1>
          <p className="mt-2 max-w-3xl text-gray-600">
            Convert between decimal and clock time, predict when you&rsquo;ll
            hit your weekly goal, log a week on the timesheet, and run quick
            time math. Saved locally to your browser.
          </p>
        </div>
        {mounted && (
          <div className="rounded-full bg-eng-navy/5 px-4 py-1.5 text-sm">
            <span className="text-gray-500">Now: </span>
            <strong className="font-mono text-eng-navy">
              {formatClock12(nowMinutes(nowTick))}
            </strong>
          </div>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ====================================================
            DECIMAL ↔ HH:MM
            ==================================================== */}
        <Card title="Decimal ↔ hours / minutes">
          <p className="mb-3 text-sm text-gray-500">
            Edit either side — the other updates live.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Decimal hours"
              value={decIn}
              onChange={onDecimalChange}
              placeholder="4.7"
            />
            <Field
              label="Hours : minutes"
              value={hmIn}
              onChange={onHmChange}
              placeholder="4:42 or 4h 42m"
            />
          </div>

          <div className="mt-4 grid gap-2 rounded-xl bg-gray-50 p-4 text-sm">
            <Row label="As HH:MM">
              <Mono>{isFinite(decimalParsed) ? formatHMColon(decimalParsed) : "—"}</Mono>
            </Row>
            <Row label="As HH:MM:SS">
              <Mono>{isFinite(decimalParsed) ? formatHMS(decimalParsed) : "—"}</Mono>
            </Row>
            <Row label="Plain English">
              <Mono>{isFinite(decimalParsed) ? formatHMLetters(decimalParsed) : "—"}</Mono>
            </Row>
            <Row label="Minutes">
              <Mono>
                {isFinite(decimalParsed)
                  ? `${Math.round(decimalParsed * 60)} min`
                  : "—"}
              </Mono>
            </Row>
            <Row label="Seconds">
              <Mono>
                {isFinite(decimalParsed)
                  ? `${Math.round(decimalParsed * 3600).toLocaleString()} s`
                  : "—"}
              </Mono>
            </Row>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 4, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onDecimalChange(String(n))}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
              >
                {n} h
              </button>
            ))}
          </div>
        </Card>

        {/* ====================================================
            CLOCK-OUT PREDICTOR
            ==================================================== */}
        <Card title="Clock-out predictor">
          <p className="mb-3 text-sm text-gray-500">
            Based on a weekly goal, hours already worked, when you clocked
            in today, and your planned break.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Weekly goal (hours)"
              type="number"
              step="0.25"
              value={s.weeklyGoal}
              onChange={(v) => patch({ weeklyGoal: Number(v) || 0 })}
            />
            <div className="relative">
              <Field
                label="Hours worked this week"
                type="number"
                step="0.01"
                value={s.hoursWorked}
                onChange={(v) => patch({ hoursWorked: Number(v) || 0 })}
              />
              <button
                type="button"
                onClick={() => patch({ hoursWorked: Number(weekTotal.toFixed(2)) })}
                disabled={weekTotal === 0}
                className="absolute -top-1 right-0 text-[11px] font-semibold text-eng-navy hover:underline disabled:cursor-not-allowed disabled:text-gray-300"
                title="Pull total from the weekly timesheet below"
              >
                Use timesheet
              </button>
            </div>
            <Field
              label="Clock-in time today"
              type="time"
              value={s.clockIn}
              onChange={(v) => patch({ clockIn: v })}
            />
            <Field
              label="Break (minutes)"
              type="number"
              step="5"
              value={s.breakMin}
              onChange={(v) => patch({ breakMin: Number(v) || 0 })}
            />
          </div>

          <div className="mt-4 grid gap-2 rounded-xl bg-gray-50 p-4 text-sm">
            <Row label="Hours remaining">
              <Mono>
                {remaining > 0 ? `${remaining.toFixed(2)} h · ${formatHMLetters(remaining)}` : "Goal hit"}
              </Mono>
            </Row>
            <Row label="Clock-out (to hit goal today)">
              <Mono>
                {goalMet
                  ? "—"
                  : clockOutMin !== null
                    ? `${formatClock12(clockOutMin)}  (${formatClock24(clockOutMin)})`
                    : "—"}
              </Mono>
            </Row>
            <Row label="Hours so far today (live)">
              <Mono>
                {mounted && clockInMin !== null && nowMinutes(nowTick) >= clockInMin
                  ? `${liveHoursToday.toFixed(2)} h · ${formatHMLetters(liveHoursToday)}`
                  : "—"}
              </Mono>
            </Row>
          </div>

          {goalMet && (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              You&rsquo;ve hit (or passed) your weekly goal — {formatHMLetters(s.hoursWorked - s.weeklyGoal)} over.
            </p>
          )}
        </Card>

        {/* ====================================================
            DURATION BETWEEN TWO TIMES
            ==================================================== */}
        <Card title="Time between two times">
          <p className="mb-3 text-sm text-gray-500">
            Computes elapsed time — handles overnight ranges and an
            optional unpaid break.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="Start"
              type="time"
              value={s.durStart}
              onChange={(v) => patch({ durStart: v })}
            />
            <Field
              label="End"
              type="time"
              value={s.durEnd}
              onChange={(v) => patch({ durEnd: v })}
            />
            <Field
              label="Break (minutes)"
              type="number"
              step="5"
              value={s.durBreak}
              onChange={(v) => patch({ durBreak: Number(v) || 0 })}
            />
          </div>

          <div className="mt-4 grid gap-2 rounded-xl bg-gray-50 p-4 text-sm">
            <Row label="Gross duration">
              <Mono>
                {durRawMin !== null
                  ? `${(durRawMin / 60).toFixed(2)} h · ${formatHMLetters(durRawMin / 60)}`
                  : "—"}
              </Mono>
            </Row>
            <Row label="Net (after break)">
              <Mono>
                {isFinite(durNetHours)
                  ? `${durNetHours.toFixed(2)} h · ${formatHMLetters(durNetHours)}`
                  : "—"}
              </Mono>
            </Row>
            <Row label="Minutes (net)">
              <Mono>
                {isFinite(durNetHours)
                  ? `${Math.round(durNetHours * 60)} min`
                  : "—"}
              </Mono>
            </Row>
          </div>
        </Card>

        {/* ====================================================
            TIME ARITHMETIC
            ==================================================== */}
        <Card title="Time arithmetic">
          <p className="mb-3 text-sm text-gray-500">
            Add or subtract a duration from a time. Duration can be{" "}
            <code>4:30</code>, <code>4.5</code>, or <code>4h 30m</code>.
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_4rem_1fr]">
            <Field
              label="Time"
              type="time"
              value={s.arithBase}
              onChange={(v) => patch({ arithBase: v })}
            />
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Op</span>
              <select
                className={inputCls + " mt-1"}
                value={s.arithOp}
                onChange={(e) => patch({ arithOp: e.target.value as "+" | "-" })}
              >
                <option value="+">+</option>
                <option value="-">−</option>
              </select>
            </label>
            <Field
              label="Duration"
              value={s.arithDur}
              onChange={(v) => patch({ arithDur: v })}
              placeholder="7:30"
            />
          </div>

          <div className="mt-4 grid gap-2 rounded-xl bg-gray-50 p-4 text-sm">
            <Row label="Result (12 h)">
              <Mono>{arithResultMin !== null ? formatClock12(arithResultMin) : "—"}</Mono>
            </Row>
            <Row label="Result (24 h)">
              <Mono>{arithResultMin !== null ? formatClock24(arithResultMin) : "—"}</Mono>
            </Row>
            {arithResultMin !== null && (arithResultMin < 0 || arithResultMin >= 1440) && (
              <p className="text-xs text-eng-rust">
                Result crosses {arithResultMin < 0 ? "the previous day" : "midnight"}.
              </p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => patch({ arithBase: formatClock24(nowMinutes(new Date())) })}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
            >
              Use current time
            </button>
            {["0:15", "0:30", "1:00", "4:00", "7:30", "8:00"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => patch({ arithDur: d })}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-eng-amber/20 hover:text-eng-rust"
              >
                {d}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ====================================================
          WEEKLY TIMESHEET
          ==================================================== */}
      <div className="mt-6">
        <Card title="Weekly timesheet">
          <p className="mb-3 text-sm text-gray-500">
            Enter start, end, and break for each day. Daily and weekly totals
            update live; the weekly total can feed the clock-out predictor
            above.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-2 py-2">Day</th>
                  <th className="px-2 py-2">Start</th>
                  <th className="px-2 py-2">End</th>
                  <th className="px-2 py-2 text-right">Break (min)</th>
                  <th className="px-2 py-2 text-right">Hours</th>
                </tr>
              </thead>
              <tbody>
                {s.timesheet.map((d, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-2 py-2 font-semibold text-gray-700">
                      {WEEKDAYS[i]}
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="time"
                        value={d.start}
                        onChange={(e) => patchDay(i, { start: e.target.value })}
                        className={inputCls}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="time"
                        value={d.end}
                        onChange={(e) => patchDay(i, { end: e.target.value })}
                        className={inputCls}
                      />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <input
                        type="number"
                        step="5"
                        min={0}
                        value={d.breakMin}
                        onChange={(e) => patchDay(i, { breakMin: Number(e.target.value) || 0 })}
                        className={inputCls + " text-right"}
                      />
                    </td>
                    <td className="px-2 py-2 text-right font-mono">
                      <div>{dailyTotals[i] > 0 ? dailyTotals[i].toFixed(2) : "—"}</div>
                      <div className="text-[10px] text-gray-400">
                        {dailyTotals[i] > 0 ? formatHMLetters(dailyTotals[i]) : ""}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="px-2 py-2 font-semibold text-gray-700">Total</td>
                  <td className="px-2 py-2 text-xs text-gray-500" colSpan={3}>
                    Goal {s.weeklyGoal.toFixed(2)} h · OT after {s.otThreshold}h:{" "}
                    {weekOT > 0 ? `${weekOT.toFixed(2)} h` : "0"}
                  </td>
                  <td className="px-2 py-2 text-right font-mono font-semibold">
                    <div className="text-eng-navy">{weekTotal.toFixed(2)} h</div>
                    <div className="text-[10px] text-gray-500">{formatHMLetters(weekTotal)}</div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className={weekVsGoal >= 0 ? "text-emerald-700" : "text-eng-rust"}>
              {weekVsGoal >= 0
                ? `+${weekVsGoal.toFixed(2)} h over goal`
                : `${Math.abs(weekVsGoal).toFixed(2)} h under goal`}
            </span>
            <button
              type="button"
              onClick={() =>
                setS((x) => ({
                  ...x,
                  timesheet: WEEKDAYS.map(() => ({ start: "", end: "", breakMin: 0 })),
                }))
              }
              className="text-xs font-semibold text-eng-rust hover:underline"
            >
              Clear week
            </button>
            <button
              type="button"
              onClick={() =>
                setS((x) => ({
                  ...x,
                  timesheet: x.timesheet.map((d, i) =>
                    i >= 5 ? d : { start: "08:00", end: "17:00", breakMin: 60 },
                  ),
                }))
              }
              className="text-xs font-semibold text-eng-navy hover:underline"
            >
              Fill Mon–Fri 8–5 (1 h lunch)
            </button>
          </div>
        </Card>
      </div>

      {/* ====================================================
          PAY ESTIMATOR
          ==================================================== */}
      <div className="mt-6">
        <Card title="Gross pay estimator">
          <p className="mb-3 text-sm text-gray-500">
            Quick gross pay for a single week with overtime at a configurable
            threshold and multiplier. Withholdings &amp; taxes are not
            included.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Hourly rate ($)"
              type="number"
              step="0.01"
              value={s.payRate}
              onChange={(v) => patch({ payRate: Number(v) || 0 })}
            />
            <div className="relative">
              <Field
                label="Hours worked"
                type="number"
                step="0.25"
                value={s.payHours}
                onChange={(v) => patch({ payHours: Number(v) || 0 })}
              />
              <button
                type="button"
                onClick={() => patch({ payHours: Number(weekTotal.toFixed(2)) })}
                disabled={weekTotal === 0}
                className="absolute -top-1 right-0 text-[11px] font-semibold text-eng-navy hover:underline disabled:cursor-not-allowed disabled:text-gray-300"
              >
                Use timesheet
              </button>
            </div>
            <Field
              label="OT threshold (hours)"
              type="number"
              step="0.5"
              value={s.otThreshold}
              onChange={(v) => patch({ otThreshold: Number(v) || 0 })}
            />
            <Field
              label="OT multiplier"
              type="number"
              step="0.1"
              value={s.otMultiplier}
              onChange={(v) => patch({ otMultiplier: Number(v) || 1 })}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Regular" value={`$${regPay.toFixed(2)}`} sub={`${regHoursPay.toFixed(2)} h × $${s.payRate.toFixed(2)}`} />
            <Stat label="Overtime" value={`$${otPay.toFixed(2)}`} sub={otHoursPay > 0 ? `${otHoursPay.toFixed(2)} h × $${(s.payRate * s.otMultiplier).toFixed(2)}` : "no OT"} />
            <Stat label="Total" value={`$${totalPay.toFixed(2)}`} sub={`${s.payHours.toFixed(2)} h gross`} highlight />
          </div>
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
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
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " mt-1"}
      />
    </label>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-gray-900">{children}</span>;
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
        "rounded-xl p-4 " +
        (highlight ? "bg-eng-navy text-white" : "bg-gray-50 text-gray-700")
      }
    >
      <div className={"text-xs font-semibold uppercase tracking-wide " + (highlight ? "text-white/70" : "text-gray-500")}>
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold">{value}</div>
      {sub && (
        <div className={"mt-1 text-xs " + (highlight ? "text-white/70" : "text-gray-500")}>
          {sub}
        </div>
      )}
    </div>
  );
}
