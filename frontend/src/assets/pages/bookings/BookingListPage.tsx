import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { bookingApi } from "../../api/bookingApi";
import type { Booking } from "../../types/booking";

function formatDateTime(value: string | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

const BookingListPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [reviewedBy, setReviewedBy] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const [actionLoading, setActionLoading] = useState<"APPROVE" | "REJECT" | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadBookings() {
      setLoading(true);
      setError("");
      try {
        const data = await bookingApi.list();
        if (isMounted) {
          setBookings(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load bookings");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const aTime = new Date(a.createdAt ?? a.startTime ?? "").getTime();
      const bTime = new Date(b.createdAt ?? b.startTime ?? "").getTime();
      return bTime - aTime;
    });
  }, [bookings]);

  const bookingStats = useMemo(() => {
    const pending = sortedBookings.filter((booking) => booking.status.toUpperCase() === "PENDING").length;
    const approved = sortedBookings.filter((booking) => booking.status.toUpperCase() === "APPROVED").length;
    const cancelled = sortedBookings.filter((booking) => booking.status.toUpperCase() === "CANCELLED").length;
    return [
      { title: "Student Bookings", value: sortedBookings.length, subtitle: "All submitted booking requests" },
      { title: "Pending Approval", value: pending, subtitle: "Awaiting admin review" },
      { title: "Approved", value: approved, subtitle: "Ready and confirmed" },
      { title: "Cancelled", value: cancelled, subtitle: "Not moving forward" },
    ];
  }, [sortedBookings]);

  async function openBookingDetails(bookingId: number) {
    setSelectedBookingId(bookingId);
    setSelectedBooking(null);
    setModalError("");
    setReviewReason("");
    setReviewedBy("");
    setModalLoading(true);
    try {
      const booking = await bookingApi.getById(bookingId);
      setSelectedBooking(booking);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to load booking details");
    } finally {
      setModalLoading(false);
    }
  }

  function closeBookingModal() {
    setSelectedBookingId(null);
    setSelectedBooking(null);
    setModalError("");
    setReviewReason("");
    setReviewedBy("");
    setActionLoading(null);
  }

  async function handleBookingAction(action: "APPROVE" | "REJECT") {
    if (!selectedBookingId) return;

    if (action === "REJECT" && reviewReason.trim().length === 0) {
      setModalError("Please provide a reason when rejecting a booking.");
      return;
    }

    setModalError("");
    setActionLoading(action);
    try {
      const parsedReviewedBy = reviewedBy.trim().length > 0 ? Number(reviewedBy.trim()) : undefined;
      const reviewerId = Number.isFinite(parsedReviewedBy) ? parsedReviewedBy : undefined;
      const updatedBooking =
        action === "APPROVE"
          ? await bookingApi.approve(selectedBookingId, reviewerId, reviewReason)
          : await bookingApi.reject(selectedBookingId, reviewerId, reviewReason);

      setBookings((current) =>
        current.map((booking) => (booking.bookingId === updatedBooking.bookingId ? updatedBooking : booking)),
      );
      setSelectedBooking(updatedBooking);
      if (action === "APPROVE") {
        setReviewReason("");
      }
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to update booking status");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="dashboard-grid admin-dashboard-page">
        <section className="hero-panel">
          <div>
            <p className="hero-eyebrow">Booking workspace</p>
            <h1>Student booking requests</h1>
            <p className="hero-description">Review all bookings submitted by students in one queue.</p>
          </div>
        </section>

        <div className="stats-grid">
          {bookingStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <section className="panel modern-panel">
          <div className="panel-header-row">
            <div>
              <h3>All Student Bookings</h3>
              <p className="panel-subtitle">Total requests: {sortedBookings.length}</p>
            </div>
          </div>

          {loading ? <p>Loading bookings...</p> : null}
          {error ? <p className="error-text">{error}</p> : null}

          {!loading && !error ? (
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Student ID</th>
                  <th>Resource ID</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No bookings found.</td>
                  </tr>
                ) : (
                  sortedBookings.map((booking) => (
                    <tr key={booking.bookingId}>
                      <td>#{booking.bookingId}</td>
                      <td>{booking.userId}</td>
                      <td>{booking.resourceId}</td>
                      <td>{formatDateTime(booking.startTime)}</td>
                      <td>{formatDateTime(booking.endTime)}</td>
                      <td>
                        <StatusBadge status={booking.status} />
                      </td>
                      <td>
                        <button
                          className="secondary-btn"
                          type="button"
                          onClick={() => void openBookingDetails(booking.bookingId)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : null}
        </section>
      </div>

      {selectedBookingId !== null ? (
        <div className="booking-modal-backdrop" role="presentation" onClick={closeBookingModal}>
          <section className="booking-modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header-row">
              <div>
                <h3>Booking details</h3>
                <p className="panel-subtitle">Review full request and take action</p>
              </div>
              <button className="ghost-btn" type="button" onClick={closeBookingModal}>
                Close
              </button>
            </div>

            {modalLoading ? <p>Loading booking details...</p> : null}
            {modalError ? <p className="error-text booking-modal-error">{modalError}</p> : null}

            {!modalLoading && selectedBooking ? (
              <div className="booking-modal-details">
                <p>
                  <strong>Booking ID:</strong> #{selectedBooking.bookingId}
                </p>
                <p>
                  <strong>Student ID:</strong> {selectedBooking.userId}
                </p>
                <p>
                  <strong>Resource ID:</strong> {selectedBooking.resourceId}
                </p>
                <p>
                  <strong>Status:</strong> <StatusBadge status={selectedBooking.status} />
                </p>
                <p>
                  <strong>Booking Date:</strong> {selectedBooking.bookingDate ?? "-"}
                </p>
                <p>
                  <strong>Start:</strong> {formatDateTime(selectedBooking.startTime)}
                </p>
                <p>
                  <strong>End:</strong> {formatDateTime(selectedBooking.endTime)}
                </p>
                <p>
                  <strong>Expected Attendees:</strong> {selectedBooking.expectedAttendees ?? "-"}
                </p>
                <p className="booking-modal-purpose">
                  <strong>Purpose:</strong> {selectedBooking.purpose || "-"}
                </p>

                <div className="booking-modal-inputs">
                  <label>
                    Reviewed By (Admin ID)
                    <input
                      className="input-control"
                      type="number"
                      min={1}
                      value={reviewedBy}
                      onChange={(event) => setReviewedBy(event.target.value)}
                      placeholder="Optional"
                    />
                  </label>

                  <label>
                    Review Reason
                    <textarea
                      className="input-control textarea-control"
                      value={reviewReason}
                      onChange={(event) => setReviewReason(event.target.value)}
                      placeholder="Required for reject, optional for approve"
                    />
                  </label>
                </div>

                <div className="booking-modal-actions">
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={actionLoading !== null}
                    onClick={() => void handleBookingAction("APPROVE")}
                  >
                    {actionLoading === "APPROVE" ? "Accepting..." : "Accept"}
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    disabled={actionLoading !== null}
                    onClick={() => void handleBookingAction("REJECT")}
                  >
                    {actionLoading === "REJECT" ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default BookingListPage;
