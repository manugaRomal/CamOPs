import { useEffect, useState } from "react";
import "./SlaTimer.css";
import {
  formatElapsedClock,
  formatResolvedDuration,
  getSlaHours,
  getSlaZone,
  isTerminalStatus,
  parseIsoMs,
} from "../../lib/slaUtils";

type SlaTimerProps = {
  createdAt: string | null | undefined;
  resolvedAt: string | null | undefined;
  priority: string;
  status: string;
  /** Wider card on detail vs single line in list */
  variant?: "full" | "compact";
  /** When set (e.g. from a parent `Date.now()` tick for tables), the internal 1s timer is not used. */
  nowMs?: number;
};

const SLA_LABEL = "SLA";

const SlaTimer = ({ createdAt, resolvedAt, priority, status, variant = "full", nowMs: nowMsProp }: SlaTimerProps) => {
  const [localNow, setLocalNow] = useState(() => Date.now());
  const slaHours = getSlaHours(priority);
  const slaMs = slaHours * 3600 * 1000;
  const terminal = isTerminalStatus(status);
  const createdMs = parseIsoMs(createdAt);
  const resolvedMs = parseIsoMs(resolvedAt);
  const now = nowMsProp !== undefined ? nowMsProp : localNow;

  useEffect(() => {
    if (nowMsProp !== undefined || terminal || Number.isNaN(createdMs)) {
      return;
    }
    const id = window.setInterval(() => setLocalNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [nowMsProp, terminal, createdMs]);

  if (Number.isNaN(createdMs)) {
    return null;
  }

  if (terminal) {
    const hasEnd = !Number.isNaN(resolvedMs) && createdAt && resolvedAt;
    const label = hasEnd ? formatResolvedDuration(createdAt, resolvedAt) : "Closed";
    return (
      <div className={variant === "compact" ? "sla-timer sla-timer--compact" : "sla-timer"} data-sla="done">
        <div className="sla-timer-header">
          <span className="sla-timer-icon" aria-hidden>
            ⏱
          </span>
          <span className="sla-timer-title">{SLA_LABEL}</span>
        </div>
        <p className="sla-timer-resolved-text">{label}</p>
        {hasEnd ? (
          <p className="sla-timer-meta">
            Target was {slaHours}h from priority {priority}
          </p>
        ) : null}
      </div>
    );
  }

  const elapsed = now - createdMs;
  const usedRatio = Math.min(1, elapsed / slaMs);
  const barPct = Math.min(100, usedRatio * 100);
  const zone = getSlaZone(elapsed, slaMs);
  const remainingMs = Math.max(0, slaMs - elapsed);

  return (
    <div className={variant === "compact" ? "sla-timer sla-timer--compact" : "sla-timer"} data-sla={zone}>
      <div className="sla-timer-header">
        <span className="sla-timer-icon" aria-hidden>
          ⏱
        </span>
        <span className="sla-timer-title">{SLA_LABEL}</span>
        {variant === "full" ? <span className="sla-timer-target">Target: {slaHours}h</span> : <span className="sla-timer-target">{slaHours}h</span>}
      </div>
      <div className="sla-timer-readout" aria-live="polite">
        <span className="sla-timer-elapsed">Elapsed: {formatElapsedClock(elapsed)}</span>
        {zone === "breach" ? (
          <span className="sla-timer-breach">SLA BREACHED</span>
        ) : (
          <span className="sla-timer-remaining">· {formatElapsedClock(remainingMs)} left</span>
        )}
      </div>
      <div
        className={`sla-timer-track sla-timer-track--${zone}`}
        role="progressbar"
        aria-valuenow={Math.round(barPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`SLA progress ${Math.round(barPct)} percent`}
      >
        <div className="sla-timer-fill" style={{ width: `${barPct}%` }} />
      </div>
      {variant === "full" ? (
        <p className="sla-timer-legend">
          {zone === "ok" && "Within SLA — on track."}
          {zone === "warning" && "75%+ of time used — at risk."}
          {zone === "breach" && "Time limit exceeded — escalate or update stakeholders."}
        </p>
      ) : null}
    </div>
  );
};

export default SlaTimer;
