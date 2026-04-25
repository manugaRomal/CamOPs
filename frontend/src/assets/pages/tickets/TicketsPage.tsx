import { useEffect, useState } from "react";
import SlaTimer from "../../components/tickets/SlaTimer";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import { resourceApi } from "../../api/resourceApi";
import { ticketsApi } from "../../api/ticketsApi";
import type { Resource } from "../../types/resource";
import type { SupportTicket } from "../../types/ticket";
import { isAdmin } from "../../../auth/roleMap";
import { useAuth } from "../../../auth/AuthContext";
import "./ticketsPage.css";

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

const CATEGORIES = ["General", "IT", "Facilities", "Equipment", "Other"];
const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

const TicketsPage = () => {
  const { user } = useAuth();
  const admin = isAdmin(user?.roles);

  const [resources, setResources] = useState<Resource[]>([]);
  const [list, setList] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [resourceId, setResourceId] = useState("");
  const [preferredContact, setPreferredContact] = useState("");
  const [listNow, setListNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setListNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  async function load() {
    setError("");
    try {
      const [tickets, resList] = await Promise.all([ticketsApi.list(), resourceApi.list().catch(() => [])]);
      setList(tickets);
      setResources(resList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body: Parameters<typeof ticketsApi.create>[0] = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      };
      if (resourceId) {
        body.resourceId = Number(resourceId);
      }
      if (preferredContact.trim()) {
        body.preferredContact = preferredContact.trim();
      }
      await ticketsApi.create(body);
      setTitle("");
      setDescription("");
      setCategory("General");
      setPriority("MEDIUM");
      setResourceId("");
      setPreferredContact("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create ticket");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="tickets-page dashboard-grid">
        <section className="hero-panel">
          <div>
            <p className="hero-eyebrow">Support</p>
            <h1>Tickets</h1>
            <p className="hero-description">
              {admin
                ? "View all reports and assign technicians. Students and staff submit on this page too."
                : "Report an issue. You can track status here after you submit."}
            </p>
          </div>
        </section>

        <section className="panel modern-panel tickets-form-panel">
          <h2>New ticket</h2>
          {error ? <p className="error-text">{error}</p> : null}
          <form className="tickets-form" onSubmit={(e) => void handleCreate(e)}>
            <label>
              <span>Title</span>
              <input
                className="input-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
                disabled={saving}
              />
            </label>
            <label>
              <span>Category</span>
              <select className="input-control" value={category} onChange={(e) => setCategory(e.target.value)} disabled={saving}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Priority</span>
              <select className="input-control" value={priority} onChange={(e) => setPriority(e.target.value)} disabled={saving}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Description</span>
              <textarea
                className="input-control textarea-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                disabled={saving}
              />
            </label>
            {resources.length > 0 ? (
              <label>
                <span>Related resource (optional)</span>
                <select
                  className="input-control"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  disabled={saving}
                >
                  <option value="">— None —</option>
                  {resources.map((r) => (
                    <option key={r.resourceId} value={r.resourceId}>
                      {r.resourceName} ({r.resourceCode})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              <span>Preferred contact (optional)</span>
              <input
                className="input-control"
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                maxLength={50}
                disabled={saving}
                placeholder="e.g. phone or Teams"
              />
            </label>
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Submitting…" : "Submit ticket"}
            </button>
          </form>
        </section>

        <section className="panel modern-panel">
          <h2>{admin ? "All tickets" : "My tickets"}</h2>
          {loading ? <p>Loading…</p> : null}
          {!loading && !list.length ? <p className="tickets-muted">No tickets yet.</p> : null}
          {!loading && list.length > 0 ? (
            <div className="tickets-table-wrap">
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    {admin ? <th>Requester</th> : null}
                    <th>Status</th>
                    <th>Priority</th>
                    <th>SLA</th>
                    <th>Assignee</th>
                    <th>Created</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {list.map((t) => (
                    <tr key={t.ticketId}>
                      <td className="tickets-mono">{t.ticketCode}</td>
                      <td>{t.title}</td>
                      {admin ? <td>{t.requesterName ?? t.requesterEmail ?? t.userId}</td> : null}
                      <td>
                        <StatusBadge status={t.status} />
                      </td>
                      <td>
                        <StatusBadge status={t.priority} />
                      </td>
                      <td className="tickets-sla-cell">
                        <SlaTimer
                          createdAt={t.createdAt}
                          resolvedAt={t.resolvedAt}
                          priority={t.priority}
                          status={t.status}
                          variant="compact"
                          nowMs={listNow}
                        />
                      </td>
                      <td>{t.assigneeName || t.assigneeEmail || (t.assignedToUserId ? `#${t.assignedToUserId}` : "—")}</td>
                      <td>{formatWhen(t.createdAt)}</td>
                      <td>
                        <Link className="tickets-link" to={`/tickets/${t.ticketId}`}>
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default TicketsPage;
