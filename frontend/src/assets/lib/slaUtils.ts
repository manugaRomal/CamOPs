/**
 * Ticket SLA target from creation (in hours). Aligned with product rules.
 */
export const SLA_HOURS_BY_PRIORITY: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 24,
  MEDIUM: 48,
  LOW: 72,
};

const DEFAULT_HOURS = SLA_HOURS_BY_PRIORITY.MEDIUM;

export function getSlaHours(priority: string | null | undefined): number {
  if (!priority) {
    return DEFAULT_HOURS;
  }
  const k = priority.trim().toUpperCase();
  return SLA_HOURS_BY_PRIORITY[k] ?? DEFAULT_HOURS;
}

export function isTerminalStatus(status: string | null | undefined): boolean {
  if (!status) {
    return false;
  }
  const u = status.toUpperCase();
  return u === "RESOLVED" || u === "CLOSED";
}

/** MS from start to end (e.g. created → resolved). */
export function parseIsoMs(iso: string | null | undefined): number {
  if (!iso) {
    return NaN;
  }
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? NaN : t;
}

export function formatResolvedDuration(createdAt: string, resolvedAt: string): string {
  const start = parseIsoMs(createdAt);
  const end = parseIsoMs(resolvedAt);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return "Resolved";
  }
  const ms = end - start;
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const min = m % 60;
  const sec = Math.floor((ms % 60000) / 1000);
  if (h < 1) {
    if (m < 1) {
      return `Resolved in ${sec}s`;
    }
    return `Resolved in ${m} min`;
  }
  if (h < 24) {
    if (min === 0) {
      return `Resolved in ${h} hour${h === 1 ? "" : "s"}`;
    }
    return `Resolved in ${h}h ${min}m`;
  }
  const d = Math.floor(h / 24);
  const remH = h % 24;
  if (remH === 0) {
    return `Resolved in ${d} day${d === 1 ? "" : "s"}`;
  }
  return `Resolved in ${d}d ${remH}h`;
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

export function formatElapsedClock(totalMs: number): string {
  if (totalMs < 0) {
    totalMs = 0;
  }
  const s = Math.floor(totalMs / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h >= 100) {
    return `${h}h ${pad2(m)}m ${pad2(sec)}s`;
  }
  return h > 0
    ? `${h}h ${pad2(m)}m ${pad2(sec)}s`
    : m > 0
      ? `${m}m ${pad2(sec)}s`
      : `${sec}s`;
}

export type SlaZone = "ok" | "warning" | "breach";

export function getSlaZone(elapsedMs: number, slaMs: number): SlaZone {
  if (elapsedMs >= slaMs) {
    return "breach";
  }
  if (elapsedMs >= slaMs * 0.75) {
    return "warning";
  }
  return "ok";
}
