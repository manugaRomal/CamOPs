//DashboardRouter.tsx

import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import UserDashboard from "./UserDashboard";
import TechnicianDashboard from "./TechnicianDashboard";

type DashboardRouterProps = {
  role: string;
};

const DashboardRouter = ({ role }: DashboardRouterProps) => {
  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "TECHNICIAN":
      return <TechnicianDashboard />;
    case "STUDENT":
      return <StudentDashboard />;
    case "USER":
    default:
      return <UserDashboard />;
  }
};

export default DashboardRouter;