//Topbar.tsx

type TopbarProps = {
  role: string;
};

const Topbar = ({ role }: TopbarProps) => {
  return (
    <header className="topbar">
      <div>
        <h2>Smart Campus Operations Hub</h2>
        <p>{role} Dashboard</p>
      </div>
      <div className="topbar-right">
        <span className="notification-icon">🔔 3</span>
        <span className="profile-chip">{role}</span>
      </div>
    </header>
  );
};

export default Topbar;