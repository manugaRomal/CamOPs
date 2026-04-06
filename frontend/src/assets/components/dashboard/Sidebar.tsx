//Sidebar.tsx

type SidebarProps = {
  role: string;
};

const Sidebar = ({ role }: SidebarProps) => {
  const menuByRole: Record<string, string[]> = {
    ADMIN: ["Dashboard", "Resources", "Bookings", "Tickets", "Users", "Notifications", "Analytics"],
    USER: ["Dashboard", "My Bookings", "My Tickets", "Notifications"],
    TECHNICIAN: ["Dashboard", "Assigned Tickets", "Work Updates", "Notifications"],
  };

  const menuItems = menuByRole[role] || ["Dashboard"];

  return (
    <aside className="sidebar">
      <div className="logo">CamOPs</div>
      <ul>
        {menuItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;