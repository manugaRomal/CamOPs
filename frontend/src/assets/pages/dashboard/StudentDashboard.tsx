import { useEffect, useMemo, useState, type FormEvent } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { bookingApi, isBookingConflictError } from "../../api/bookingApi";
import { resourceApi } from "../../api/resourceApi";
import type { Booking, BookingConflictSuggestion } from "../../types/booking";
import type { Resource } from "../../types/resource";

type BookingForm = {
  resourceId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: string;
};

const initialForm: BookingForm = {
  resourceId: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: "",
};

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Calendar date in local time (for bookingDate) — avoids UTC shift from toISOString(). */
function toLocalYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Local wall-clock time for API (matches backend LocalDateTime). */
function toLocalDateTimeHms(d: Date): string {
  return `${toLocalYmd(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

/** value for <input type="datetime-local" /> from a Date in local time */
function toDatetimeLocalValue(d: Date): string {
  return `${toLocalYmd(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Parse backend LocalDateTime string as local wall clock (e.g. 2026-04-25T14:00:00)
 * so it matches the same instant users see in datetime-local.
 */
function parseBackendLocalDateTime(iso: string): Date {
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

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatBackendSuggestionLine(startIso: string, endIso: string): string {
  const s = parseBackendLocalDateTime(startIso);
  const e = parseBackendLocalDateTime(endIso);
  const a = Number.isNaN(s.getTime()) ? startIso : s.toLocaleString();
  const b = Number.isNaN(e.getTime()) ? endIso : e.toLocaleString();
  return `${a} – ${b}`;
}

const StudentDashboard = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [cancelReasonByBookingId, setCancelReasonByBookingId] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [conflictSuggestion, setConflictSuggestion] = useState<BookingConflictSuggestion | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [resourceData, bookingData] = await Promise.all([resourceApi.list(), bookingApi.list()]);
        if (!mounted) return;
        setResources(resourceData);
        setBookings(bookingData);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load student dashboard data");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [bookings]);

  const dashboardStats = useMemo(() => {
    const total = sortedBookings.length;
    const pending = sortedBookings.filter((booking) => booking.status.toUpperCase() === "PENDING").length;
    const approved = sortedBookings.filter((booking) => booking.status.toUpperCase() === "APPROVED").length;
    const cancelled = sortedBookings.filter((booking) => booking.status.toUpperCase() === "CANCELLED").length;
    return [
      { title: "My Total Bookings", value: total, subtitle: "All requests submitted by you" },
      { title: "Pending", value: pending, subtitle: "Waiting for admin review" },
      { title: "Approved", value: approved, subtitle: "Confirmed bookings" },
      { title: "Cancelled", value: cancelled, subtitle: "Bookings you cancelled" },
    ];
  }, [sortedBookings]);

  function getResourceName(resourceId: number): string {
    const resource = resources.find((item) => item.resourceId === resourceId);
    return resource ? `${resource.resourceName} (${resource.resourceCode})` : `Resource #${resourceId}`;
  }

  function handleFieldChange<K extends keyof BookingForm>(field: K, value: BookingForm[K]) {
    setConflictSuggestion(null);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function applySuggestedSlot(suggestion: BookingConflictSuggestion) {
    const start = parseBackendLocalDateTime(suggestion.suggestedStartTime);
    const end = parseBackendLocalDateTime(suggestion.suggestedEndTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return;
    }
    setForm((current) => ({
      ...current,
      startTime: toDatetimeLocalValue(start),
      endTime: toDatetimeLocalValue(end),
    }));
    setConflictSuggestion(null);
    setFormError("");
  }

  function applyAlternativeResource(resourceId: number) {
    setForm((current) => ({ ...current, resourceId: String(resourceId) }));
    setConflictSuggestion(null);
    setFormError("");
  }

  async function handleCreateBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const resourceId = Number(form.resourceId);
    const startDate = new Date(form.startTime);
    const endDate = new Date(form.endTime);
    const attendees = form.expectedAttendees.trim().length > 0 ? Number(form.expectedAttendees) : undefined;

    if (!Number.isFinite(resourceId) || resourceId <= 0) {
      setFormError("Please select a valid resource.");
      return;
    }
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setFormError("Please provide valid start and end time.");
      return;
    }
    if (endDate <= startDate) {
      setFormError("End time must be after start time.");
      return;
    }
    if (!form.purpose.trim()) {
      setFormError("Purpose is required.");
      return;
    }
    if (typeof attendees === "number" && (!Number.isFinite(attendees) || attendees <= 0)) {
      setFormError("Expected attendees must be greater than 0.");
      return;
    }

    setSubmitting(true);
    setConflictSuggestion(null);
    try {
      const created = await bookingApi.create({
        resourceId,
        bookingDate: toLocalYmd(startDate),
        startTime: toLocalDateTimeHms(startDate),
        endTime: toLocalDateTimeHms(endDate),
        purpose: form.purpose.trim(),
        expectedAttendees: attendees,
      });
      setBookings((current) => [created, ...current]);
      setForm(initialForm);
      setSuccessMessage("Booking request submitted successfully.");
    } catch (err) {
      if (isBookingConflictError(err)) {
        setConflictSuggestion(err.suggestion);
        setFormError(err.message);
      } else {
        setFormError(err instanceof Error ? err.message : "Failed to create booking");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelBooking(bookingId: number) {
    setSuccessMessage("");
    setError("");
    setCancellingBookingId(bookingId);
    try {
      const updated = await bookingApi.cancel(bookingId, cancelReasonByBookingId[bookingId]);
      setBookings((current) => current.map((item) => (item.bookingId === bookingId ? updated : item)));
      setCancelReasonByBookingId((current) => ({ ...current, [bookingId]: "" }));
      setSuccessMessage(`Booking #${bookingId} cancelled.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancellingBookingId(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="dashboard-grid admin-dashboard-page">
        <section className="hero-panel">
          <div>
            <p className="hero-eyebrow">Student workspace</p>
            <h1>Manage your bookings</h1>
            <p className="hero-description">Create booking requests and cancel pending or approved ones when plans change.</p>
          </div>
        </section>

        <div className="stats-grid">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <section className="panel modern-panel">
          <div className="panel-header-row">
            <div>
              <h3>Create booking</h3>
              <p className="panel-subtitle">Submit a new request for a room or resource.</p>
            </div>
          </div>

          <form className="student-booking-form" onSubmit={handleCreateBooking}>
            <div className="form-group">
              <label className="field-label" htmlFor="resource-select">
                Resource
              </label>
              <select
                id="resource-select"
                className="input-control modern-input"
                value={form.resourceId}
                onChange={(event) => handleFieldChange("resourceId", event.target.value)}
                required
              >
                <option value="">Select resource</option>
                {resources.map((resource) => (
                  <option key={resource.resourceId} value={resource.resourceId}>
                    {resource.resourceName} ({resource.resourceCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="start-time">
                Start time
              </label>
              <input
                id="start-time"
                className="input-control modern-input"
                type="datetime-local"
                value={form.startTime}
                onChange={(event) => handleFieldChange("startTime", event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="end-time">
                End time
              </label>
              <input
                id="end-time"
                className="input-control modern-input"
                type="datetime-local"
                value={form.endTime}
                onChange={(event) => handleFieldChange("endTime", event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="expected-attendees">
                Expected attendees
              </label>
              <input
                id="expected-attendees"
                className="input-control modern-input"
                type="number"
                min={1}
                value={form.expectedAttendees}
                onChange={(event) => handleFieldChange("expectedAttendees", event.target.value)}
              />
            </div>

            <div className="form-group student-form-full-width">
              <label className="field-label" htmlFor="booking-purpose">
                Purpose
              </label>
              <textarea
                id="booking-purpose"
                className="input-control textarea-control"
                value={form.purpose}
                onChange={(event) => handleFieldChange("purpose", event.target.value)}
                required
              />
            </div>

            <div className="student-form-actions student-form-full-width">
              <button className="primary-btn" type="submit" disabled={submitting || loading}>
                {submitting ? "Submitting..." : "Create Booking"}
              </button>
            </div>
          </form>

          {conflictSuggestion &&
          (conflictSuggestion.suggestedStartTime ||
            conflictSuggestion.suggestedEndTime ||
            (conflictSuggestion.alternativeResources?.length ?? 0) > 0) ? (
            <div className="booking-smart-suggestion" role="region" aria-label="Smart scheduling suggestions">
              <h4 className="booking-smart-suggestion-title">This slot is not available</h4>
              <p className="booking-smart-suggestion-lead">Try one of the options below, then submit again.</p>
              {conflictSuggestion.suggestedStartTime && conflictSuggestion.suggestedEndTime ? (
                <div className="booking-smart-suggestion-block">
                  <p className="booking-smart-suggestion-label">Next available with the same duration</p>
                  <p className="booking-smart-suggestion-time">
                    {formatBackendSuggestionLine(
                      conflictSuggestion.suggestedStartTime,
                      conflictSuggestion.suggestedEndTime
                    )}
                  </p>
                  <button
                    className="secondary-btn booking-smart-suggestion-btn"
                    type="button"
                    onClick={() => applySuggestedSlot(conflictSuggestion)}
                  >
                    Use suggested time
                  </button>
                </div>
              ) : null}
              {conflictSuggestion.alternativeResources && conflictSuggestion.alternativeResources.length > 0 ? (
                <div className="booking-smart-suggestion-block">
                  <p className="booking-smart-suggestion-label">Same time, other resources that fit your group</p>
                  <ul className="booking-smart-alt-list">
                    {conflictSuggestion.alternativeResources.map((alt) => (
                      <li key={alt.resourceId}>
                        <div className="booking-smart-alt-line">
                          <span className="booking-smart-alt-name">
                            {alt.resourceName}{" "}
                            <span className="booking-smart-alt-meta">
                              ({alt.resourceCode}
                              {alt.location ? ` · ${alt.location}` : ""}
                              {alt.capacity != null ? ` · cap. ${alt.capacity}` : ""})
                            </span>
                          </span>
                          <button
                            className="secondary-btn"
                            type="button"
                            onClick={() => applyAlternativeResource(alt.resourceId)}
                          >
                            Use this resource
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {formError ? <p className="error-text">{formError}</p> : null}
          {successMessage ? <p className="success-text">{successMessage}</p> : null}
        </section>

        <section className="panel modern-panel">
          <div className="panel-header-row">
            <div>
              <h3>My bookings</h3>
              <p className="panel-subtitle">You can cancel bookings from this list.</p>
            </div>
          </div>

          {loading ? <p>Loading your bookings...</p> : null}
          {error ? <p className="error-text">{error}</p> : null}

          {!loading ? (
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Resource</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Cancel</th>
                </tr>
              </thead>
              <tbody>
                {sortedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No bookings created yet.</td>
                  </tr>
                ) : (
                  sortedBookings.map((booking) => {
                    const canCancel = !["CANCELLED", "REJECTED"].includes(booking.status.toUpperCase());
                    return (
                      <tr key={booking.bookingId}>
                        <td>#{booking.bookingId}</td>
                        <td>{getResourceName(booking.resourceId)}</td>
                        <td>{formatDateTime(booking.startTime)}</td>
                        <td>{formatDateTime(booking.endTime)}</td>
                        <td>
                          <StatusBadge status={booking.status} />
                        </td>
                        <td>
                          {canCancel ? (
                            <div className="student-cancel-box">
                              <input
                                className="input-control"
                                type="text"
                                placeholder="Optional reason"
                                value={cancelReasonByBookingId[booking.bookingId] ?? ""}
                                onChange={(event) =>
                                  setCancelReasonByBookingId((current) => ({
                                    ...current,
                                    [booking.bookingId]: event.target.value,
                                  }))
                                }
                              />
                              <button
                                className="secondary-btn"
                                type="button"
                                disabled={cancellingBookingId === booking.bookingId}
                                onClick={() => void handleCancelBooking(booking.bookingId)}
                              >
                                {cancellingBookingId === booking.bookingId ? "Cancelling..." : "Cancel"}
                              </button>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : null}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
