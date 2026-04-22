import { useNavigate } from "react-router-dom";

type SidebarProps = {
  role: string;
};

const Sidebar = ({ role }: SidebarProps) => {
  const navigate = useNavigate();

  const menuByRole: Record<string, { label: string; path: string }[]> = {
    ADMIN: [
      { label: "Dashboard", path: "/" },
      { label: "Resources", path: "/resources" },
      { label: "Bookings", path: "/bookings" },
      { label: "Tickets", path: "/tickets" },
      { label: "Users", path: "/users" },
      { label: "Notifications", path: "/notifications" },
      { label: "Analytics", path: "/analytics" },
    ],
    USER: [
      { label: "Dashboard", path: "/" },
      { label: "My Bookings", path: "/bookings" },
      { label: "My Tickets", path: "/tickets" },
      { label: "Notifications", path: "/notifications" },
    ],
    TECHNICIAN: [
      { label: "Dashboard", path: "/technician" },
      { label: "Assigned Tickets", path: "/technician/tickets" },
      { label: "Notifications", path: "/notifications" },
    ],
  };

  const menuItems = menuByRole[role] ?? [{ label: "Dashboard", path: "/" }];

  return (
    <aside className="sidebar">
      <div className="logo">CamOPs</div>
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{ cursor: "pointer" }}
          >
            {item.label}
          </li>
        ))}
      </ul>

      {/* Temporary role switcher for testing - remove when auth is implemented */}
      <div style={{ position: "absolute", bottom: "1rem", left: "0", width: "100%", padding: "0 1rem", boxSizing: "border-box" }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "0.75rem" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", marginBottom: "0.5rem" }}>Switch View (Testing)</p>
          {role !== "USER" && (
            <button
              onClick={() => navigate("/")}
              style={{ width: "100%", padding: "0.4rem", borderRadius: "6px", border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontSize: "0.8rem", marginBottom: "0.4rem" }}
            >
              👤 User View
            </button>
          )}
          {role !== "TECHNICIAN" && (
            <button
              onClick={() => navigate("/technician")}
              style={{ width: "100%", padding: "0.4rem", borderRadius: "6px", border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontSize: "0.8rem" }}
            >
              🔧 Technician View
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;