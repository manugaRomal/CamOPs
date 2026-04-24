import { useNavigate } from "react-router-dom";

type QuickActionsProps = {
  actions: string[];
};

const QuickActions = ({ actions }: QuickActionsProps) => {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    switch (action) {
      case "Create Ticket":
        navigate("/tickets/create");
        break;
      case "My Tickets":
        navigate("/tickets");
        break;
      case "Book Resource":
        navigate("/bookings/create");
        break;
      case "View Notifications":
        navigate("/notifications");
        break;
      case "View Assigned Tickets":
        navigate("/technician/tickets");
        break;
      case "Manage Tickets":
        navigate("/admin/tickets");
        break;
      case "Add Resource":
        navigate("/resources/add");
        break;
      case "Approve Booking":
        navigate("/bookings");
        break;
      case "Manage Users":
        navigate("/users");
        break;
      default:
        break;
    }
  };

  return (
    <div className="panel">
      <h3>Quick Actions</h3>
      <div className="quick-actions">
        {actions.map((action, index) => (
          <button
            key={index}
            className="primary-btn"
            onClick={() => handleAction(action)}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;