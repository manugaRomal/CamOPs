import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatusBadge from "../../components/dashboard/StatusBadge";
import SlaTimer from "../../components/tickets/SlaTimer";
import { resourceApi } from "../../api/resourceApi";
import { ticketsApi } from "../../api/ticketsApi";
import type { Resource } from "../../types/resource";
import type { SupportTicket, TechnicianOption } from "../../types/ticket";
import { isAdmin, isTechnician } from "../../../auth/roleMap";
import { useAuth } from "../../../auth/AuthContext";
import "./ticketsPage.css";

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

const CATEGORIES = ["General", "IT", "Facilities", "Equipment", "Other"];
const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const admin = isAdmin(user?.roles);
  const tech = isTechnician(user?.roles);
  const uid = user?.id;

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [resolveNotes, setResolveNotes] = useState("");
  const [assignId, setAssignId] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [editResourceId, setEditResourceId] = useState("");
  const [editPreferredContact, setEditPreferredContact] = useState("");

  const canEditDelete = useMemo(() => {
    if (!ticket || uid == null) {
      return false;
    }
    if (admin) {
      return true;
    }
    if (ticket.userId !== uid) {
      return false;
    }
    return ticket.status.toUpperCase() === "OPEN";
  }, [ticket, uid, admin]);

  const ticketId = id ? Number(id) : NaN;

  useEffect(() => {
    if (!Number.isFinite(ticketId)) {
      return;
    }
    let on = true;
    void (async () => {
      setLoading(true);
      setError("");
      try {
        const t = await ticketsApi.get(ticketId);
        if (on) {
          setTicket(t);
        }
        if (admin) {
          const techs = await ticketsApi.listTechnicians();
          if (on) {
            setTechnicians(techs);
          }
        }
      } catch (e) {
        if (on) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (on) {
          setLoading(false);
        }
      }
    })();
    return () => {
      on = false;
    };
  }, [ticketId, admin]);

  useEffect(() => {
    if (!Number.isFinite(ticketId) || !canEditDelete) {
      return;
    }
    let on = true;
    void (async () => {
      try {
        const r = await resourceApi.list().catch(() => []);
        if (on) {
          setResources(r);
        }
      } catch {
        if (on) {
          setResources([]);
        }
      }
    })();
    return () => {
      on = false;
    };
  }, [ticketId, canEditDelete]);

  const canComment = ticket && uid;
  const canResolve =
    ticket &&
    (admin ||
      (tech && ticket.assignedToUserId != null && uid != null && ticket.assignedToUserId === uid)) &&
    ticket.status.toUpperCase() !== "RESOLVED" &&
    ticket.status.toUpperCase() !== "CLOSED";

  async function addNote() {
    if (!ticket || !note.trim()) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const t = await ticketsApi.addComment(ticket.ticketId, note.trim());
      setTicket(t);
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add note");
    } finally {
      setBusy(false);
    }
  }

  async function doResolve() {
    if (!ticket || !resolveNotes.trim()) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const t = await ticketsApi.resolve(ticket.ticketId, resolveNotes.trim());
      setTicket(t);
      setResolveNotes("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resolve");
    } finally {
      setBusy(false);
    }
  }

  async function doAssign() {
    if (!ticket || !assignId) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const t = await ticketsApi.assign(ticket.ticketId, Number(assignId));
      setTicket(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not assign");
    } finally {
      setBusy(false);
    }
  }

  function startEdit() {
    if (!ticket) {
      return;
    }
    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
    setEditCategory(CATEGORIES.includes(ticket.category) ? ticket.category : "General");
    setEditPriority(
      PRIORITIES.includes(ticket.priority as (typeof PRIORITIES)[number]) ? ticket.priority : "MEDIUM",
    );
    setEditResourceId(ticket.resourceId != null ? String(ticket.resourceId) : "");
    setEditPreferredContact(ticket.preferredContact ?? "");
    setEditing(true);
    setError("");
  }

  async function saveEdit() {
    if (!ticket) {
      return;
    }
    if (!editTitle.trim() || !editDescription.trim()) {
      setError("Title and description are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const t = await ticketsApi.update(ticket.ticketId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory,
        priority: editPriority,
        resourceId: editResourceId ? Number(editResourceId) : 0,
        preferredContact: editPreferredContact.trim() === "" ? "" : editPreferredContact.trim(),
      });
      setTicket(t);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes");
    } finally {
      setBusy(false);
    }
  }

  async function doDelete() {
    if (!ticket) {
      return;
    }
    if (!window.confirm(`Delete ticket ${ticket.ticketCode}? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await ticketsApi.delete(ticket.ticketId);
      navigate("/tickets");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    } finally {
      setBusy(false);
    }
  }

  if (!Number.isFinite(ticketId)) {
    return (
      <DashboardLayout>
        <p>Invalid ticket.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="tickets-page ticket-detail">
        <p>
          <Link to="/tickets" className="tickets-back">
            ← All tickets
          </Link>
        </p>
        {loading ? <p>Loading…</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        {!loading && ticket ? (
          <>
            <header className="ticket-detail-header">
              <h1>
                {ticket.ticketCode}: {ticket.title}
              </h1>
              <div className="ticket-detail-header-row">
                <div className="ticket-detail-badges">
                  <StatusBadge status={ticket.status} />
                  <StatusBadge status={ticket.priority} />
                </div>
                {canEditDelete ? (
                  <div className="ticket-detail-actions">
                    {editing ? (
                      <button type="button" className="secondary-btn" disabled={busy} onClick={() => setEditing(false)}>
                        Cancel
                      </button>
                    ) : (
                      <button type="button" className="secondary-btn" disabled={busy} onClick={startEdit}>
                        Edit
                      </button>
                    )}
                    <button type="button" className="danger-btn" disabled={busy || editing} onClick={() => void doDelete()}>
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </header>

            <SlaTimer
              createdAt={ticket.createdAt}
              resolvedAt={ticket.resolvedAt}
              priority={ticket.priority}
              status={ticket.status}
              variant="full"
            />

            {editing && canEditDelete ? (
              <section className="panel modern-panel">
                <h3>Edit details</h3>
                <div className="tickets-form">
                  <label>
                    <span>Title</span>
                    <input
                      className="input-control"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={200}
                      disabled={busy}
                    />
                  </label>
                  <label>
                    <span>Category</span>
                    <select
                      className="input-control"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      disabled={busy}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Priority</span>
                    <select
                      className="input-control"
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      disabled={busy}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Related resource (optional)</span>
                    <select
                      className="input-control"
                      value={editResourceId}
                      onChange={(e) => setEditResourceId(e.target.value)}
                      disabled={busy}
                    >
                      <option value="">— None —</option>
                      {resources.map((r) => (
                        <option key={r.resourceId} value={r.resourceId}>
                          {r.resourceName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Contact preference (optional)</span>
                    <input
                      className="input-control"
                      value={editPreferredContact}
                      onChange={(e) => setEditPreferredContact(e.target.value)}
                      maxLength={50}
                      disabled={busy}
                      placeholder="e.g. email, phone, Teams"
                    />
                  </label>
                  <label>
                    <span>Description</span>
                    <textarea
                      className="input-control textarea-control"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={5}
                      disabled={busy}
                    />
                  </label>
                  <button type="button" className="primary-btn" disabled={busy} onClick={() => void saveEdit()}>
                    Save changes
                  </button>
                </div>
              </section>
            ) : null}

            <div className="panel modern-panel ticket-detail-grid">
              <div>
                <h3>Details</h3>
                <dl className="ticket-dl">
                  <dt>Category</dt>
                  <dd>{ticket.category}</dd>
                  <dt>Description</dt>
                  <dd className="ticket-dd-block">{ticket.description}</dd>
                  {ticket.resourceName ? (
                    <>
                      <dt>Resource</dt>
                      <dd>
                        {ticket.resourceId ? <Link to={`/resources/${ticket.resourceId}`}>{ticket.resourceName}</Link> : ticket.resourceName}
                      </dd>
                    </>
                  ) : null}
                  {ticket.preferredContact ? (
                    <>
                      <dt>Contact preference</dt>
                      <dd>{ticket.preferredContact}</dd>
                    </>
                  ) : null}
                  <dt>Requester</dt>
                  <dd>
                    {ticket.requesterName || "—"} ({ticket.requesterEmail ?? "—"})
                  </dd>
                  <dt>Assignee</dt>
                  <dd>
                    {ticket.assigneeName || ticket.assigneeEmail
                      ? `${ticket.assigneeName ?? ""} ${ticket.assigneeEmail ? `(${ticket.assigneeEmail})` : ""}`.trim()
                      : "Unassigned"}
                  </dd>
                  <dt>Created</dt>
                  <dd>{formatWhen(ticket.createdAt)}</dd>
                  {ticket.resolvedAt ? (
                    <>
                      <dt>Resolved</dt>
                      <dd>{formatWhen(ticket.resolvedAt)}</dd>
                    </>
                  ) : null}
                  {ticket.resolutionNotes ? (
                    <>
                      <dt>Resolution</dt>
                      <dd className="ticket-dd-block">{ticket.resolutionNotes}</dd>
                    </>
                  ) : null}
                </dl>
              </div>
            </div>

            {admin && ticket.status.toUpperCase() !== "RESOLVED" && ticket.status.toUpperCase() !== "CLOSED" ? (
              <section className="panel modern-panel">
                <h3>Assign technician</h3>
                {technicians.length === 0 ? (
                  <p className="tickets-muted">No users with the TECHNICIAN or STAFF role. Grant one of these roles in user admin, then refresh.</p>
                ) : (
                  <div className="ticket-assign-row">
                    <select
                      className="input-control"
                      value={assignId}
                      onChange={(e) => setAssignId(e.target.value)}
                      disabled={busy}
                    >
                      <option value="">— Select —</option>
                      {technicians.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.fullName} ({x.email})
                        </option>
                      ))}
                    </select>
                    <button type="button" className="primary-btn" disabled={busy || !assignId} onClick={() => void doAssign()}>
                      Assign
                    </button>
                  </div>
                )}
              </section>
            ) : null}

            <section className="panel modern-panel">
              <h3>Activity</h3>
              <ul className="ticket-comment-list">
                {(ticket.comments ?? []).map((c) => (
                  <li key={c.commentId}>
                    <div className="ticket-comment-meta">
                      <strong>{c.authorName || `User #${c.userId}`}</strong>
                      <span>{formatWhen(c.createdAt)}</span>
                    </div>
                    <p className="ticket-comment-text">{c.commentText}</p>
                  </li>
                ))}
                {(ticket.comments ?? []).length === 0 ? <p className="tickets-muted">No notes yet.</p> : null}
              </ul>
              {canComment ? (
                <div className="ticket-comment-form">
                  <label>
                    <span>Add a note</span>
                    <textarea
                      className="input-control textarea-control"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      disabled={busy}
                      placeholder="Updates, questions, or context…"
                    />
                  </label>
                  <button type="button" className="secondary-btn" disabled={busy || !note.trim()} onClick={() => void addNote()}>
                    Post note
                  </button>
                </div>
              ) : null}
            </section>

            {canResolve ? (
              <section className="panel modern-panel">
                <h3>Mark resolved</h3>
                <label>
                  <span>Resolution summary (shown to the requester in history)</span>
                  <textarea
                    className="input-control textarea-control"
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    rows={3}
                    disabled={busy}
                    required
                  />
                </label>
                <button
                  type="button"
                  className="primary-btn"
                  disabled={busy || !resolveNotes.trim()}
                  onClick={() => void doResolve()}
                >
                  Mark as resolved
                </button>
              </section>
            ) : null}
          </>
        ) : null}
        {!loading && !ticket && !error ? <p>Ticket not found.</p> : null}
      </div>
    </DashboardLayout>
  );
};

export default TicketDetailPage;
