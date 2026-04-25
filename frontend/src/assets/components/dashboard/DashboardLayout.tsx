//DashboardLayout.tsx

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { displayUserLabel, mapDashboardRole } from "../../../auth/roleMap";
import { notificationsApi } from "../../api/notificationsApi";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const role = mapDashboardRole(user?.roles);
  const userLabel = displayUserLabel(user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void notificationsApi
        .unreadCount()
        .then((n) => {
          if (!cancelled) {
            setUnreadCount(n);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setUnreadCount(0);
          }
        });
    };
    load();
    const t = setInterval(load, 45_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [location.pathname]);

  return (
    <div className="dashboard-shell">
      <Sidebar role={role} userLabel={userLabel} unreadCount={unreadCount} />
      <div className="main-area">
        <Topbar role={role} userLabel={userLabel} unreadCount={unreadCount} />
        <div className="content-area">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
