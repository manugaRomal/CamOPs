//AdminDashboard.tsx

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import QuickActions from "../../components/dashboard/QuickActions";
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
            "Create Ticket",
            "Manage Users",
          ]}
          onActionClick={handleQuickAction}
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
            <h3>High Priority Tickets</h3>
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