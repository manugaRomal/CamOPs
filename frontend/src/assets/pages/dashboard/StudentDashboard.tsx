import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { bookingApi } from "../../api/bookingApi";
import { resourceApi } from "../../api/resourceApi";
import type { Booking } from "../../types/booking";
import type { Resource } from "../../types/resource";

const DEFAULT_STUDENT_ID = 1001;

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

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

const StudentDashboard = () => {
  const [studentId, setStudentId] = useState<number>(DEFAULT_STUDENT_ID);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [cancelReasonByBookingId, setCancelReasonByBookingId] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [resourceData, bookingData] = await Promise.all([resourceApi.list(), bookingApi.list(studentId)]);
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
  }, [studentId]);

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
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateBooking(event: React.FormEvent<HTMLFormElement>) {
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
    try {
      const created = await bookingApi.create({
        userId: studentId,
        resourceId,
        bookingDate: startDate.toISOString().slice(0, 10),
        startTime: startDate.toISOString().slice(0, 19),
        endTime: endDate.toISOString().slice(0, 19),
        purpose: form.purpose.trim(),
        expectedAttendees: attendees,
      });
      setBookings((current) => [created, ...current]);
      setForm(initialForm);
      setSuccessMessage("Booking request submitted successfully.");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelBooking(bookingId: number) {
    setSuccessMessage("");
    setError("");
    setCancellingBookingId(bookingId);
    try {
      const updated = await bookingApi.cancel(bookingId, studentId, cancelReasonByBookingId[bookingId]);
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
    <DashboardLayout role="STUDENT">
      <div className="dashboard-grid admin-dashboard-page">
        <section className="hero-panel">
          <div>
            <p className="hero-eyebrow">Student workspace</p>
            <h1>Manage your bookings</h1>
            <p className="hero-description">Create booking requests and cancel pending or approved ones when plans change.</p>
          </div>
        </section>

        <section className="panel modern-panel student-id-panel">
          <div className="form-group">
            <label className="field-label" htmlFor="student-id-input">
              Student ID (Temporary until login is added)
            </label>
            <input
              id="student-id-input"
              className="input-control modern-input"
              type="number"
              min={1}
              value={studentId}
              onChange={(event) => setStudentId(Number(event.target.value) || DEFAULT_STUDENT_ID)}
            />
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
