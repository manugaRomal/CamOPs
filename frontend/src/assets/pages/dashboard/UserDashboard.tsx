//UserDashBoard.tsx

import "../../styles/dashboard.css";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import QuickActions from "../../components/dashboard/QuickActions";
import { userStats, myBookings, myTickets } from "../../data/dashboardData";

const UserDashboard = () => {
  return (
    <DashboardLayout role="USER">
      <div className="dashboard-grid">
        <div className="stats-grid">
          {userStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <QuickActions
          actions={[
            "Book Resource",
            "Create Ticket",
            "View Notifications",
          ]}
        />

        <div className="two-column-grid">
          <div className="panel">
            <h3>My Bookings</h3>
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map((booking, index) => (
                  <tr key={index}>
                    <td>{booking.resource}</td>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td><StatusBadge status={booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h3>My Tickets</h3>
            <table>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myTickets.map((ticket, index) => (
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
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;