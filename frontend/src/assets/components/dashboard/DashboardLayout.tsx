//DashboardLayout.tsx

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <div className="content-area">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
