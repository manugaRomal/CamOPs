//TechnicianDashboard.tsx

import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import QuickActions from "../../components/dashboard/QuickActions";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import { useTickets } from "../../context/TicketContext";
import {
  technicianStats,
  recentActivities,
} from "../../data/dashboardData";
import "../../styles/dashboard.css";

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { tickets } = useTickets();

  return (
    <DashboardLayout role="TECHNICIAN">
      <div className="dashboard-grid">
        <div className="stats-grid">
          {technicianStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <QuickActions
          actions={[
            "View Assigned Tickets",
          ]}
        />

        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>All Tickets</h3>
            <button
              onClick={() => navigate("/technician/tickets")}
              style={{ padding: "0.4rem 1rem", borderRadius: "8px", border: "none", background: "#1a3a6b", color: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}
            >
              View All
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Issue</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.slice(0, 5).map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => navigate(`/technician/tickets/${ticket.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{ticket.ticketCode}</td>
                  <td>{ticket.description.length > 40 ? ticket.description.substring(0, 40) + "..." : ticket.description}</td>
                  <td><StatusBadge status={ticket.priority} /></td>
                  <td><StatusBadge status={ticket.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ActivityFeed items={recentActivities} />
      </div>
    </DashboardLayout>
  );
};

export default TechnicianDashboard;