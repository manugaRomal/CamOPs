/**
 * Parse backend LocalDateTime as local wall clock (e.g. 2026-04-25T14:00:00).
 */
export function parseBackendLocalDateTime(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(iso.trim());
  if (!m) return new Date(iso);
  const y = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  const s = m[6] != null ? Number(m[6]) : 0;
  return new Date(y, month, day, h, mi, s);
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Local calendar day key for grouping (YYYY-MM-DD). */
export function toDayKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** First day of month for a date. */
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

/** 42 cells: Sunday-start week rows for the month containing `monthAnchor`. */
export function buildMonthGrid(monthAnchor: Date): { date: Date; inMonth: boolean }[] {
  const y = monthAnchor.getFullYear();
  const m = monthAnchor.getMonth();
  const first = new Date(y, m, 1);
  const start = new Date(y, m, 1 - first.getDay());
  const out: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    out.push({ date, inMonth: date.getMonth() === m });
  }
  return out;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
