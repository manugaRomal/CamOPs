import { useState, useEffect } from "react";

interface SLATimerProps {
  createdAt: string;
  priority: string;
  status: string;
  resolvedAt?: string;
}

const SLA_LIMITS: Record<string, number> = {
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  CRITICAL: 4,
};

const SLATimer = ({ createdAt, priority, status, resolvedAt }: SLATimerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const endTime = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
    const startTime = new Date(createdAt).getTime();
    setElapsed(Math.floor((endTime - startTime) / 1000));

    if (status === "RESOLVED" || status === "CLOSED" || status === "REJECTED") return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, resolvedAt, status]);

  const slaLimitHours = SLA_LIMITS[priority] ?? 48;
  const slaLimitSeconds = slaLimitHours * 3600;
  const percentage = Math.min((elapsed / slaLimitSeconds) * 100, 100);
  const isBreached = elapsed > slaLimitSeconds;
  const isWarning = percentage >= 75 && !isBreached;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const getColor = () => {
    if (isBreached) return "#e74c3c";
    if (isWarning) return "#f39c12";
    return "#27ae60";
  };

  const getLabel = () => {
    if (status === "RESOLVED" || status === "CLOSED") return "Resolved in";
    if (status === "REJECTED") return "Closed in";
    if (isBreached) return "SLA BREACHED";
    if (isWarning) return "SLA Warning";
    return "Time Elapsed";
  };

  return (
    <div style={{
      marginTop: "1rem",
      padding: "0.8rem 1rem",
      borderRadius: "8px",
      border: `1px solid ${getColor()}33`,
      backgroundColor: `${getColor()}11`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: "700", color: getColor() }}>
          ⏱ {getLabel()}
        </span>
        <span style={{ fontSize: "0.9rem", fontWeight: "700", color: getColor() }}>
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ backgroundColor: "#e0e0e0", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
        <div style={{
          width: `${percentage}%`,
          height: "100%",
          backgroundColor: getColor(),
          borderRadius: "4px",
          transition: "width 1s linear",
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
        <span style={{ fontSize: "0.72rem", color: "#999" }}>0h</span>
        <span style={{ fontSize: "0.72rem", color: "#999" }}>SLA: {slaLimitHours}h</span>
      </div>
    </div>
  );
};

export default SLATimer;