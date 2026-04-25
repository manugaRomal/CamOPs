//Sidebar.tsx

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";

type SidebarProps = {
  role: string;
  userLabel: string;
  unreadCount: number;
};

const initialsFrom = (name: string) => {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) {
    return "?";
  }
  if (p.length === 1) {
    return p[0]!.slice(0, 2).toUpperCase();
  }
  return (p[0]!.charAt(0) + p[1]!.charAt(0)).toUpperCase();
};

const Sidebar = ({ role, userLabel, unreadCount }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuByRole: Record<string, { label: string; path?: string }[]> = {
    ADMIN: [
      { label: "Dashboard", path: "/" },
      { label: "Profile", path: "/profile" },
      { label: "Resources", path: "/resources" },
      { label: "Bookings", path: "/bookings" },
      { label: "Tickets" },
      { label: "Users" },
      { label: "Notifications", path: "/notifications" },
      { label: "Analytics" },
    ],
    USER: [
      { label: "Dashboard", path: "/" },
      { label: "My Bookings" },
      { label: "My Tickets" },
      { label: "Notifications", path: "/notifications" },
    ],
    STUDENT: [
      { label: "Dashboard", path: "/" },
      { label: "Profile", path: "/profile" },
      { label: "Resources", path: "/resources" },
      { label: "My Bookings", path: "/" },
      { label: "Notifications", path: "/notifications" },
    ],
    TECHNICIAN: [
      { label: "Dashboard", path: "/" },
      { label: "Profile", path: "/profile" },
      { label: "Assigned Tickets" },
      { label: "Work Updates" },
      { label: "Notifications", path: "/notifications" },
    ],
  };

  const iconByLabel: Record<string, string> = {
    Dashboard: "◫",
    Profile: "◉",
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
    Notifications: "/notifications",
  };

  const menuItems = menuByRole[role] ?? menuByRole.STUDENT;

  const displayName = userLabel || "Signed in";
  const avatar = initialsFrom(userLabel);

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
              (resolvedPath === "/resources" && location.pathname.startsWith("/resources")) ||
              (resolvedPath === "/bookings" && location.pathname.startsWith("/bookings")) ||
              (resolvedPath === "/profile" && location.pathname.startsWith("/profile")) ||
              (resolvedPath === "/notifications" && location.pathname.startsWith("/notifications"))
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
              {item.label === "Notifications" && unreadCount > 0 ? (
                <span className="menu-pill">{unreadCount > 99 ? "99+" : unreadCount}</span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="sidebar-profile-card">
        <div className="sidebar-profile-row">
          <div className="sidebar-avatar">{avatar}</div>
          <div>
            <p className="sidebar-profile-name">{displayName}</p>
            <p className="sidebar-profile-role">{role === "ADMIN" ? "Administrator" : role}</p>
          </div>
        </div>
        <button type="button" className="sidebar-logout" onClick={() => void logout()}>
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
