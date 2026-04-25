import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import QuickActions from "../../components/dashboard/QuickActions";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import SlaTimer from "../../components/tickets/SlaTimer";
import { ticketsApi } from "../../api/ticketsApi";
import type { SupportTicket } from "../../types/ticket";
import { useAuth } from "../../../auth/AuthContext";
import { recentActivities } from "../../data/dashboardData";

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [listNow, setListNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setListNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let on = true;
    void (async () => {
      try {
        const data = await ticketsApi.list();
        if (on) {
          setTickets(data);
        }
      } catch {
        if (on) {
          setTickets([]);
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
  }, []);

  const assignedToMe = useMemo(() => {
    const uid = user?.id;
    if (uid == null) {
      return [];
    }
    return tickets.filter((t) => t.assignedToUserId === uid);
  }, [tickets, user?.id]);

  const openAssigned = useMemo(
    () =>
      assignedToMe.filter((t) => {
        const s = t.status.toUpperCase();
        return s !== "RESOLVED" && s !== "CLOSED";
      }),
    [assignedToMe],
  );

  const stats = useMemo(
    () => [
      { title: "Assigned to you", value: assignedToMe.length, subtitle: "All time" },
      { title: "Open / in progress", value: openAssigned.length, subtitle: "Needs your attention" },
      { title: "Total in view", value: tickets.length, subtitle: "Created by you or assigned" },
    ],
    [assignedToMe.length, openAssigned.length, tickets.length],
  );

  return (
    <DashboardLayout>
      <div className="dashboard-grid">
        <div className="stats-grid">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <QuickActions
          actions={["Update Ticket Status", "Add Resolution Note", "View Assigned Work"]}
        />
        <p className="technician-actions-hint">
          <Link to="/tickets">Open tickets workspace</Link> to add notes or mark issues resolved.
        </p>

        <div className="panel modern-panel">
          <div className="panel-header-row">
            <h3>Assigned to you</h3>
            <Link to="/tickets" className="ghost-btn">
              All tickets
            </Link>
          </div>
          {loading ? <p>Loading…</p> : null}
          {!loading && openAssigned.length === 0 ? <p className="panel-subtitle">No open tickets assigned to you right now.</p> : null}
          {!loading && openAssigned.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>SLA</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {openAssigned.map((ticket) => (
                  <tr key={ticket.ticketId}>
                    <td>{ticket.ticketCode}</td>
                    <td>{ticket.title}</td>
                    <td>
                      <StatusBadge status={ticket.priority} />
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="tickets-sla-cell">
                      <SlaTimer
                        createdAt={ticket.createdAt}
                        resolvedAt={ticket.resolvedAt}
                        priority={ticket.priority}
                        status={ticket.status}
                        variant="compact"
                        nowMs={listNow}
                      />
                    </td>
                    <td>
                      <Link to={`/tickets/${ticket.ticketId}`} className="secondary-btn">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>

        <ActivityFeed items={recentActivities} />
      </div>
    </DashboardLayout>
  );
};

export default TechnicianDashboard;
