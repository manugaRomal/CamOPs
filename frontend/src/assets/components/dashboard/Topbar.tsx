//Topbar.tsx

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { shellRoleLabel } from "../../../auth/roleMap";

type TopbarProps = {
  role: string;
  userLabel: string;
  unreadCount: number;
};

const Topbar = ({ role, userLabel, unreadCount }: TopbarProps) => {
  const location = useLocation();
  const { logout } = useAuth();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumb =
    pathSegments.length === 0
      ? "Dashboard"
      : pathSegments
          .map((segment) => segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
          .join(" / ");

  const display = userLabel || "Signed in";
  const roleLabel = shellRoleLabel(role);

  return (
    <header className="topbar">
      <div className="topbar-copy">
        <h2>Smart Campus Operations Hub</h2>
        <p>
          <span className="topbar-role-tag">{roleLabel}</span>
          <span className="topbar-breadcrumb">{breadcrumb}</span>
        </p>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <input type="text" placeholder="Search resources..." aria-label="Search resources" />
        </div>
        <Link
          to="/notifications"
          className="notification-bell"
          title="Notifications"
          aria-label="Notifications"
        >
          <span className="notification-icon" aria-hidden>
            ◔
          </span>
          {unreadCount > 0 ? <span className="notification-dot" data-count={unreadCount} /> : null}
        </Link>
        <span className="profile-chip" title={display}>
          {display}
        </span>
        <button type="button" className="topbar-logout" onClick={() => void logout()}>
          Log out
        </button>
      </div>
    </header>
  );
};

export default Topbar;
