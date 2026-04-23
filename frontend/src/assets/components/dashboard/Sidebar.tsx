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
      { label: "Bookings" },
      { label: "Tickets" },
      { label: "Users" },
      { label: "Notifications" },
      { label: "Analytics" },
    ],
    USER: [{ label: "Dashboard", path: "/" }, { label: "My Bookings" }, { label: "My Tickets" }, { label: "Notifications" }],
    TECHNICIAN: [
      { label: "Dashboard", path: "/" },
      { label: "Assigned Tickets" },
      { label: "Work Updates" },
      { label: "Notifications" },
    ],
  };

  const menuItems = menuByRole[role] || [{ label: "Dashboard", path: "/" }];

  return (
    <aside className="sidebar">
      <div className="logo">CamOPs</div>
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.label}
            className={item.path && location.pathname === item.path ? "active-menu-item" : ""}
            onClick={() => {
              if (item.path) {
                navigate(item.path);
              }
            }}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;