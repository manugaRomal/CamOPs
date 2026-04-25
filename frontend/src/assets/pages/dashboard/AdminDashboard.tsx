//AdminDashboard.tsx

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import { useNavigate } from "react-router-dom";
import {
  adminStats,
  pendingBookings,
  highPriorityTickets,
  recentActivities,
} from "../../data/dashboardData";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleQuickAction = (action: string) => {
    if (action === "Add Resource") {
      navigate("/resources/new");
      return;
    }

    if (action === "Approve Booking") {
      navigate("/resources");
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-grid admin-dashboard-page">
        <section className="hero-panel">
          <div>
            <p className="hero-eyebrow">Admin workspace</p>
            <h1>Campus operations at a glance</h1>
            <p className="hero-description">
              Monitor resources, keep booking approvals moving, and respond to facility issues before they escalate.
            </p>
          </div>
          <div className="hero-actions">
            <button className="secondary-btn" type="button" onClick={() => navigate("/resources")}>
              View resources
            </button>
            <button className="primary-btn" type="button" onClick={() => navigate("/resources/new")}>
              Add Resource
            </button>
          </div>
        </section>

        <div className="stats-grid">
          {adminStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <section className="action-card-grid">
          {[
            {
              title: "Add Resource",
              description: "Register a new room, lab, or asset in the campus catalogue.",
            },
            {
              title: "Approve Booking",
              description: "Review pending requests and keep schedules moving.",
            },
            {
              title: "Create Ticket",
              description: "Log an incident or maintenance issue for a facility.",
            },
            {
              title: "Manage Users",
              description: "Control team access and operational visibility.",
            },
          ].map((action) => (
            <button
              key={action.title}
              type="button"
              className="action-card"
              onClick={() => handleQuickAction(action.title)}
            >
              <span className="action-card-icon">+</span>
              <span className="action-card-title">{action.title}</span>
              <span className="action-card-description">{action.description}</span>
            </button>
          ))}
        </section>

        <div className="two-column-grid">
          <div className="panel modern-panel">
            <div className="panel-header-row">
              <div>
                <h3>Pending Booking Requests</h3>
                <p className="panel-subtitle">Requests that need admin attention today.</p>
              </div>
              <button className="ghost-btn" type="button" onClick={() => navigate("/resources")}>
                Review queue
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingBookings.map((booking, index) => (
                  <tr key={index}>
                    <td>{booking.resource}</td>
                    <td>{booking.time}</td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel modern-panel">
            <div className="panel-header-row">
              <div>
                <h3>High Priority Tickets</h3>
                <p className="panel-subtitle">Urgent maintenance issues affecting operations.</p>
              </div>
              <button className="ghost-btn" type="button">
                Open tickets
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {highPriorityTickets.map((ticket, index) => (
                  <tr key={index}>
                    <td>{ticket.title}</td>
                    <td>
                      <StatusBadge status={ticket.priority} />
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ActivityFeed items={recentActivities} />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;