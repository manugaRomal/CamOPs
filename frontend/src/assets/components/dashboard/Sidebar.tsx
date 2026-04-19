//Sidebar.tsx

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
      { label: "Dashboard", path: "/" },
      { label: "Assigned Tickets", path: "/tickets" },
      { label: "Work Updates", path: "/work-updates" },
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
    </aside>
  );
};

export default Sidebar;