import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { notificationsApi } from "../../api/notificationsApi";
import type { AppNotification } from "../../types/notification";

function formatTime(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

const NotificationsPage = () => {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await notificationsApi.list();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleMarkRead(id: number) {
    setActionLoading(true);
    try {
      await notificationsApi.markRead(id);
      setItems((current) =>
        current.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark as read");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkAll() {
    setActionLoading(true);
    try {
      await notificationsApi.markAllRead();
      setItems((current) => current.map((n) => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark all as read");
    } finally {
      setActionLoading(false);
    }
  }

  const unread = items.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="dashboard-grid admin-dashboard-page">
        <section className="hero-panel">
          <div>
            <p className="hero-eyebrow">Inbox</p>
            <h1>Notifications</h1>
            <p className="hero-description">
              {unread > 0 ? `${unread} unread` : "You are all caught up."}{" "}
              <Link to="/">Back to dashboard</Link>
            </p>
          </div>
          <div className="hero-actions">
            <button
              type="button"
              className="secondary-btn"
              disabled={actionLoading || unread === 0}
              onClick={() => void handleMarkAll()}
            >
              Mark all read
            </button>
          </div>
        </section>

        <section className="panel modern-panel">
          {loading ? <p>Loading…</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
          {!loading && !items.length ? <p>No notifications yet.</p> : null}
          {!loading && items.length > 0 ? (
            <ul className="notification-list">
              {items.map((n) => (
                <li key={n.id} className={`notification-item ${n.read ? "read" : "unread"}`}>
                  <div className="notification-body">
                    <div className="notification-title-row">
                      <strong>{n.title}</strong>
                      <span className="notification-meta">{formatTime(n.createdAt)}</span>
                    </div>
                    <p className="notification-message">{n.message}</p>
                    {n.relatedBookingId ? (
                      <p className="notification-meta">Booking #{n.relatedBookingId}</p>
                    ) : null}
                  </div>
                  <div className="notification-actions">
                    {n.read ? (
                      <span className="notification-read-pill">Read</span>
                    ) : (
                      <button
                        type="button"
                        className="secondary-btn"
                        disabled={actionLoading}
                        onClick={() => void handleMarkRead(n.id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
