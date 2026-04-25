//TechnicianDashboard.tsx

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import QuickActions from "../../components/dashboard/QuickActions";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import {
  technicianStats,
  technicianTickets,
  recentActivities,
} from "../../data/dashboardData";

const TechnicianDashboard = () => {
  return (
    <DashboardLayout>
      <div className="dashboard-grid">
        <div className="stats-grid">
          {technicianStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <QuickActions
          actions={[
            "Update Ticket Status",
            "Add Resolution Note",
            "View Assigned Work",
          ]}
        />

        <div className="panel">
          <h3>Assigned Tickets</h3>
          <table>
            <thead>
              <tr>
                <th>Issue</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {technicianTickets.map((ticket, index) => (
                <tr key={index}>
                  <td>{ticket.title}</td>
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