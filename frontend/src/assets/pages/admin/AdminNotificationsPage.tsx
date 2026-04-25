import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { adminNotificationsApi } from "../../api/adminNotificationsApi";
import { adminUsersApi } from "../../api/adminUsersApi";
import type { AdminNotificationRow } from "../../types/adminNotification";
import type { AdminUserSummary } from "../../types/adminUser";
import "./adminNotificationsPage.css";

function formatTime(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

type EditState =
  | { mode: "closed" }
  | { mode: "one"; id: number; title: string; message: string; type: string }
  | { mode: "batch"; batchId: string; title: string; message: string; type: string };

const AdminNotificationsPage = () => {
  const [rows, setRows] = useState<AdminNotificationRow[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState("");

  const [allUsers, setAllUsers] = useState<AdminUserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userListError, setUserListError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [recipientMode, setRecipientMode] = useState<"all" | "selected">("all");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

  const [edit, setEdit] = useState<EditState>({ mode: "closed" });

  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminNotificationsApi.list(page, pageSize);
      setRows(res.content);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setUsersLoading(true);
      setUserListError("");
      try {
        const data = await adminUsersApi.list();
        if (!cancelled) {
          setAllUsers(data);
        }
      } catch {
        if (!cancelled) {
          setUserListError("Could not load the user list. Refresh the page or check you are signed in as an admin.");
        }
      } finally {
        if (!cancelled) {
          setUsersLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const roleOptions = useMemo(() => {
    const s = new Set<string>();
    for (const u of allUsers) {
      for (const r of u.roles) {
        s.add(r);
      }
    }
    return Array.from(s).sort();
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (roleFilter !== "all" && !u.roles.includes(roleFilter)) {
        return false;
      }
      if (!q) {
        return true;
      }
      const name = (u.fullName || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const dept = (u.department || "").toLowerCase();
      return name.includes(q) || email.includes(q) || dept.includes(q);
    });
  }, [allUsers, userSearch, roleFilter]);

  function toggleUserId(id: number) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      for (const u of filteredUsers) {
        next.add(u.id);
      }
      return next;
    });
  }

  function clearUserSelection() {
    setSelectedUserIds(new Set());
  }

  async function handleBroadcast() {
    setActionBusy(true);
    setError("");
    try {
      const t = broadcastTitle.trim();
      const m = broadcastMessage.trim();
      if (!t || !m) {
        setError("Title and message are required");
        return;
      }
      if (recipientMode === "selected" && selectedUserIds.size === 0) {
        setError("Select at least one user, or switch to “All users”.");
        return;
      }
      const typeOpt = broadcastType.trim();
      const payload: {
        title: string;
        message: string;
        type?: string;
        recipientUserIds?: number[];
      } = {
        title: t,
        message: m,
        ...(typeOpt ? { type: typeOpt } : {}),
      };
      if (recipientMode === "selected") {
        payload.recipientUserIds = Array.from(selectedUserIds);
      }
      await adminNotificationsApi.broadcast(payload);
      setBroadcastTitle("");
      setBroadcastMessage("");
      setBroadcastType("");
      setSelectedUserIds(new Set());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send");
    } finally {
      setActionBusy(false);
    }
  }

  function openEditOne(row: AdminNotificationRow) {
    setEdit({ mode: "one", id: row.id, title: row.title, message: row.message, type: row.type });
  }

  function openEditBatch(row: AdminNotificationRow) {
    if (!row.batchId) {
      return;
    }
    setEdit({ mode: "batch", batchId: row.batchId, title: row.title, message: row.message, type: row.type });
  }

  async function saveEdit() {
    if (edit.mode === "closed") {
      return;
    }
    setActionBusy(true);
    setError("");
    try {
      const body = { title: edit.title.trim(), message: edit.message.trim(), type: edit.type.trim() };
      if (edit.mode === "one") {
        await adminNotificationsApi.updateOne(edit.id, body);
      } else {
        await adminNotificationsApi.updateBatch(edit.batchId, body);
      }
      setEdit({ mode: "closed" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDeleteOne(id: number) {
    if (!window.confirm("Delete this notification for that user?")) {
      return;
    }
    setActionBusy(true);
    setError("");
    try {
      await adminNotificationsApi.deleteOne(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDeleteBatch(batchId: string) {
    if (!window.confirm("Delete this announcement for every user? This cannot be undone.")) {
      return;
    }
    setActionBusy(true);
    setError("");
    try {
      await adminNotificationsApi.deleteBatch(batchId);
      setEdit((e) => (e.mode === "batch" && e.batchId === batchId ? { mode: "closed" } : e));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="dashboard-grid admin-notifications-page">
        <section className="hero-panel">
          <div>
            <p className="hero-eyebrow">Admin</p>
            <h1>Announcements</h1>
            <p className="hero-description">
              Message everyone, pick specific people, and manage past sends.{" "}
              <Link to="/">Back to dashboard</Link>
            </p>
          </div>
        </section>

        <section className="panel modern-panel admin-notif-broadcast">
          <h2>Compose and send</h2>
          <p className="panel-subtitle">
            Each send creates one inbox row per recipient, linked by a batch id so you can edit or remove the run later.
          </p>
          <div className="admin-notif-form">
            <div className="admin-notif-recipient-mode" role="group" aria-label="Recipients">
              <span className="admin-notif-label-text">Who should receive this?</span>
              <div className="admin-notif-radio-row">
                <label className="admin-notif-radio">
                  <input
                    type="radio"
                    name="recipientMode"
                    checked={recipientMode === "all"}
                    onChange={() => setRecipientMode("all")}
                    disabled={actionBusy}
                  />
                  <span>All user accounts</span>
                </label>
                <label className="admin-notif-radio">
                  <input
                    type="radio"
                    name="recipientMode"
                    checked={recipientMode === "selected"}
                    onChange={() => setRecipientMode("selected")}
                    disabled={actionBusy}
                  />
                  <span>Only selected users</span>
                </label>
              </div>
            </div>

            {recipientMode === "selected" ? (
              <div className="admin-notif-user-panel">
                {userListError ? <p className="error-text admin-notif-inline-error">{userListError}</p> : null}
                <div className="admin-notif-user-toolbar">
                  <label className="admin-notif-search">
                    <span>Search</span>
                    <input
                      className="admin-notif-input"
                      type="search"
                      placeholder="Name, email, or department"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      disabled={actionBusy}
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    <span>Role</span>
                    <select
                      className="admin-notif-input admin-notif-select"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      disabled={actionBusy}
                    >
                      <option value="all">All roles</option>
                      {roleOptions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="admin-notif-bulk">
                    <button type="button" className="secondary-btn" disabled={actionBusy} onClick={selectAllFiltered}>
                      Add filtered to selection
                    </button>
                    <button type="button" className="secondary-btn" disabled={actionBusy} onClick={clearUserSelection}>
                      Clear selection
                    </button>
                  </div>
                </div>
                <p className="admin-notif-select-count" aria-live="polite">
                  {selectedUserIds.size} user{selectedUserIds.size === 1 ? "" : "s"} selected
                  {usersLoading ? " · Loading list…" : ` · ${filteredUsers.length} shown below`}
                </p>
                <div className="admin-notif-user-scroll">
                  {usersLoading ? (
                    <p className="admin-notif-muted">Loading users…</p>
                  ) : (
                    <table className="admin-notif-user-table">
                      <thead>
                        <tr>
                          <th className="admin-notif-check-col" scope="col">
                            Include
                          </th>
                          <th scope="col">Name</th>
                          <th scope="col">Email</th>
                          <th scope="col">Department</th>
                          <th scope="col">Roles</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="admin-notif-muted">
                              No users match the filters.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedUserIds.has(u.id)}
                                  onChange={() => toggleUserId(u.id)}
                                  disabled={actionBusy}
                                  aria-label={`Select ${u.fullName || u.email}`}
                                />
                              </td>
                              <td>{u.fullName || "—"}</td>
                              <td className="admin-notif-nowrap">{u.email}</td>
                              <td>{u.department || "—"}</td>
                              <td className="admin-notif-roles-cell">{u.roles.length ? u.roles.join(", ") : "—"}</td>
                              <td>{u.active ? "Active" : "Inactive"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : null}

            <label>
              <span>Title</span>
              <input
                className="admin-notif-input"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                maxLength={200}
                disabled={actionBusy}
              />
            </label>
            <label>
              <span>Message</span>
              <textarea
                className="admin-notif-textarea"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={4}
                disabled={actionBusy}
              />
            </label>
            <label>
              <span>Type (optional)</span>
              <input
                className="admin-notif-input"
                placeholder="ANNOUNCEMENT"
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value)}
                maxLength={50}
                disabled={actionBusy}
              />
            </label>
            <button
              className="primary-btn"
              type="button"
              disabled={actionBusy}
              onClick={() => void handleBroadcast()}
            >
              {recipientMode === "all"
                ? "Send to all"
                : `Send to ${selectedUserIds.size || 0} selected`}
            </button>
          </div>
        </section>

        <section className="panel modern-panel">
          <div className="admin-notif-list-head">
            <h2>All notifications</h2>
            <p className="panel-subtitle">Every in-app row (per user). Use batch actions for broadcast copies.</p>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          {loading ? <p>Loading…</p> : null}
          {!loading && rows.length === 0 ? <p className="admin-notif-empty">No notifications yet.</p> : null}
          {!loading && rows.length > 0 ? (
            <div className="admin-notif-table-wrap">
              <table className="admin-notif-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Recipient</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Read</th>
                    <th>Batch</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{formatTime(r.createdAt)}</td>
                      <td className="admin-notif-nowrap">{r.userEmail}</td>
                      <td>{r.type}</td>
                      <td className="admin-notif-title-cell">{r.title}</td>
                      <td>{r.read ? "Yes" : "No"}</td>
                      <td className="admin-notif-mono" title={r.batchId ?? ""}>
                        {r.batchId ? `${r.batchId.slice(0, 8)}…` : "—"}
                      </td>
                      <td className="admin-notif-actions">
                        <button
                          type="button"
                          className="ghost-btn"
                          disabled={actionBusy}
                          onClick={() => openEditOne(r)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ghost-btn"
                          disabled={actionBusy}
                          onClick={() => void handleDeleteOne(r.id)}
                        >
                          Delete
                        </button>
                        {r.batchId ? (
                          <>
                            <button
                              type="button"
                              className="secondary-btn"
                              disabled={actionBusy}
                              onClick={() => openEditBatch(r)}
                            >
                              Edit all
                            </button>
                            <button
                              type="button"
                              className="secondary-btn admin-notif-danger"
                              disabled={actionBusy}
                              onClick={() => void handleDeleteBatch(r.batchId!)}
                            >
                              Delete all
                            </button>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {!loading && totalPages > 1 ? (
            <div className="admin-notif-pager">
              <button
                type="button"
                className="secondary-btn"
                disabled={actionBusy || page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span>
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                className="secondary-btn"
                disabled={actionBusy || page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          ) : null}
        </section>

        {edit.mode !== "closed" ? (
          <div className="admin-notif-dialog-backdrop" role="dialog" aria-modal>
            <div className="admin-notif-dialog">
              <h3>{edit.mode === "batch" ? "Edit for all in batch" : "Edit this row"}</h3>
              <label>
                <span>Title</span>
                <input
                  className="admin-notif-input"
                  value={edit.title}
                  onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                  maxLength={200}
                />
              </label>
              <label>
                <span>Message</span>
                <textarea
                  className="admin-notif-textarea"
                  value={edit.message}
                  onChange={(e) => setEdit({ ...edit, message: e.target.value })}
                  rows={4}
                />
              </label>
              <label>
                <span>Type</span>
                <input
                  className="admin-notif-input"
                  value={edit.type}
                  onChange={(e) => setEdit({ ...edit, type: e.target.value })}
                  maxLength={50}
                />
              </label>
              <div className="admin-notif-dialog-actions">
                <button type="button" className="secondary-btn" onClick={() => setEdit({ mode: "closed" })}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  disabled={actionBusy}
                  onClick={() => void saveEdit()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default AdminNotificationsPage;
