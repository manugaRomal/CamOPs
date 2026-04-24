import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import QuickActions from "../../components/dashboard/QuickActions";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import { useTickets } from "../../context/TicketContext";
import {
  adminStats,
  pendingBookings,
  recentActivities,
} from "../../data/dashboardData";
import "../../styles/dashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { tickets } = useTickets();

  return (
    <DashboardLayout role="ADMIN">
      <div className="dashboard-grid">
        <div className="stats-grid">
          {adminStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <QuickActions
          actions={[
            "Add Resource",
            "Approve Booking",
            "Manage Tickets",
            "Manage Users",
          ]}
        />

        <div className="two-column-grid">
          <div className="panel">
            <h3>Pending Booking Requests</h3>
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
                    <td><StatusBadge status={booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0 }}>All Tickets</h3>
              <button
                onClick={() => navigate("/admin/tickets")}
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
                    onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{ticket.ticketCode}</td>
                    <td>{ticket.description.length > 30 ? ticket.description.substring(0, 30) + "..." : ticket.description}</td>
                    <td><StatusBadge status={ticket.priority} /></td>
                    <td><StatusBadge status={ticket.status} /></td>
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