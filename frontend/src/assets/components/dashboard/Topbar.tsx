//Topbar.tsx

import { useLocation } from "react-router-dom";

type TopbarProps = {
  role: string;
};

const Topbar = ({ role }: TopbarProps) => {
  const location = useLocation();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const currentPage = pathSegments[pathSegments.length - 1] ?? "dashboard";
  const pageLabel = currentPage
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <header className="topbar">
      <div className="topbar-copy">
        <h2>Smart Campus Operations Hub</h2>
        <p>
          <span className="topbar-role-tag">{role}</span>
          <span className="topbar-breadcrumb">
            {pathSegments.length === 0 ? "Dashboard" : `Resources / ${pageLabel}`}
          </span>
        </p>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <input type="text" placeholder="Search resources..." aria-label="Search resources" />
        </div>
        <span className="notification-icon">
          ∘
          <span className="notification-dot" />
        </span>
        <span className="profile-chip">{role}</span>
      </div>
    </header>
  );
};

export default Topbar;