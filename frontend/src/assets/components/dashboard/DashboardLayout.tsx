//DashboardLayout.tsx

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type DashboardLayoutProps = {
  role: string;
  children: ReactNode;
};

const DashboardLayout = ({ role, children }: DashboardLayoutProps) => {
  return (
    <div className="dashboard-shell">
      <Sidebar role={role} />
      <div className="main-area">
        <Topbar role={role} />
        <div className="content-area">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;