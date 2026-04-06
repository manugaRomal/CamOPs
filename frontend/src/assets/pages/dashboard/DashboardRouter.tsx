import React from "react";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import TechnicianDashboard from "./TechnicianDashboard";

type Props = {
  role: string;
};

const DashboardRouter: React.FC<Props> = ({ role }) => {
  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "TECHNICIAN":
      return <TechnicianDashboard />;
    case "USER":
    default:
      return <UserDashboard />;
  }
};

export default DashboardRouter;