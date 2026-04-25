//Sidebar.tsx

import { useLocation, useNavigate } from "react-router-dom";

type SidebarProps = {
  role: string;
};

const Sidebar = ({ role }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuByRole: Record<string, { label: string; path?: string }[]> = {
    ADMIN: [
      { label: "Dashboard", path: "/" },
      { label: "Resources", path: "/resources" },
      { label: "Bookings", path: "/bookings" },
      { label: "Tickets" },
      { label: "Users" },
      { label: "Notifications" },
      { label: "Analytics" },
    ],
    USER: [{ label: "Dashboard", path: "/" }, { label: "My Bookings" }, { label: "My Tickets" }, { label: "Notifications" }],
    STUDENT: [
      { label: "Dashboard", path: "/" },
      { label: "Resources", path: "/resources" },
      { label: "My Bookings", path: "/" },
      { label: "Notifications" },
    ],
    TECHNICIAN: [
      { label: "Dashboard", path: "/" },
      { label: "Assigned Tickets" },
      { label: "Work Updates" },
      { label: "Notifications" },
    ],
  };

  const iconByLabel: Record<string, string> = {
    Dashboard: "◫",
    Resources: "⌂",
    Bookings: "◷",
    Tickets: "☰",
    Users: "◌",
    Notifications: "◔",
    Analytics: "△",
    "My Bookings": "◷",
    "My Tickets": "☰",
    "Assigned Tickets": "☰",
    "Work Updates": "△",
  };

  const fallbackPathByLabel: Record<string, string> = {
    Dashboard: "/",
    Resources: "/resources",
    Bookings: "/bookings",
  };

  const menuItems = menuByRole[role] || [{ label: "Dashboard", path: "/" }];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-mark">C</div>
        <div>
          <div className="logo">CamOps</div>
          <p className="logo-subtitle">Operations</p>
        </div>
      </div>

      <div className="sidebar-section-label">Workspace</div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const resolvedPath = item.path ?? fallbackPathByLabel[item.label];
          const isActive = resolvedPath
            ? location.pathname === resolvedPath ||
              (resolvedPath === "/resources" && location.pathname.startsWith("/resources/")) ||
              (resolvedPath === "/bookings" && location.pathname.startsWith("/bookings/"))
            : false;

          return (
            <li
              key={item.label}
              className={isActive ? "active-menu-item" : ""}
              onClick={() => {
                if (resolvedPath) {
                  navigate(resolvedPath);
                }
              }}
            >
              <span className="menu-icon">{iconByLabel[item.label] ?? "•"}</span>
              <span>{item.label}</span>
              {item.label === "Notifications" ? <span className="menu-pill">4</span> : null}
            </li>
          );
        })}
      </ul>

      <div className="sidebar-profile-card">
        <div className="sidebar-avatar">AD</div>
        <div>
          <p className="sidebar-profile-name">Alex Dean</p>
          <p className="sidebar-profile-role">{role === "ADMIN" ? "Administrator" : role}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;