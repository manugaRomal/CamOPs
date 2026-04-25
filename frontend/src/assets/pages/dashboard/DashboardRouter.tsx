//DashboardRouter.tsx

import { useAuth } from "../../../auth/AuthContext";
import { mapDashboardRole } from "../../../auth/roleMap";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import TechnicianDashboard from "./TechnicianDashboard";

const DashboardRouter = () => {
  const { user } = useAuth();
  const role = mapDashboardRole(user?.roles);
  switch (role) {
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
