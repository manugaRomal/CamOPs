//DashboardRouter.tsx

import { useAuth } from "../../../auth/AuthContext";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import TechnicianDashboard from "./TechnicianDashboard";

const DashboardRouter = () => {
  const { homeDashboard } = useAuth();

  switch (homeDashboard) {
    case "ADMIN":
      return <AdminDashboard />;
    case "TECHNICIAN":
      return <TechnicianDashboard />;
    case "STUDENT":
    default:
      return <StudentDashboard />;
  }
};

export default DashboardRouter;
