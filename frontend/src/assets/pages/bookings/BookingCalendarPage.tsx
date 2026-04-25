import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { bookingApi } from "../../api/bookingApi";
import { resourceApi } from "../../api/resourceApi";
import { addMonths, buildMonthGrid, parseBackendLocalDateTime, startOfMonth, toDayKey } from "../../lib/bookingDates";
import type { Booking } from "../../types/booking";
import type { Resource } from "../../types/resource";
import "./bookingCalendarPage.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTimeRange(startIso: string, endIso: string): string {
  const s = parseBackendLocalDateTime(startIso);
  const e = parseBackendLocalDateTime(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${s.toLocaleTimeString(undefined, opts)} – ${e.toLocaleTimeString(undefined, opts)}`;
}

function statusTone(status: string): string {
  const u = status.toUpperCase();
  if (u === "APPROVED") return "approved";
  if (u === "PENDING") return "pending";
  if (u === "REJECTED") return "rejected";
  if (u === "CANCELLED") return "cancelled";
  return "default";
}

const BookingCalendarPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(() => toDayKey(new Date()));

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [b, r] = await Promise.all([bookingApi.list(), resourceApi.list()]);
      setBookings(b);
      setResources(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resourceName = useMemo(() => {
    const map = new Map<number, string>();
    for (const res of resources) {
      map.set(res.resourceId, res.resourceName || res.resourceCode);
    }
    return (id: number) => map.get(id) ?? `Resource #${id}`;
  }, [resources]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const start = parseBackendLocalDateTime(b.startTime);
      if (Number.isNaN(start.getTime())) continue;
      const key = toDayKey(start);
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list);
    }
    for (const [, list] of map) {
      list.sort((a, c) => parseBackendLocalDateTime(a.startTime).getTime() - parseBackendLocalDateTime(c.startTime).getTime());
    }
    return map;
  }, [bookings]);

  const monthLabel = useMemo(
    () =>
      visibleMonth.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [visibleMonth],
  );

  const grid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  const todayKey = toDayKey(new Date());

  const selectedBookings = selectedDayKey ? (bookingsByDay.get(selectedDayKey) ?? []) : [];

  function goPrevMonth() {
    setVisibleMonth((m) => addMonths(m, -1));
  }

  function goNextMonth() {
    setVisibleMonth((m) => addMonths(m, 1));
  }

  function goThisMonth() {
    const now = new Date();
    setVisibleMonth(startOfMonth(now));
    setSelectedDayKey(toDayKey(now));
  }

  return (
    <DashboardLayout>
      <div className="dashboard-grid booking-cal-page">
        <section className="hero-panel">
          <div>
            <p className="hero-eyebrow">Schedule</p>
            <h1>Booking calendar</h1>
            <p className="hero-description">
              Your reservations by day and time. Admins see all campus bookings.{" "}
              <Link to="/">Dashboard</Link>
              {" · "}
              <Link to="/bookings">Table view</Link>
            </p>
          </div>
        </section>

        <div className="booking-cal-layout">
          <section className="panel modern-panel booking-cal-panel">
            <div className="booking-cal-toolbar">
              <div className="booking-cal-nav">
                <button type="button" className="secondary-btn" onClick={goPrevMonth} aria-label="Previous month">
                  ←
                </button>
                <h2 className="booking-cal-month-title">{monthLabel}</h2>
                <button type="button" className="secondary-btn" onClick={goNextMonth} aria-label="Next month">
                  →
                </button>
              </div>
              <button type="button" className="ghost-btn" onClick={goThisMonth}>
                Today
              </button>
            </div>

            {loading ? <p className="booking-cal-muted">Loading…</p> : null}
            {error ? <p className="error-text">{error}</p> : null}

            <div className="booking-cal-legend" aria-hidden>
              <span>
                <i className="booking-cal-dot booking-cal-dot--approved" /> Approved
              </span>
              <span>
                <i className="booking-cal-dot booking-cal-dot--pending" /> Pending
              </span>
              <span>
                <i className="booking-cal-dot booking-cal-dot--rejected" /> Rejected
              </span>
              <span>
                <i className="booking-cal-dot booking-cal-dot--cancelled" /> Cancelled
              </span>
            </div>

            <div className="booking-cal-weekdays">
              {WEEKDAYS.map((d) => (
                <div key={d} className="booking-cal-weekday">
                  {d}
                </div>
              ))}
            </div>

            <div className="booking-cal-grid">
              {grid.map(({ date, inMonth }) => {
                const key = toDayKey(date);
                const dayBookings = bookingsByDay.get(key) ?? [];
                const isToday = key === todayKey;
                const isSelected = key === selectedDayKey;
                const show = dayBookings.slice(0, 3);
                const more = dayBookings.length - show.length;

                return (
                  <button
                    key={key}
                    type="button"
                    className={[
                      "booking-cal-cell",
                      !inMonth ? "booking-cal-cell--muted" : "",
                      isToday ? "booking-cal-cell--today" : "",
                      isSelected ? "booking-cal-cell--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setSelectedDayKey(key)}
                  >
                    <span className="booking-cal-daynum">{date.getDate()}</span>
                    <span className="booking-cal-chips" aria-hidden>
                      {show.map((b) => (
                        <i
                          key={b.bookingId}
                          className={`booking-cal-dot booking-cal-dot--${statusTone(b.status)}`}
                          title={`${resourceName(b.resourceId)} · ${b.status}`}
                        />
                      ))}
                      {more > 0 ? <span className="booking-cal-more">+{more}</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel modern-panel booking-cal-detail">
            <h3 className="booking-cal-detail-title">
              {selectedDayKey
                ? new Date(selectedDayKey + "T12:00:00").toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Pick a day"}
            </h3>
            {!selectedDayKey ? (
              <p className="booking-cal-muted">Click a date on the calendar.</p>
            ) : selectedBookings.length === 0 ? (
              <p className="booking-cal-muted">No bookings on this day.</p>
            ) : (
              <ul className="booking-cal-list">
                {selectedBookings.map((b) => (
                  <li key={b.bookingId} className={`booking-cal-card booking-cal-card--${statusTone(b.status)}`}>
                    <div className="booking-cal-card-head">
                      <span className="booking-cal-time">{formatTimeRange(b.startTime, b.endTime)}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="booking-cal-resource">{resourceName(b.resourceId)}</p>
                    {b.purpose ? <p className="booking-cal-purpose">{b.purpose}</p> : null}
                    <Link className="booking-cal-link" to={`/resources/${b.resourceId}`}>
                      View resource
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingCalendarPage;
